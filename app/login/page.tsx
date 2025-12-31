"use client";

import { useState } from 'react';
import { supabase } from '../utils/supabase';
import { Mail, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: process.env.NEXT_PUBLIC_APP_URL || 'https://prod365.vercel.app',
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSent(true);
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full glass-card p-8 rounded-2xl text-center border border-[#86efac]/20 animate-fade-in">
                    <div className="w-16 h-16 bg-[#86efac]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#86efac]">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                    <p className="text-gray-400 mb-6">
                        We sent a secure login link to <span className="text-[#86efac]">{email}</span>.
                        <br />Click it to verify and access your account.
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        Try a different email
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center pb-24 p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7dd3fc]/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#86efac]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7dd3fc] to-[#86efac] p-[1px] mx-auto mb-6 shadow-[0_0_30px_rgba(134,239,172,0.2)]">
                        <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                            <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-br from-[#7dd3fc] to-[#86efac]">M</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to continue your streak</p>
                </div>

                <form onSubmit={handleLogin} className="glass-card p-8 rounded-2xl border border-white/5 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#7dd3fc] transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#7dd3fc] transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7dd3fc] to-[#86efac] text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(125,211,252,0.2)]"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Send Magic Link <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
