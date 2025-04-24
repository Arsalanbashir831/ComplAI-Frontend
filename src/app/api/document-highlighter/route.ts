import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface HighlightItem {
  original: string;
  compliant: boolean;
  suggestion: string;
  reason: string;
  citations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { htmlContent, highlights } = (await request.json()) as {
      htmlContent: string;
      highlights: HighlightItem[];
    };

    // Validate input
    if (typeof htmlContent !== 'string' || !Array.isArray(highlights)) {
      return NextResponse.json(
        { error: 'Invalid request: htmlContent must be a string and highlights must be an array.' },
        { status: 400 }
      );
    }
    const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

    // Send one request with full HTML and all highlight items
    const prompt = `
You are a tool that annotates HTML. 
Given the following HTML string and an array of highlight objects, each with an 'original', 'compliant', 'suggestion', and 'reason', wrap every exact match of each 'original' text (case-sensitive) in the HTML and enclose that sentance with a <mark> tag. 

Do NOT modify any other part of the HTML including the textual content as it is very super sensitive and it should never change. 

Return ONLY the updated HTML with <mark> tag.
but you need to make sure that every object contain some issue in that particular text so you need to first identify that sentance and than enclose that sentance with mark tag. dont miss any and it should be the exact match make sure that your matching accuracy is 100% and you are not missing any of the original sentance from object.

HTML:
${htmlContent}

`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You annotate HTML with <mark> tags as requested.' },
        { role: 'user', content: prompt }
      ],
    });

    // The assistant response should be just the updated HTML
    const updatedHtml = completion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ success: true, highlightedContent: updatedHtml });
  } catch (error) {
    console.error('Error processing highlights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
