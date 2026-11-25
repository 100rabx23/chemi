import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env, clientOrigins } from './env.js';
import { errorHandler } from './lib/http.js';
import { loadSession } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
export function createApp() {
    const app = express();
    app.set('trust proxy', 1);
    app.disable('x-powered-by');
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(cors({ origin: clientOrigins, credentials: true }));
    app.use(express.json({ limit: '100kb' }));
    app.use(cookieParser());
    app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), {
        maxAge: '7d', immutable: true, setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    }));
    app.get('/api/health', (_req, res) => res.json({ ok: true }));
    app.use(loadSession);
    app.use('/api/auth', authRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api', publicRouter);
    app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
    app.use(errorHandler);
    return app;
}
