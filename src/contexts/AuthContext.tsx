'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    username: string;
    created_at: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current user on mount
    const refreshUser = useCallback(async () => {
        try {
            const res = await fetch('/api/me', {
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setUser(data.user);
                // Also store token in localStorage for API calls
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                return { success: true };
            }

            return { success: false, error: data.message || 'Đăng nhập thất bại' };
        } catch {
            return { success: false, error: 'Lỗi kết nối' };
        }
    }, []);

    const register = useCallback(async (email: string, password: string, username: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, username }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setUser(data.user);
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                return { success: true };
            }

            return { success: false, error: data.message || 'Đăng ký thất bại' };
        } catch {
            return { success: false, error: 'Lỗi kết nối' };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            setUser(null);
            localStorage.removeItem('auth_token');
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
