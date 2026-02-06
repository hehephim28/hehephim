/**
 * GET /api/favorites - List user's favorites
 */
import type { AppPagesFunction } from '../../lib/types';
import { requireAuth } from '../../lib/auth';

interface FavoriteRow {
    movie_id: string;
    created_at: number;
}

export const onRequestGet: AppPagesFunction = async (ctx) => {
    const result = await requireAuth(ctx.request, ctx.env);

    if ('error' in result) {
        return result.error;
    }

    try {
        const favorites = await ctx.env.DB.prepare(
            'SELECT movie_id, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC'
        )
            .bind(result.user.id)
            .all<FavoriteRow>();

        return Response.json({
            success: true,
            favorites: favorites.results.map((f) => ({
                movieId: f.movie_id,
                createdAt: f.created_at,
            })),
        });
    } catch (error: any) {
        console.error('List favorites error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
};
