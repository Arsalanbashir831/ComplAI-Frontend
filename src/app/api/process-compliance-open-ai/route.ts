import { NextResponse } from 'next/server';
import OpenAI from 'openai'; // Import OpenAI library

// Make sure APIError type is available if needed for specific error handling
import { APIError } from 'openai/error';

// Adjust path
import { ComplianceResult } from '@/types/doc-compliance';
// Assuming highlighter.ts is in @/lib/highlighter
import { addMarksToHtmlContentWordByWord } from '@/lib/highlighter'; // Ensure this path is correct

// --- Interfaces (remain the same) ---
interface ProcessComplianceRequestBody {
  htmlContent: string;
  results: ComplianceResult[];
}

interface ProcessedResultItem extends ComplianceResult {
  highlightedOriginalHtml: string | null; // Snippet from OpenAI
  suggestionHtml: string | null; // Suggestion snippet from OpenAI
}

interface ProcessComplianceResponseBody {
  fullHighlightedHtml: string; // Highlighted using utility function
  processedResults: ProcessedResultItem[]; // Contains OpenAI snippets
}

// --- OpenAI Configuration ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Choose model: 'gpt-3.5-turbo', 'gpt-4-turbo-preview', 'gpt-4', etc.
const OPENAI_MODEL_NAME = 'gpt-4o';
const MAX_OUTPUT_TOKENS_SNIPPET = 1024; // Max tokens for individual snippet generation
const TEMPERATURE = 0.0; // Keep deterministic output

// --- Retry Configuration ---
const MAX_RETRIES = 3; // Fewer retries might be suitable
const INITIAL_BACKOFF_MS = 1000;
const BACKOFF_FACTOR = 2;

// --- Helper function sleep ---
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- OpenAI Client Initialization ---
// Ensure API key exists before initializing
let openai: OpenAI | null = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
    // Optional: configure maxRetries directly if preferred over custom logic
    // maxRetries: 2,
  });
} else {
  console.error('OpenAI API key not configured. Check environment variables.');
}

// --- New Helper function callOpenAI with Retry Logic ---
async function callOpenAI(
  messages: OpenAI.Chat.ChatCompletionMessageParam[], // Use OpenAI message format
  callType: string,
  attempt = 0
): Promise<string | null> {
  if (!openai) {
    // Check if client initialized
    console.error(`OpenAI client not initialized (${callType}).`);
    return null;
  }

  console.log(
    `\n--- Sending Prompt to OpenAI (${callType}, Attempt ${attempt + 1}/${MAX_RETRIES + 1}) ---`
  );
  // console.log("Messages:", JSON.stringify(messages, null, 2));
  console.log(`--- [End Prompt (${callType})] ---`);

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_NAME,
      messages: messages,
      temperature: TEMPERATURE,
      max_tokens: MAX_OUTPUT_TOKENS_SNIPPET, // Max tokens for this specific call
      // top_p: 1, // Usually not needed with temperature 0
      // frequency_penalty: 0,
      // presence_penalty: 0,
    });

    const responseText = completion.choices[0]?.message?.content;
    const finishReason = completion.choices[0]?.finish_reason;

    console.log(`OpenAI Finish Reason (${callType}): ${finishReason}`);

    if (finishReason !== 'stop' && finishReason !== 'length') {
      console.warn(
        `OpenAI Warning (${callType}): Unexpected finish reason: ${finishReason}`
      );
      // Potentially handle content filter or other reasons
      if (finishReason === 'content_filter') {
        console.error(
          `OpenAI Error (${callType}): Response blocked by content filter.`
        );
        return null; // Or handle appropriately
      }
    }

    if (!responseText) {
      console.warn(`OpenAI Warning (${callType}): No response text received.`);
      return null;
    }

    // Clean the response (remove potential markdown fences, trim)
    const cleanedText =
      responseText
        .trim()
        .replace(/^```html\s*|```$/g, '') // Remove markdown html code fences
        .replace(/^```\s*|```$/g, '') // Remove generic markdown code fences
        .trim() ?? '';

    if (cleanedText.length === 0 && responseText.length > 0) {
      console.warn(
        `OpenAI Warning (${callType}): Response became empty after cleaning.`
      );
    } else if (cleanedText.length === 0) {
      // console.warn(`OpenAI Warning (${callType}): Cleaned response is empty.`); // Less verbose
    }

    // console.log(`OpenAI Raw Response (${callType}): "${responseText.substring(0,100)}..."`);
    return cleanedText || null; // Return null if cleanedText is empty
  } catch (error: unknown) {
    console.error(
      `Error during OpenAI call (${callType}, Attempt ${attempt + 1}):`,
      error
    );

    let status: number | undefined = undefined;
    // Check if it's an APIError from the openai library to get status code
    if (error instanceof APIError) {
      status = error.status;
    }
    // Add more specific error type checks if needed based on library version/usage

    const isRateLimitError = status === 429;
    // Consider retrying common server errors as well
    const isServerError = status && status >= 500 && status < 600;
    const isRetriable = isRateLimitError || isServerError;

    if (isRetriable && attempt < MAX_RETRIES) {
      // Basic exponential backoff (OpenAI SDK might handle some retries automatically)
      const delayMs = INITIAL_BACKOFF_MS * Math.pow(BACKOFF_FACTOR, attempt);
      const jitterMs = Math.random() * 500; // Smaller jitter?
      const waitMs = delayMs + jitterMs;

      console.warn(
        `Retriable error (status ${status || 'unknown'}) hit (${callType}). Retrying attempt ${attempt + 2} after ${Math.round(waitMs / 1000)}s...`
      );
      await sleep(waitMs);
      return callOpenAI(messages, callType, attempt + 1); // Retry
    } else if (isRetriable) {
      console.error(
        `Retriable error persisted after ${MAX_RETRIES + 1} attempts (${callType}). Giving up.`
      );
      return null; // Failed after retries
    } else {
      // Non-retriable error
      console.error(
        `Non-retriable error during OpenAI call (${callType}):`,
        error
      );
      return null;
    }
  }
}

// --- Main POST Handler ---
export async function POST(request: Request) {
  // Check if OpenAI client initialized successfully
  if (!openai) {
    return NextResponse.json(
      {
        error: 'OpenAI API key not configured or client failed to initialize.',
      },
      { status: 500 }
    );
  }

  let body: ProcessComplianceRequestBody;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { htmlContent, results } = body;
  if (!htmlContent || !results || !Array.isArray(results)) {
    return NextResponse.json(
      { error: 'Invalid input: htmlContent and results array are required.' },
      { status: 400 }
    );
  }

  // === Step 1: Generate Snippets for each result using OpenAI (SEQUENTIALLY with Retries) ===
  const processedResults: ProcessedResultItem[] = [];

  console.log(
    `\n--- Starting Sequential Snippet Generation via OpenAI for ${results.length} results ---`
  );
  for (const [index, result] of results.entries()) {
    if (!result.compliant && result.original) {
      const logPrefix = `Result ${index + 1} (Original: "${result.original.substring(0, 50)}...")`;

      let finalHighlightedOriginalHtml: string | null = null;
      let finalSuggestionHtml: string | null = null;

      // --- Get highlightedOriginalHtml snippet ---
      const highlightMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            "You are an expert HTML analyzer. Precisely locate the HTML fragment for the 'Text To Find' within the 'Original Full HTML Content', focusing on the immediate parent element. Return ONLY the extracted HTML fragment, modified by wrapping ONLY the matching text parts with <mark style=\"background-color: #ff000077;\"> tags. Preserve original tags/attributes. If split across tags, mark each part. If not found, return ONLY the single word 'NOT_FOUND'.",
        },
        {
          role: 'user',
          content: `Original Full HTML Content:\n\`\`\`html\n${htmlContent}\n\`\`\`\n\nText To Find:\n"${result.original}"\n\nExtracted and Marked HTML Segment:`,
        },
      ];

      const highlightedOriginalHtmlResult = await callOpenAI(
        highlightMessages,
        `${logPrefix} - OriginalHighlight`
      );

      if (
        highlightedOriginalHtmlResult === 'NOT_FOUND' ||
        highlightedOriginalHtmlResult === null
      ) {
        finalHighlightedOriginalHtml = null;
      } else {
        finalHighlightedOriginalHtml = highlightedOriginalHtmlResult;
      }

      // --- Get suggestionHtml snippet ---
      if (result.suggestion) {
        const suggestionMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          {
            role: 'system',
            content:
              "You are an expert HTML content generator. Using the 'Original Full HTML Content' for context around the 'Reference Text', generate a *plain* HTML fragment for the 'Suggested Text' that fits naturally into that structural context (e.g., wrap in <li> if reference was in <li>). Do NOT add <mark> tags. Preserve relevant structure. If context is unclear or inappropriate, wrap suggestion in a simple <p> tag. Return ONLY the generated HTML fragment.",
          },
          {
            role: 'user',
            content: `Original Full HTML Content:\n\`\`\`html\n${htmlContent}\n\`\`\`\n\nReference Text (for context):\n"${result.original}"\n\nSuggested Text:\n"${result.suggestion}"\n\nGenerated Plain HTML Fragment for Suggestion:`,
          },
        ];

        finalSuggestionHtml = await callOpenAI(
          suggestionMessages,
          `${logPrefix} - SuggestionHTML`
        );
        if (finalSuggestionHtml === null) {
          console.log(`Suggestion generation failed for ${logPrefix}`);
        }
      } else {
        finalSuggestionHtml = null;
      }

      processedResults.push({
        ...result,
        highlightedOriginalHtml: finalHighlightedOriginalHtml,
        suggestionHtml: finalSuggestionHtml,
      });
    } else {
      // Pass through compliant items or items without original text
      processedResults.push({
        ...result,
        highlightedOriginalHtml: null,
        suggestionHtml: null,
      });
    }
  }
  console.log('\nSequential OpenAI snippet generation completed.');

  // === Step 2: Generate fullHighlightedHtml using Utility Function (Remains the same) ===
  const allNonCompliantResultsForFullHighlight = results.filter(
    (r) => !r.compliant && r.original
  );
  console.log(
    `Found ${allNonCompliantResultsForFullHighlight.length} non-compliant items for full highlighting utility.`
  );
  const fullHighlightedHtml = addMarksToHtmlContentWordByWord(
    htmlContent,
    allNonCompliantResultsForFullHighlight
  );
  console.log('Full HTML highlighting completed using utility function.');

  // === Step 3: Structure and Return Final Response (Remains the same) ===
  console.log('\n--- Final Processed Results (Snippets via OpenAI) ---');
  processedResults.forEach((item, index) => {
    console.log(
      `Item ${index + 1}/${processedResults.length}: Compliant: ${item.compliant}, HasOpenAIHighlight: ${!!item.highlightedOriginalHtml}, HasOpenAISuggestion: ${!!item.suggestionHtml}`
    );
  });
  console.log('--- ---');

  const responsePayload: ProcessComplianceResponseBody = {
    fullHighlightedHtml, // Generated by utility function
    processedResults, // Contains snippets generated by OpenAI
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
