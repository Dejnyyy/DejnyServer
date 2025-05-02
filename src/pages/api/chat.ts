// pages/api/chats/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chats = await prisma.chat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { messages: true },
    });
    res.status(200).json(chats);
  } catch (err) {
    res.status(500).json({ err: 'Failed to fetch chats' });
  }
}
