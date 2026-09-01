import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all QR codes for logged-in user
router.get('/qrcodes', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const qrCodes = await prisma.qRCode.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching user QR codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save a new QR code
router.post('/qrcodes', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, content, type, design } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Content is required' });
      return;
    }

    // Generate a unique 6-character short ID
    const generateId = () => Math.random().toString(36).substring(2, 8);
    let shortId = generateId();
    
    // Ensure uniqueness (simple retry loop)
    while (await prisma.qRCode.findUnique({ where: { shortId } })) {
      shortId = generateId();
    }

    const newQRCode = await prisma.qRCode.create({
      data: {
        userId,
        title: title || 'Untitled QR Code',
        content,
        type: type || 'url',
        shortId,
        design: design || {},
      },
    });

    res.status(201).json(newQRCode);
  } catch (error) {
    console.error('Error saving QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a QR code
router.delete('/qrcodes/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // Ensure the QR code belongs to the user
    const qrCode = await prisma.qRCode.findUnique({ where: { id } });
    if (!qrCode) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }

    if (qrCode.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to delete this QR code' });
      return;
    }

    await prisma.qRCode.delete({ where: { id } });
    res.json({ success: true, message: 'QR Code deleted' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as userRouter };
