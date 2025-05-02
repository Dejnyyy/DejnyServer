import { prisma } from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId, messages } = req.body;

    if (!chatId || !messages || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const userMessage = messages[messages.length - 1];

    // Save user message
    await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        text: userMessage.text,
      },
    });

    // ⛔ DON'T use stale "messages" array from client.
    // ✅ Get full chat history from DB
    const fullMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: fullMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    });

    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });

    const encoder = new TextEncoder();
    let fullAnswer = '';

    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(content);
        fullAnswer += content;
      }
    }

    await prisma.message.create({
      data: {
        chatId,
        role: 'assistant',
        text: fullAnswer,
      },
    });

    res.end();
  } catch (err: any) {
    console.error('❌ API ERROR:', err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
}
