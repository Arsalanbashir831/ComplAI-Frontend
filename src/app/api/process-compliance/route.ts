import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

// Adjust path
import { ComplianceResult } from '@/types/doc-compliance';
import { addMarksToHtmlContentWordByWord } from '@/lib/highlighter';

interface ProcessComplianceRequestBody {
  htmlContent: string;
  results: ComplianceResult[];
}

interface ProcessedResultItem extends ComplianceResult {
  highlightedOriginalHtml: string | null;
  suggestionHtml: string | null;
}

interface ProcessComplianceResponseBody {
  fullHighlightedHtml: string;
  processedResults: ProcessedResultItem[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-1.5-pro';
const generationConfig = {
  temperature: 0.0,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024, // Snippets are usually small
};
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Helper function callGemini (keep the detailed logging)
async function callGemini(
  prompt: string,
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  callType: string
): Promise<string | null> {
  // ... (Keep the previous version with logging) ...
  console.log(`\n--- Sending Prompt to Gemini (${callType}) ---`);
  console.log(`--- [End Prompt (${callType})] ---`);
  try {
    const result = await model.generateContent(prompt);
    if (!result.response) {
      /* Log errors/feedback */ return null;
    }
    const finishReason = result.response.candidates?.[0]?.finishReason;
    const safetyRatings = result.response.candidates?.[0]?.safetyRatings;
    console.log(`Gemini Finish Reason (${callType}): ${finishReason}`);
    if (safetyRatings) {
      /* Log ratings */
    }
    if (
      finishReason !== 'STOP' &&
      finishReason !== 'MAX_TOKENS' &&
      finishReason !== 'FINISH_REASON_UNSPECIFIED'
    ) {
      /* Log warning */
    }
    const responseText = result.response.text();
    console.log(`Gemini Raw Response (${callType}): "${responseText}"`);
    const cleanedText =
      responseText
        ?.trim()
        .replace(/^```html\s*|```$/g, '')
        .trim() ?? '';
    if (cleanedText.length === 0) {
      /* Log empty */ return null;
    }
    return cleanedText;
  } catch (error) {
    console.error(`Error during Gemini call (${callType}):`, error);
    /* Log errors, check 429 */ return null;
  }
}

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    /* ... */ return NextResponse.json(
      { error: 'API key not configured.' },
      { status: 500 }
    );
  }
  let body: ProcessComplianceRequestBody;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    /* ... */ return NextResponse.json(
      { error: 'Invalid JSON.' },
      { status: 400 }
    );
  }
  const { htmlContent, results } = body;
  if (!htmlContent || !results || !Array.isArray(results)) {
    /* ... */ return NextResponse.json(
      { error: 'Invalid input.' },
      { status: 400 }
    );
  }

  // === Step 1: Generate fullHighlightedHtml using Utility Function ===
  const nonCompliantResultsForFullHighlight = results.filter(
    (r) => !r.compliant && r.original
  );
  console.log(
    `Found ${nonCompliantResultsForFullHighlight.length} non-compliant items for full highlighting.`
  );
  const fullHighlightedHtml = addMarksToHtmlContentWordByWord(
    htmlContent,
    nonCompliantResultsForFullHighlight
  );
  console.log('Full HTML highlighting completed using utility function.');

  // === Step 2: Generate Snippets using Gemini (NO DELAYS) ===
  const processedResults: ProcessedResultItem[] = [];
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // *** Ensure model name change here too ***
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig,
    safetySettings,
  });

  // Process calls potentially in parallel for speed, but watch for rate limits even with Flash
  const processingPromises = results.map(
    async (result): Promise<ProcessedResultItem> => {
      if (!result.compliant && result.original) {
        const logPrefix = `Snippets for original: "${result.original.substring(0, 50)}..."`;
        console.log(`\nProcessing ${logPrefix} (potentially parallel)`);

        // --- Get highlightedOriginalHtml ---
        const originalHighlightPrompt = `
You are an expert HTML analyzer. Given the 'Original Full HTML Content' and a specific 'Text To Find', precisely locate the HTML fragment(s) corresponding to the 'Text To Find'. Focus on the immediate parent element (like <p>, <li>, <b>) containing the text. Return ONLY that extracted HTML fragment, modified by wrapping ONLY the text parts exactly matching 'Text To Find' with <mark style="background-color: #ff000077;"> tags. Preserve original tags/attributes within the fragment. If the exact text is split across tags, mark each part within its tag structure. If the exact text cannot be located precisely, return the single word "NOT_FOUND".

Original Full HTML Content:
\`\`\`html
${htmlContent}
\`\`\`

Text To Find:
"${result.original}"

Extracted and Marked HTML Segment:`;
        const highlightedOriginalHtmlResult = await callGemini(
          originalHighlightPrompt,
          model,
          `${logPrefix} - OriginalHighlight`
        );
        const finalHighlightedOriginalHtml =
          highlightedOriginalHtmlResult === 'NOT_FOUND' ||
          highlightedOriginalHtmlResult === null
            ? null
            : highlightedOriginalHtmlResult;

        // --- Get suggestionHtml ---
        let finalSuggestionHtml = null;
        if (result.suggestion) {
          const suggestionPlainPrompt = `
You are an expert HTML content generator. Look at the 'Original Full HTML Content' to understand the typical HTML structure around text similar to the 'Reference Text'. Generate a *plain* HTML fragment for the 'Suggested Text' that fits naturally into that structural context (e.g., if reference is in an <li>, wrap suggestion in <li>). Do NOT add any <mark> tags. Preserve relevant structural tags from the context if appropriate. If context is unclear or structural tags seem inappropriate for the suggestion, return the 'Suggested Text' wrapped in a simple <p> tag as a fallback. Return ONLY the generated HTML fragment.

Original Full HTML Content:
\`\`\`html
${htmlContent}
\`\`\`

Reference Text (for context):
"${result.original}"

Suggested Text:
"${result.suggestion}"

Generated Plain HTML Fragment for Suggestion:`;
          finalSuggestionHtml = await callGemini(
            suggestionPlainPrompt,
            model,
            `${logPrefix} - SuggestionHTML`
          );
        } else {
          console.log(`No suggestion provided for ${logPrefix}`);
        }

        return {
          ...result,
          highlightedOriginalHtml: finalHighlightedOriginalHtml,
          suggestionHtml: finalSuggestionHtml,
        };
      } else {
        // Pass through compliant items
        return {
          ...result,
          highlightedOriginalHtml: null,
          suggestionHtml: null,
        };
      }
    }
  );

  // Wait for all processing to complete
  const settledResults = await Promise.allSettled(processingPromises);

  // Collect results, handling potential errors during parallel execution if any promise rejected
  settledResults.forEach((settledResult, index) => {
    if (settledResult.status === 'fulfilled') {
      processedResults.push(settledResult.value);
    } else {
      // Handle rejected promise (e.g., unexpected error within the map function)
      console.error(
        `Error processing result index ${index}:`,
        settledResult.reason
      );
      // Add the original result back with null snippets as a fallback
      processedResults.push({
        ...results[index], // Get original result data
        highlightedOriginalHtml: null,
        suggestionHtml: null,
      });
    }
  });

  console.log('\nSnippet generation completed.');

  // === Step 3: Structure and Return Final Response ===
  // ADD THIS FOR DEBUGGING: Log the final state before returning
  console.log('\n--- Final Processed Results ---');
  processedResults.forEach((item, index) => {
    console.log(`Item ${index}:`);
    console.log(
      `  Original Provided: ${item.original ? '"' + item.original.substring(0, 50) + '..."' : 'N/A'}`
    );
    console.log(`  Compliant: ${item.compliant}`);
    console.log(
      `  => highlightedOriginalHtml: ${item.highlightedOriginalHtml ? '"' + item.highlightedOriginalHtml.substring(0, 80) + '..."' : 'null'}`
    );
    console.log(
      `  => suggestionHtml: ${item.suggestionHtml ? '"' + item.suggestionHtml.substring(0, 80) + '..."' : 'null'}`
    );
  });
  console.log('--- ---');

  const responsePayload: ProcessComplianceResponseBody = {
    fullHighlightedHtml,
    processedResults,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
