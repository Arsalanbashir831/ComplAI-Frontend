// src/app/api/match-html/route.ts

import { NextResponse } from 'next/server';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';

// Define the expected request body structure (optional but recommended)
interface MatchHtmlRequestBody {
  plainText: string;
  htmlContent: string;
}

// Ensure the API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Note: You might want more robust error handling if the key is missing during runtime

// --- Gemini Configuration --- (Same as before)
const MODEL_NAME = 'gemini-1.5-flash';
const generationConfig = {
  temperature: 0.1,
  topK: 1,
  topP: 1,
  maxOutputTokens: 1024,
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

// Export a function named after the HTTP method (POST in this case)
export async function POST(request: Request) {
  // Use the standard Request type

  // --- API Key Check ---
  if (!GEMINI_API_KEY) {
    console.error(
      'Gemini API key not found. Please set GEMINI_API_KEY environment variable.'
    );
    // Use NextResponse for App Router responses
    return NextResponse.json(
      { error: 'API key not configured correctly.' },
      { status: 500 }
    );
  }

  let body: MatchHtmlRequestBody;
  try {
    // --- Parse Request Body ---
    // Use request.json() for App Router, needs await and error handling
    body = await request.json();
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { error: 'Invalid JSON in request body.' },
      { status: 400 } // Bad Request
    );
  }

  const { plainText, htmlContent } = body;

  // --- Basic Input Validation ---
  if (
    !plainText ||
    typeof plainText !== 'string' ||
    plainText.trim().length === 0
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid plainText in request body.' },
      { status: 400 }
    );
  }
  if (
    !htmlContent ||
    typeof htmlContent !== 'string' ||
    htmlContent.trim().length === 0
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid htmlContent in request body.' },
      { status: 400 }
    );
  }

  // --- Gemini API Call Logic ---
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    });

    // --- Construct the Prompt --- (Same as before)
    const prompt = `
      You are an expert HTML parser. Your task is to find the specific segment within the provided HTML source code that semantically corresponds to the given plain text query.

      HTML Source Code:
      \`\`\`html
      ${htmlContent}
      \`\`\`

      Plain Text Query:
      "${plainText}"

      Instructions:
      1. Analyze the HTML structure and content carefully. Pay attention to tags, attributes, and text nodes.
      2. Locate the part of the HTML that directly represents the meaning and content of the 'Plain Text Query'. This match might span across multiple tags, be inside a single tag, or just be a text node. The match should be based on the rendered text content, ignoring potential differences in whitespace unless significant.
      3. Extract the *exact* corresponding HTML snippet from the original HTML Source Code. Preserve the original tags and attributes within the matched segment. Try to extract the smallest possible segment that accurately represents the query.
      4. Return *only* the extracted HTML snippet. Do not add any explanations, introductions, backticks, or markdown formatting around the snippet *unless* the text cannot be reasonably found.
      5. If no corresponding segment can be reasonably found in the HTML, return the exact text: "No match found."

      Extracted HTML Snippet:
    `;
    // --- ---

    const result = await model.generateContent(prompt);
    const response = result.response;
    const matchedText = response.text();

    // --- Process Gemini Response ---
    if (matchedText.trim() === 'No match found.') {
      return NextResponse.json(
        { matchedHtml: null, message: 'No match found.' },
        { status: 200 }
      );
    } else if (matchedText.trim().length > 0) {
      const cleanedHtml = matchedText
        .trim()
        .replace(/^```html\s*|```$/g, '')
        .trim();
      return NextResponse.json({ matchedHtml: cleanedHtml }, { status: 200 });
    } else {
      console.error('Gemini returned an empty response.');
      return NextResponse.json(
        { error: 'Gemini returned an empty response.' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error calling Gemini API or processing request:', err);
    return NextResponse.json(
      {
        error: `Failed to process request: ${err.message || 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

// NOTE: You do NOT need functions for other methods like GET, PUT, DELETE etc.
// If a request with a different method comes to this route, Next.js App Router
// will automatically return a 405 Method Not Allowed response.
