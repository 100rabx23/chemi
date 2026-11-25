import type { Request } from 'express';
import { prisma } from '../db.js';

export async function audit(req: Request, action: string, entity: string, entityId?: string | null, meta?: unknown) {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: req.admin?.id ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        meta: (meta ?? undefined) as never,
        ip: req.ip ?? null,
      },
    });
  } catch (err) {
    console.error('[audit] failed', (err as Error).message);
  }
}
