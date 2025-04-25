// import { NextResponse } from 'next/server';
// import {
//   GoogleGenerativeAI,
//   HarmBlockThreshold,
//   HarmCategory,
// } from '@google/generative-ai';

// // Adjust path
// import { ComplianceResult } from '@/types/doc-compliance';
// // Assuming highlighter.ts is in @/lib/highlighter
// import { addMarksToHtmlContentWordByWord } from '@/lib/highlighter'; // Ensure this path is correct

// // --- Interfaces (remain the same) ---
// interface ProcessComplianceRequestBody {
//   htmlContent: string;
//   results: ComplianceResult[];
// }

// interface ProcessedResultItem extends ComplianceResult {
//   highlightedOriginalHtml: string | null; // Snippet from Gemini
//   suggestionHtml: string | null; // Suggestion snippet from Gemini
// }

// interface ProcessComplianceResponseBody {
//   fullHighlightedHtml: string; // Highlighted using utility function
//   processedResults: ProcessedResultItem[]; // Contains Gemini snippets
// }

// // --- Constants, Config, Sleep, callGemini (remain the same as previous version) ---
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const MODEL_NAME = 'gemini-1.5-pro';
// const generationConfig = {
//   temperature: 0.0,
//   topK: 1,
//   topP: 1,
//   maxOutputTokens: 1024,
// };
// const safetySettings = [
//   {
//     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
//   {
//     category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
//   },
// ];
// const MAX_RETRIES = 5;
// const INITIAL_BACKOFF_MS = 1000;
// const BACKOFF_FACTOR = 2;

// function sleep(ms: number): Promise<void> {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// async function callGemini(
//   prompt: string,
//   model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
//   callType: string,
//   attempt = 0
// ): Promise<string | null> {
//   console.log(
//     `\n--- Sending Prompt to Gemini (${callType}, Attempt ${attempt + 1}/${MAX_RETRIES + 1}) ---`
//   );
//   // console.log(prompt); // Keep logging prompts if needed for debugging
//   console.log(`--- [End Prompt (${callType})] ---`);
//   try {
//     const result = await model.generateContent(prompt);
//     // --- Successful response handling ---
//     if (!result.response) {
//       console.warn(`Gemini Warning (${callType}): No response object.`);
//       return null;
//     }
//     const finishReason = result.response.candidates?.[0]?.finishReason;
//     // Optional: Add detailed logging back if needed
//     // console.log(`Gemini Finish Reason (${callType}): ${finishReason}`);
//     // ... safety ratings log ...

//     if (
//       finishReason !== 'STOP' &&
//       finishReason !== 'MAX_TOKENS' &&
//       finishReason !== 'FINISH_REASON_UNSPECIFIED'
//     ) {
//       console.warn(
//         `Gemini Warning (${callType}): Unexpected finish reason: ${finishReason}`
//       );
//     }

//     const responseText = result.response.text();
//     // console.log(`Gemini Raw Response (${callType}): "${responseText.substring(0, 100)}..."`); // Log snippet
//     const cleanedText =
//       responseText
//         ?.trim()
//         .replace(/^```html\s*|```$/g, '') // Remove markdown code fences
//         .replace(/^```\s*|```$/g, '') // Remove generic markdown code fences
//         .trim() ?? '';
//     if (cleanedText.length === 0 && responseText.length > 0) {
//       console.warn(
//         `Gemini Warning (${callType}): Response became empty after cleaning.`
//       );
//     } else if (cleanedText.length === 0) {
//       // console.warn(`Gemini Warning (${callType}): Cleaned response is empty.`); // Less verbose
//     }
//     return cleanedText || null;
//   } catch (error: unknown) {
//     // --- Error Handling & Retry Logic (same as before) ---
//     const err = error as {
//       message?: string;
//       status?: number;
//       errorDetails?: any[];
//       cause?: { errorDetails?: any[] };
//     }; // More specific type for details
//     // console.error(`Error during Gemini call (${callType}, Attempt ${attempt + 1}):`, err.message); // Less verbose logging

//     const isRateLimitError = err.message?.includes('429') || err.status === 429;

//     if (isRateLimitError && attempt < MAX_RETRIES) {
//       const delayMs = INITIAL_BACKOFF_MS * Math.pow(BACKOFF_FACTOR, attempt);
//       const jitterMs = Math.random() * 1000;
//       let suggestedDelay = 0;
//       try {
//         // Use optional chaining and provide a default empty array
//         const details = (err.errorDetails ||
//           err.cause?.errorDetails ||
//           []) as Array<Record<string, any>>;
//         const retryInfo = details.find(
//           (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
//         );
//         if (retryInfo?.retryDelay && typeof retryInfo.retryDelay === 'string') {
//           const delayStr = retryInfo.retryDelay.replace('s', '');
//           suggestedDelay = parseInt(delayStr, 10) * 1000;
//         }
//       } catch (parseError) {
//         console.warn(`Could not parse suggested retry delay: ${parseError}`);
//       }

//       const waitMs =
//         suggestedDelay > 0
//           ? Math.max(suggestedDelay, delayMs + jitterMs)
//           : delayMs + jitterMs;
//       console.warn(
//         `Rate limit hit (${callType}). Retrying attempt ${attempt + 2} after ${Math.round(waitMs / 1000)}s...`
//       );
//       await sleep(waitMs);
//       return callGemini(prompt, model, callType, attempt + 1); // Retry
//     } else if (isRateLimitError) {
//       console.error(
//         `Rate limit error persisted after ${MAX_RETRIES + 1} attempts (${callType}). Giving up.`
//       );
//       return null;
//     } else {
//       console.error(
//         `Non-retriable error during Gemini call (${callType}):`,
//         error
//       );
//       return null;
//     }
//   }
// }

// // --- Main POST Handler ---
// export async function POST(request: Request) {
//   if (!GEMINI_API_KEY) {
//     return NextResponse.json(
//       { error: 'API key not configured.' },
//       { status: 500 }
//     );
//   }

//   let body: ProcessComplianceRequestBody;
//   try {
//     body = await request.json();
//   } catch (error) {
//     console.error('Error parsing request body:', error);
//     return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
//   }

//   const { htmlContent, results } = body;
//   if (!htmlContent || !results || !Array.isArray(results)) {
//     return NextResponse.json(
//       { error: 'Invalid input: htmlContent and results array are required.' },
//       { status: 400 }
//     );
//   }

//   // === Step 1: Generate Snippets for each result using Gemini (SEQUENTIALLY with Retries) ===
//   const processedResults: ProcessedResultItem[] = [];
//   const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
//   const model = genAI.getGenerativeModel({
//     model: MODEL_NAME,
//     generationConfig,
//     safetySettings,
//   });

//   console.log(
//     `\n--- Starting Sequential Snippet Generation for ${results.length} results ---`
//   );
//   for (const [index, result] of results.entries()) {
//     // console.log(`\nProcessing result ${index + 1}/${results.length}...`); // Less verbose

//     if (!result.compliant && result.original) {
//       const logPrefix = `Result ${index + 1} (Original: "${result.original.substring(0, 50)}...")`;
//       // console.log(`Generating snippets for ${logPrefix}`); // Less verbose

//       let finalHighlightedOriginalHtml: string | null = null;
//       let finalSuggestionHtml: string | null = null;

//       // --- Get highlightedOriginalHtml snippet ---
//       const originalHighlightPrompt = `
// You are an expert HTML analyzer. Given the 'Original Full HTML Content' and a specific 'Text To Find', precisely locate the HTML fragment(s) corresponding to the 'Text To Find'. Focus on the immediate parent element (like <p>, <li>, <b>) containing the text. Return ONLY that extracted HTML fragment, modified by wrapping ONLY the text parts exactly matching 'Text To Find' with <mark style="background-color: #ff000077;"> tags. Preserve original tags/attributes within the fragment. If the exact text is split across tags, mark each part within its tag structure. If the exact text cannot be located precisely, return the single word "NOT_FOUND".

// Original Full HTML Content:
// \`\`\`html
// ${htmlContent}
// \`\`\`

// Text To Find:
// "${result.original}"

// Extracted and Marked HTML Segment:`;
//       const highlightedOriginalHtmlResult = await callGemini(
//         originalHighlightPrompt,
//         model,
//         `${logPrefix} - OriginalHighlight`
//       );

//       if (
//         highlightedOriginalHtmlResult === 'NOT_FOUND' ||
//         highlightedOriginalHtmlResult === null
//       ) {
//         // console.log(`Original text snippet not found or failed for ${logPrefix}`); // Less verbose
//         finalHighlightedOriginalHtml = null;
//       } else {
//         finalHighlightedOriginalHtml = highlightedOriginalHtmlResult;
//       }

//       // --- Get suggestionHtml snippet ---
//       if (result.suggestion) {
//         const suggestionPlainPrompt = `
// You are an expert HTML content generator. Look at the 'Original Full HTML Content' to understand the typical HTML structure around text similar to the 'Reference Text'. Generate a *plain* HTML fragment for the 'Suggested Text' that fits naturally into that structural context (e.g., if reference is in an <li>, wrap suggestion in <li>). Do NOT add any <mark> tags. Preserve relevant structural tags from the context if appropriate. If context is unclear or structural tags seem inappropriate for the suggestion, return the 'Suggested Text' wrapped in a simple <p> tag as a fallback. Return ONLY the generated HTML fragment.

// Original Full HTML Content:
// \`\`\`html
// ${htmlContent}
// \`\`\`

// Reference Text (for context):
// "${result.original}"

// Suggested Text:
// "${result.suggestion}"

// Generated Plain HTML Fragment for Suggestion:`;
//         finalSuggestionHtml = await callGemini(
//           suggestionPlainPrompt,
//           model,
//           `${logPrefix} - SuggestionHTML`
//         );
//         if (finalSuggestionHtml === null) {
//           console.log(`Suggestion generation failed for ${logPrefix}`);
//         }
//       } else {
//         // console.log(`No suggestion provided for ${logPrefix}`); // Less verbose
//         finalSuggestionHtml = null;
//       }

//       // Add the processed result with potentially null Gemini snippets
//       processedResults.push({
//         ...result,
//         highlightedOriginalHtml: finalHighlightedOriginalHtml, // May be null
//         suggestionHtml: finalSuggestionHtml, // May be null
//       });
//     } else {
//       // Pass through compliant items or items without original text
//       // console.log(`Result ${index + 1}/${results.length}: Compliant or no original text, skipping Gemini calls.`); // Less verbose
//       processedResults.push({
//         ...result,
//         highlightedOriginalHtml: null,
//         suggestionHtml: null,
//       });
//     }
//     // Optional delay removed for faster processing, rely on backoff
//     // await sleep(50);
//   }
//   console.log('\nSequential snippet generation completed.');

//   // === Step 2: Generate fullHighlightedHtml using Utility Function ===
//   // Filter the *original results* to find all non-compliant items that need highlighting in the full view
//   const allNonCompliantResultsForFullHighlight = results.filter(
//     (r) => !r.compliant && r.original
//   );
//   console.log(
//     `Found ${allNonCompliantResultsForFullHighlight.length} non-compliant items for full highlighting utility.`
//   );

//   // Generate the full highlighted HTML using the utility function ONCE
//   const fullHighlightedHtml = addMarksToHtmlContentWordByWord(
//     htmlContent, // Use the original, unmodified HTML content
//     allNonCompliantResultsForFullHighlight
//   );
//   console.log('Full HTML highlighting completed using utility function.');

//   // === Step 3: Structure and Return Final Response ===
//   console.log('\n--- Final Processed Results (Snippets) ---');
//   processedResults.forEach((item, index) => {
//     console.log(
//       `Item ${index + 1}/${processedResults.length}: Compliant: ${item.compliant}, HasGeminiHighlight: ${!!item.highlightedOriginalHtml}, HasGeminiSuggestion: ${!!item.suggestionHtml}`
//     );
//     // console.log(`  Original: ${item.original ? '"' + item.original.substring(0, 50) + '..."' : 'N/A'}`);
//     // console.log(`  => highlightedOriginalHtml: ${item.highlightedOriginalHtml ? '"' + item.highlightedOriginalHtml.substring(0, 80) + '..."' : 'null'}`);
//     // console.log(`  => suggestionHtml: ${item.suggestionHtml ? '"' + item.suggestionHtml.substring(0, 80) + '..."' : 'null'}`);
//   });
//   console.log('--- ---');

//   const responsePayload: ProcessComplianceResponseBody = {
//     fullHighlightedHtml, // Generated by utility function
//     processedResults, // Contains snippets generated by Gemini
//   };

//   return NextResponse.json(responsePayload, { status: 200 });
// }

import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

// Adjust path
import { ComplianceResult } from '@/types/doc-compliance';
// Assuming highlighter.ts is in @/lib/highlighter
import { addMarksToHtmlContentWordByWord } from '@/lib/highlighter'; // Ensure this path is correct

// --- Interfaces ---
interface ProcessComplianceRequestBody {
  htmlContent: string;
  results: ComplianceResult[];
}

// Input item structure for the batch prompt
interface BatchInputItem {
  index: number; // Original index to map results back
  original: string;
  suggestion: string | null | undefined;
}

// Expected output item structure from Gemini (within the JSON response)
interface BatchOutputItem {
  index: number;
  highlightedOriginalHtml: string | null;
  suggestionHtml: string | null;
  error?: string; // Optional field for Gemini to report item-specific errors
}

interface ProcessedResultItem extends ComplianceResult {
  highlightedOriginalHtml: string | null;
  suggestionHtml: string | null;
}

interface ProcessComplianceResponseBody {
  fullHighlightedHtml: string;
  processedResults: ProcessedResultItem[];
}

// --- Constants ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Use 1.5 Pro for its large context window, suitable for batching
const MODEL_NAME = 'gemini-1.5-pro';

// --- IMPORTANT: Adjust Generation Config for Batch ---
const generationConfig = {
  temperature: 0.0,
  topK: 1,
  topP: 1,
  // INCREASE MAX OUTPUT TOKENS SIGNIFICANTLY FOR BATCH JSON RESPONSE
  maxOutputTokens: 8192, // Example: 8K tokens, adjust based on expected output size
  // Consider adding responseMimeType: "application/json" if supported by the SDK version
  // responseMimeType: "application/json", // This enforces JSON output
};

// --- Safety Settings (remain the same) ---
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

// --- Retry Config, Sleep, callGemini (remain the same) ---
// callGemini now handles retries for the single batch request
const MAX_RETRIES = 3; // Reduce retries for potentially longer batch calls?
const INITIAL_BACKOFF_MS = 1500;
const BACKOFF_FACTOR = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(
  prompt: string,
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  callType: string,
  attempt = 0
): Promise<string | null> {
  console.log(
    `\n--- Sending Prompt to Gemini (${callType}, Attempt ${attempt + 1}/${MAX_RETRIES + 1}) ---`
  );
  console.log(`--- [End Prompt (${callType})] ---`);
  try {
    // Make sure to pass the updated generationConfig if using JSON mode
    // const result = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig });
    const result = await model.generateContent(prompt); // Simpler call if not using explicit JSON mode

    if (!result.response) {
      console.warn(`Gemini Warning (${callType}): No response object.`);
      return null;
    }
    const finishReason = result.response.candidates?.[0]?.finishReason;
    if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
      console.warn(
        `Gemini Warning (${callType}): Unexpected finish reason: ${finishReason}`
      );
      if (finishReason === 'SAFETY') {
        console.error('Gemini Error: Response blocked due to safety settings.');
        // Log safety ratings if available
        const safetyRatings = result.response.candidates?.[0]?.safetyRatings;
        if (safetyRatings)
          console.error('Safety Ratings:', JSON.stringify(safetyRatings));
        return `{"error": "Response blocked due to safety settings"}`; // Return error JSON
      }
      if (finishReason === 'RECITATION') {
        console.error(
          'Gemini Error: Response blocked due to recitation policy.'
        );
        return `{"error": "Response blocked due to recitation policy"}`; // Return error JSON
      }
      // Handle other non-STOP reasons if necessary
    }

    if (!result.response.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn(`Gemini Warning (${callType}): Response text is missing.`);
      return null;
    }

    const responseText = result.response.text(); // Use text() helper

    // Basic check if it looks like JSON before returning
    const trimmedResponse = responseText.trim();
    if (
      (trimmedResponse.startsWith('{') && trimmedResponse.endsWith('}')) ||
      (trimmedResponse.startsWith('[') && trimmedResponse.endsWith(']'))
    ) {
      console.log(
        `Gemini Raw Response (${callType}): Looks like JSON, length ${trimmedResponse.length}`
      );
      return trimmedResponse;
    } else {
      console.warn(
        `Gemini Warning (${callType}): Response does not look like JSON: ${responseText.substring(0, 200)}...`
      );
      // Attempt to extract JSON if wrapped in markdown
      const jsonMatch = trimmedResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        console.log(`Gemini (${callType}): Extracted JSON from markdown.`);
        return jsonMatch[1].trim();
      }
      // Return null or throw error if response is not JSON as expected
      console.error(
        `Gemini Error (${callType}): Expected JSON response, but got something else.`
      );
      // You might want to return a specific error format here
      // e.g., return JSON.stringify({ error: "Invalid response format from Gemini" });
      return null;
    }
  } catch (error: unknown) {
    // --- Error Handling & Retry Logic (same as before) ---
    const err = error as {
      message?: string;
      status?: number;
      errorDetails?: unknown[];
      cause?: { errorDetails?: unknown[] };
    };
    const isRateLimitError = err.message?.includes('429') || err.status === 429;

    if (isRateLimitError && attempt < MAX_RETRIES) {
      // ... (backoff and retry logic remains the same) ...
      const delayMs = INITIAL_BACKOFF_MS * Math.pow(BACKOFF_FACTOR, attempt);
      const jitterMs = Math.random() * 1000;
      let suggestedDelay = 0;
      try {
        const details = (err.errorDetails ||
          err.cause?.errorDetails ||
          []) as Array<Record<string, unknown>>;
        const retryInfo = details.find(
          (d) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );
        if (retryInfo?.retryDelay && typeof retryInfo.retryDelay === 'string') {
          const delayStr = retryInfo.retryDelay.replace('s', '');
          suggestedDelay = parseInt(delayStr, 10) * 1000;
        }
      } catch (parseError) {
        console.warn(`Could not parse suggested retry delay: ${parseError}`);
      }
      const waitMs =
        suggestedDelay > 0
          ? Math.max(suggestedDelay, delayMs + jitterMs)
          : delayMs + jitterMs;
      console.warn(
        `Rate limit hit (${callType}). Retrying attempt ${attempt + 2} after ${Math.round(waitMs / 1000)}s...`
      );
      await sleep(waitMs);
      return callGemini(prompt, model, callType, attempt + 1);
    } else if (isRateLimitError) {
      console.error(
        `Rate limit error persisted after ${MAX_RETRIES + 1} attempts (${callType}). Giving up.`
      );
      // Return an error structure that the main function can parse
      return `{"error": "API rate limit exceeded after retries"}`;
    } else {
      console.error(
        `Non-retriable error during Gemini call (${callType}):`,
        error
      );
      return `{"error": "An unexpected error occurred during the API call"}`;
    }
  }
}

// --- Main POST Handler (Batch Version) ---
export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'API key not configured.' },
      { status: 500 }
    );
  }

  let body: ProcessComplianceRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { htmlContent, results } = body;
  if (!htmlContent || !results || !Array.isArray(results)) {
    return NextResponse.json(
      { error: 'Invalid input: htmlContent and results array are required.' },
      { status: 400 }
    );
  }

  // --- Step 1: Prepare Data for Batch Processing ---
  const itemsToProcess: BatchInputItem[] = results.reduce(
    (acc, result, index) => {
      if (!result.compliant && result.original) {
        acc.push({
          index,
          original: result.original, // Guaranteed to be a string because of the if-check
          suggestion: result.suggestion,
        });
      }
      return acc;
    },
    [] as BatchInputItem[]
  );

  let batchResults: BatchOutputItem[] = []; // To store results from Gemini

  if (itemsToProcess.length > 0) {
    console.log(
      `\n--- Starting Batch Snippet Generation for ${itemsToProcess.length} items ---`
    );

    // --- Construct the single batch prompt ---
    // Carefully structure the prompt to request JSON output
    const batchPrompt = `
You are an expert HTML analyzer and content generator. Process a list of issues found in the provided HTML document.

**Input:**
1.  **Original Full HTML Content:** The complete HTML document.
2.  **Issues Array:** A JSON array of objects, each representing an issue found in the HTML. Each object has an 'index' (its original position), 'original' (the problematic text), and 'suggestion' (the proposed fix text).

**Tasks:**
For EACH item in the 'Issues Array':
1.  **Generate Highlighted Original Snippet:**
    * Locate the HTML fragment in the 'Original Full HTML Content' corresponding *exactly* to the 'original' text for that item.
    * Focus on the immediate parent HTML element (e.g., <p>, <li>, <b>) containing the text.
    * Return ONLY that extracted HTML fragment.
    * Modify the fragment by wrapping ONLY the text parts that exactly match the 'original' text with <mark style="background-color: #ff000077;"> tags. Preserve all other original tags and attributes within the fragment.
    * If the exact 'original' text is split across multiple tags within the parent element, mark each part within its respective tag structure.
    * If the exact text cannot be located precisely, return null for this field.
    * Assign this generated HTML snippet (or null) to a key named 'highlightedOriginalHtml'.
2.  **Generate Suggestion HTML Snippet:**
    * Look at the 'Original Full HTML Content' to understand the typical HTML structure around text similar to the 'original' text (the 'Reference Text').
    * Generate a *plain* HTML fragment for the 'suggestion' text provided for that item.
    * This fragment should fit naturally into the structural context found in the original HTML (e.g., if the reference text was in an <li>, wrap the suggestion in an <li>).
    * Do NOT add any <mark> tags to this suggestion snippet.
    * Preserve relevant structural tags from the context if appropriate.
    * If context is unclear or structural tags seem inappropriate, wrap the 'suggestion' text in a simple <p> tag as a fallback.
    * Return ONLY the generated HTML fragment for the suggestion.
    * If the original item had no 'suggestion' text, return null for this field.
    * Assign this generated HTML snippet (or null) to a key named 'suggestionHtml'.

**Output Format:**
Respond ONLY with a single valid JSON array. Each object in the array MUST correspond to an item in the input 'Issues Array' and MUST contain:
* 'index': The original index of the item from the input array.
* 'highlightedOriginalHtml': The generated HTML snippet with marks, or null if failed/not found.
* 'suggestionHtml': The generated plain HTML snippet for the suggestion, or null if no suggestion provided or failed.
* 'error': (Optional) A brief string describing an error if processing failed for this specific item, otherwise omit or set to null.

**Example Output Object:**
\`\`\`json
{
  "index": 0,
  "highlightedOriginalHtml": "<p>Example <mark style='background-color: #ff000077;'>marked text</mark>.</p>",
  "suggestionHtml": "<p>Example suggested text.</p>",
  "error": null
}
\`\`\`

---
**Original Full HTML Content:**
\`\`\`html
${htmlContent}
\`\`\`

**Issues Array (Input):**
\`\`\`json
${JSON.stringify(itemsToProcess, null, 2)}
\`\`\`

**Output (JSON Array Only):**
`; // End of prompt

    // --- Initialize Gemini Model (ensure correct config) ---
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig, // Use the config with increased maxOutputTokens
      safetySettings,
    });

    // --- Make the single batch call ---
    const batchResultString = await callGemini(
      batchPrompt,
      model,
      'BatchProcess'
    );

    // --- Parse the batch response ---
    if (batchResultString) {
      try {
        const parsedResponse = JSON.parse(batchResultString);
        if (Array.isArray(parsedResponse)) {
          // TODO: Add more validation if needed (e.g., check for required keys)
          batchResults = parsedResponse as BatchOutputItem[];
          console.log(
            `Successfully parsed ${batchResults.length} results from batch response.`
          );
        } else if (parsedResponse.error) {
          console.error(
            'Error reported in batch response:',
            parsedResponse.error
          );
          // Handle API-level errors reported within the JSON structure
          // Maybe set all processedResults to have an error state?
        } else {
          console.error(
            'Batch response parsing error: Expected a JSON array, but got:',
            typeof parsedResponse
          );
          batchResults = []; // Reset on parsing failure
        }
      } catch (parseError) {
        console.error('Batch response JSON parsing failed:', parseError);
        console.error(
          'Raw response string:',
          batchResultString.substring(0, 500) + '...'
        ); // Log snippet of raw response
        batchResults = []; // Reset on parsing failure
      }
    } else {
      console.error('Batch API call returned null or empty string.');
    }
    console.log('\nBatch snippet generation attempt completed.');
  } else {
    console.log(
      '\nNo non-compliant items with original text found to process.'
    );
  }

  // --- Step 2: Merge Batch Results with Original Results ---
  const finalProcessedResults: ProcessedResultItem[] = results.map(
    (originalResult, index) => {
      // Find the corresponding processed item from the batch output using the index
      const batchItem = batchResults.find((br) => br.index === index);

      if (batchItem) {
        // Merge data from batch item
        return {
          ...originalResult,
          highlightedOriginalHtml: batchItem.highlightedOriginalHtml ?? null,
          suggestionHtml: batchItem.suggestionHtml ?? null,
          // Optionally include error reported by Gemini for this item
          processingError: batchItem.error ?? null,
        };
      } else {
        // If item wasn't processed (e.g., compliant or filtered out) or not found in batch results
        return {
          ...originalResult,
          highlightedOriginalHtml: null,
          suggestionHtml: null,
        };
      }
    }
  );

  // === Step 3: Generate fullHighlightedHtml using Utility Function (Remains Separate) ===
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

  // === Step 4: Structure and Return Final Response ===
  console.log('\n--- Final Merged Processed Results (Snippets) ---');
  finalProcessedResults.forEach((item, index) => {
    console.log(
      `Item ${index + 1}/${finalProcessedResults.length}: Compliant: ${item.compliant}, HasGeminiHighlight: ${!!item.highlightedOriginalHtml}, HasGeminiSuggestion: ${!!item.suggestionHtml}`
    );
  });
  console.log('--- ---');

  const responsePayload: ProcessComplianceResponseBody = {
    fullHighlightedHtml, // Generated by utility function
    processedResults: finalProcessedResults, // Contains snippets merged from Gemini batch response
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
