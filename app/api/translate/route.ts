import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "你是一个精通中英互译的专家，请将用户输入的文字翻译成地道的英文，并修正其中的口语语法错误。"
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo",
    });

    const translation = completion.choices[0].message.content;

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}
