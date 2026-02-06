/**
 * POST /api/auth/logout - User logout
 */
import type { AppPagesFunction } from '../../lib/types';
import { clearAuthCookie } from '../../lib/auth';

export const onRequestPost: AppPagesFunction = async () => {
    return new Response(
        JSON.stringify({ success: true, message: 'Đăng xuất thành công' }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': clearAuthCookie(),
            },
        }
    );
};
