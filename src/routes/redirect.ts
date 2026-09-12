import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Redirect route for tracking scans
router.get('/:shortId', async (req: Request, res: Response): Promise<void> => {
  try {
    const shortId = String(req.params.shortId);

    // Find the QR code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortId },
    });

    if (!qrCode) {
      res.status(404).send('QR Code not found or has been deleted.');
      return;
    }

    // Increment scan count
    await prisma.qRCode.update({
      where: { id: qrCode.id },
      data: { scans: { increment: 1 } },
    });

    // Redirect logic depending on type
    if (qrCode.type === 'url') {
      let redirectUrl = qrCode.content;
      if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = 'https://' + redirectUrl;
      }
      res.redirect(302, redirectUrl);
    } else {
      // If it's wifi, vcard, or plain text, we can just return a basic HTML page showing the content
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QRCraft Scan</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; color: #1e293b; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 400px; width: 100%; text-align: center; }
            h2 { margin-top: 0; color: #7c3aed; }
            .content-box { background: #f1f5f9; padding: 1rem; border-radius: 8px; margin-top: 1rem; word-break: break-all; text-align: left; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Scan Successful</h2>
            <p>You scanned a <strong>${qrCode.type.toUpperCase()}</strong> QR code.</p>
            <div class="content-box">
              <code>${qrCode.content}</code>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error while processing redirect.');
  }
});

export { router as redirectRouter };
