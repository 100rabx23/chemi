import { prisma } from '../db.js';
export async function audit(req, action, entity, entityId, meta) {
    try {
        await prisma.auditLog.create({
            data: {
                adminUserId: req.admin?.id ?? null,
                action,
                entity,
                entityId: entityId ?? null,
                meta: (meta ?? undefined),
                ip: req.ip ?? null,
            },
        });
    }
    catch (err) {
        console.error('[audit] failed', err.message);
    }
}
