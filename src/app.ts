import express, { type Application } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';
import { trackingRouter } from './routes/tracking.js';
import { userRouter } from './routes/user.js';
import { redirectRouter } from './routes/redirect.js';
import { adminBlogRouter } from './routes/admin/blog.js';
import { publicBlogRouter } from './routes/blog.js';


const app: Application = express();

// ── Middleware ─────────────────────────────────────────────────────────────
// FRONTEND_URL can be a single origin or a comma-separated list (e.g. custom domain + Render URL).
// If unset, all origins are allowed (fine for early testing, tighten once your frontend URL is known).
const allowedOrigins = process.env.FRONTEND_URL?.split(',').map((o) => o.trim());
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tracking', trackingRouter);
app.use('/api/user', userRouter);
app.use('/r', redirectRouter);
app.use('/api/admin/blogs', adminBlogRouter);
app.use('/api/blogs', publicBlogRouter);


export default app;
