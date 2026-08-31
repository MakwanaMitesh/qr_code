import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-prod';

router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.body;
    let userId = null;

    // Optional user association if token is provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Ignore invalid tokens, just track anonymously
      }
    }

    await prisma.qRCodeEvent.create({
      data: {
        type: type || 'url',
        userId
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as trackingRouter };
