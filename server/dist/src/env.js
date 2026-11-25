import 'dotenv/config';
import { z } from 'zod';
const bool = z.enum(['true', 'false']).default('false').transform((v) => v === 'true');
const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),
    DATABASE_URL: z.string().min(1),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    SESSION_TTL_HOURS: z.coerce.number().default(12),
    COOKIE_SECURE: bool,
    UPLOAD_DIR: z.string().default('./uploads'),
    SMTP_HOST: z.string().optional().default(''),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: bool,
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    MAIL_FROM: z.string().default('Chemilinx Website <no-reply@localhost>'),
    NOTIFY_EMAIL: z.string().optional().default(''),
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = parsed.data;
export const clientOrigins = env.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);
