// pages/api/chats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Chat } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse<Chat[] | { error: string }>) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const chats = await prisma.chat.findMany({
      include: { messages: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
}
