/**
 * GET /api/me - Get current user profile
 */
import type { AppPagesFunction } from '../lib/types';
import { requireAuth } from '../lib/auth';

export const onRequestGet: AppPagesFunction = async (ctx) => {
    const result = await requireAuth(ctx.request, ctx.env);

    if ('error' in result) {
        return result.error;
    }

    return Response.json({
        success: true,
        user: result.user,
    });
};
