'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './Button';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
    const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, register } = useAuth();

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setUsername('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSwitchTab = (newTab: 'login' | 'register') => {
        setTab(newTab);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (tab === 'login') {
                const result = await login(email, password);
                if (result.success) {
                    handleClose();
                } else {
                    setError(result.error || 'Đăng nhập thất bại');
                }
            } else {
                const result = await register(email, password, username);
                if (result.success) {
                    handleClose();
                } else {
                    setError(result.error || 'Đăng ký thất bại');
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-slate-900 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl my-auto z-[101]">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => handleSwitchTab('login')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${tab === 'login'
                            ? 'text-red-500 border-b-2 border-red-500'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => handleSwitchTab('register')}
                        className={`flex-1 py-4 text-center font-medium transition-colors ${tab === 'register'
                            ? 'text-red-500 border-b-2 border-red-500'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Đăng ký
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Username (register only) */}
                    {tab === 'register' && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tên người dùng"
                                required
                                minLength={3}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_]+"
                                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Email */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mật khẩu"
                            required
                            minLength={6}
                            className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Đang xử lý...
                            </span>
                        ) : tab === 'login' ? (
                            'Đăng nhập'
                        ) : (
                            'Đăng ký'
                        )}
                    </Button>

                    {/* Footer text */}
                    <p className="text-center text-gray-400 text-sm">
                        {tab === 'login' ? (
                            <>
                                Chưa có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => handleSwitchTab('register')}
                                    className="text-red-500 hover:underline"
                                >
                                    Đăng ký ngay
                                </button>
                            </>
                        ) : (
                            <>
                                Đã có tài khoản?{' '}
                                <button
                                    type="button"
                                    onClick={() => handleSwitchTab('login')}
                                    className="text-red-500 hover:underline"
                                >
                                    Đăng nhập
                                </button>
                            </>
                        )}
                    </p>
                </form>
            </div>
        </div>
    );

    // Use portal to render at document.body level
    if (typeof document !== 'undefined') {
        return createPortal(modalContent, document.body);
    }

    return null;
}
