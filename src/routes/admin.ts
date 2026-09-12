import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';

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
          isActive: true,
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

// Create a new user (Admin API)
router.post('/users', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role, isActive } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        isActive: isActive !== undefined ? !!isActive : true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error: any) {
    console.error('Admin create user error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A user with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error: ' + (error.message || '') });
  }
});

// Update a user (Admin API)
router.put('/users/:id', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, role, isActive } = req.body;

    const dataToUpdate: any = {
      firstName: firstName || null,
      lastName: lastName || null,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
    };

    if (isActive !== undefined) {
      dataToUpdate.isActive = !!isActive;
    }

    if (email) {
      dataToUpdate.email = email.toLowerCase().trim();
    }

    if (password && password.trim().length > 0) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Admin update user error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A user with this email already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error: ' + (error.message || '') });
  }
});

// Toggle user activation status (Admin API)
router.patch('/users/:id/status', requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const currentAdminId = req.user?.id;

    if (id === currentAdminId && isActive === false) {
      res.status(400).json({ error: 'You cannot deactivate your own admin account' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const nextActive = isActive !== undefined ? !!isActive : !user.isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: nextActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Admin status toggle error:', error);
    res.status(500).json({ error: 'Internal server error: ' + (error.message || '') });
  }
});

// Delete a user (Admin API)
router.delete('/users/:id', requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { id } = req.params;
    const currentAdminId = req.user?.id;

    if (id === currentAdminId) {
      res.status(400).json({ error: 'You cannot delete your own admin account' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Internal server error: ' + (error.message || '') });
  }
});

// Dashboard stats
router.get('/stats', requireAdmin, async (req, res): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }

    const totalUsers = await prisma.user.count({ where: dateFilter });
    const adminUsers = await prisma.user.count({ where: { ...dateFilter, role: 'ADMIN' } });
    
    const totalQRCodes = await prisma.qRCodeEvent.count({ where: dateFilter });
    
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
