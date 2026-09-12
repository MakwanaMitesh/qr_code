import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all published blogs
router.get('/', async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true, excerpt: true, 
        coverImage: true, createdAt: true,
        author: { select: { firstName: true, lastName: true } }
      }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single published blog by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: { author: { select: { firstName: true, lastName: true } } }
    });

    if (!blog || !blog.published) {
      res.status(404).json({ error: 'Blog not found' });
      return;
    }

    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as publicBlogRouter };
