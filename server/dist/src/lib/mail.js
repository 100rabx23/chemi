import nodemailer from 'nodemailer';
import { env } from '../env.js';
import { prisma } from '../db.js';
let transport = null;
function getTransport() {
    transport ??= nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    return transport;
}
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => s.replace(/[&<>"']/g, (c) => ENTITIES[c]);
async function notifyAddress() {
    const s = await prisma.siteSetting.findUnique({ where: { key: 'notifications' } });
    const fromDb = s?.value?.notifyEmail;
    return fromDb || env.NOTIFY_EMAIL;
}
/** Sends a business notification and a customer confirmation. Never throws. */
export async function sendBoth(opts) {
    if (!env.SMTP_HOST)
        return 'SKIPPED';
    try {
        const t = getTransport();
        const business = await notifyAddress();
        if (business) {
            await t.sendMail({ from: env.MAIL_FROM, to: business, replyTo: opts.replyTo, subject: opts.subject, html: opts.html, text: opts.text });
        }
        await t.sendMail({ from: env.MAIL_FROM, ...opts.customer });
        return 'SENT';
    }
    catch (err) {
        console.error('[mail] failed', err.message);
        return 'FAILED';
    }
}
