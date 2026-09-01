import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all blogs (for admin)
router.get('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new blog
router.post('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, slug, excerpt, content, published, coverImage } = req.body;
    const authorId = (req as any).user.id;

    if (!title || !slug || !content) {
       res.status(400).json({ error: 'Title, slug, and content are required' });
       return;
    }

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        published: !!published,
        coverImage,
        authorId
      }
    });
    res.status(201).json(newBlog);
  } catch (error: any) {
    if (error.code === 'P2002') {
       res.status(400).json({ error: 'Slug must be unique' });
       return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a blog
router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, published, coverImage } = req.body;

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: { title, slug, excerpt, content, published, coverImage }
    });
    res.json(updatedBlog);
  } catch (error: any) {
    if (error.code === 'P2002') {
       res.status(400).json({ error: 'Slug must be unique' });
       return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a blog
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminBlogRouter };
