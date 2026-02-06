/**
 * POST /api/favorites/:movieId - Add favorite
 * DELETE /api/favorites/:movieId - Remove favorite
 */
import type { AppPagesFunction } from '../../lib/types';
import { requireAuth } from '../../lib/auth';

export const onRequestPost: AppPagesFunction<'movieId'> = async (ctx) => {
    const result = await requireAuth(ctx.request, ctx.env);

    if ('error' in result) {
        return result.error;
    }

    const movieId = ctx.params.movieId as string;

    if (!movieId) {
        return Response.json(
            { error: 'Missing movieId', message: 'ID phim là bắt buộc' },
            { status: 400 }
        );
    }

    try {
        // Check if already exists
        const existing = await ctx.env.DB.prepare(
            'SELECT 1 FROM favorites WHERE user_id = ? AND movie_id = ?'
        )
            .bind(result.user.id, movieId)
            .first();

        if (existing) {
            return Response.json({
                success: true,
                message: 'Đã có trong danh sách yêu thích',
            });
        }

        // Add to favorites
        await ctx.env.DB.prepare(
            'INSERT INTO favorites (user_id, movie_id, created_at) VALUES (?, ?, ?)'
        )
            .bind(result.user.id, movieId, Date.now())
            .run();

        return Response.json({
            success: true,
            message: 'Đã thêm vào yêu thích',
        });
    } catch (error: any) {
        console.error('Add favorite error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
};

export const onRequestDelete: AppPagesFunction<'movieId'> = async (ctx) => {
    const result = await requireAuth(ctx.request, ctx.env);

    if ('error' in result) {
        return result.error;
    }

    const movieId = ctx.params.movieId as string;

    if (!movieId) {
        return Response.json(
            { error: 'Missing movieId', message: 'ID phim là bắt buộc' },
            { status: 400 }
        );
    }

    try {
        await ctx.env.DB.prepare(
            'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?'
        )
            .bind(result.user.id, movieId)
            .run();

        return Response.json({
            success: true,
            message: 'Đã xóa khỏi yêu thích',
        });
    } catch (error: any) {
        console.error('Remove favorite error:', error);
        return Response.json(
            { error: 'Server error', message: 'Đã xảy ra lỗi' },
            { status: 500 }
        );
    }
};
