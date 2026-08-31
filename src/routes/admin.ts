import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get users with pagination and search
router.get('/users', requireAdmin, async (req, res): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { id: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard stats
router.get('/stats', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Base where clause for dates
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    // Get User Stats
    const totalUsers = await prisma.user.count({ where: dateFilter });
    const adminUsers = await prisma.user.count({ where: { ...dateFilter, role: 'ADMIN' } });
    
    // Get QR Code Stats
    const totalQRCodes = await prisma.qRCodeEvent.count({ where: dateFilter });
    
    // Calculate Today vs Yesterday specifically for QR codes (if no strict date filter is applied, or we just want the raw numbers)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const qrCodesToday = await prisma.qRCodeEvent.count({
      where: { createdAt: { gte: todayStart } }
    });
    
    const qrCodesYesterday = await prisma.qRCodeEvent.count({
      where: { createdAt: { gte: yesterdayStart, lt: todayStart } }
    });

    res.json({
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      totalQRCodes,
      qrCodesToday,
      qrCodesYesterday
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminRouter };
