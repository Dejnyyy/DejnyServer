import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chat = await prisma.chat.create({
      data: {
        title: `Chat ${new Date().toLocaleTimeString()}`,
      },
      include: { messages: true },
    });
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chat' });
  }
}
