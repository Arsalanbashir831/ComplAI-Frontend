// src/app/api/highlight-direct/route.ts

import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

interface HighlightRequestBody {
  plainText: string; // Text content reference for what needs highlighting
  htmlContent: string; // The original HTML to modify
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- Gemini Configuration ---
const MODEL_NAME = 'gemini-1.5-pro'; // Use a more capable model like Pro for complex instructions
const generationConfig = {
  temperature: 0.0, // Set temperature to 0.0 for maximum determinism/instruction following
  topK: 1,
  topP: 1,
  maxOutputTokens: 4096, // Increase if the HTML content can be large
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
// --- ---

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured.');
    return NextResponse.json(
      { error: 'API key not configured.' },
      { status: 500 }
    );
  }

  let body: HighlightRequestBody;
  try {
    body = await request.json();
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return NextResponse.json(
      { error: 'Invalid JSON in request body.' },
      { status: 400 }
    );
  }

  const { plainText, htmlContent } = body;

  // Basic Input Validation (redundant checks removed for brevity, assume valid strings)
  if (!plainText || !htmlContent) {
    return NextResponse.json(
      { error: 'Missing plainText or htmlContent.' },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    });

    // --- Prompt for Direct HTML Modification ---
    const directHighlightPrompt = `
            You are an expert HTML editor performing a specific text highlighting task.
            Your goal is to modify the provided 'Original HTML Content' by wrapping specific text segments with <mark style="background-color: #ff000077;"> tags (using that specific style).
            The text segments to be wrapped are those text parts within the HTML that directly correspond semantically to the content mentioned in the 'Plain Text Reference'.

            Plain Text Reference:
            "${plainText}"

            Original HTML Content:
            \`\`\`html
            ${htmlContent}
            \`\`\`

            Instructions:
            1. Analyze the Plain Text Reference to understand the complete content that needs highlighting within the HTML.
            2. Carefully examine the Original HTML Content, including its structure and text nodes.
            3. Locate all text nodes or parts of text nodes within the HTML that match the content from the Plain Text Reference. The match should be semantic, considering the rendered text.
            4. Modify the Original HTML Content *only* by inserting opening <mark style="background-color: #ff000077;"> and closing </mark> tags around the identified text segments.
            5. **Crucially, preserve the original HTML structure, all existing tags (like <p>, <b>, <div>), and all their attributes exactly.** Do not add, remove, or modify any HTML elements or attributes other than inserting the necessary <mark> tags.
            6. If a segment to be highlighted is interrupted by an existing HTML tag, you MUST close the <mark> tag before the inner tag and reopen the <mark> tag immediately after the inner tag. For example, if highlighting "important statement" in "<p>...this <b>important</b> statement...</p>", the output must be "<p>...this <mark><b><mark>important</mark></b></mark><mark> statement</mark>...</p>". Ensure marks correctly wrap the text portions only, respecting existing tags. Handle nesting or adjacent tags correctly.
            7. Do not highlight text in the HTML that is not represented in the Plain Text Reference.
            8. Return the *entire, complete, modified HTML content* and nothing else. Do not add any introductory text, explanations, or markdown formatting (like \`\`\`html) around your final output.

            Modified HTML Content:
        `; // End of prompt

    console.log('Sending prompt to Gemini for direct HTML modification...');
    const geminiResult = await model.generateContent(directHighlightPrompt);

    // Error handling based on response (check for safety blocks etc.)
    if (!geminiResult.response) {
      console.error('Gemini response was blocked or empty.');
      // You might want to inspect geminiResult.response.promptFeedback or other properties
      return NextResponse.json(
        { error: 'Gemini response was blocked or empty.' },
        { status: 500 }
      );
    }

    const response = geminiResult.response;
    const modifiedHtml = response.text();
    console.log('Gemini response (Modified HTML):\n', modifiedHtml);

    if (!modifiedHtml || modifiedHtml.trim().length === 0) {
      console.log('Gemini returned empty modified HTML. Returning original.');
      // Decide if returning original or error is better here
      return NextResponse.json(
        {
          highlightedHtml: htmlContent,
          message: 'Highlighting failed or produced empty result.',
        },
        { status: 200 }
      );
    }

    // Basic cleanup - remove potential leading/trailing markdown fences if Gemini adds them despite instructions
    const cleanedHtml = modifiedHtml
      .trim()
      .replace(/^```html\s*|```$/g, '')
      .trim();

    return NextResponse.json({ highlightedHtml: cleanedHtml }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error during direct highlighting process:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Check if the error is from Gemini API itself
    if (error instanceof Error && error.message.includes('safety')) {
      return NextResponse.json(
        {
          error: `Gemini safety settings blocked the request or response. ${error.message}`,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        error: `Failed to process request: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
