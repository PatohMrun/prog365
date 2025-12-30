
"use client";

import { useState } from 'react';
import { supabase } from '../utils/supabase'; // Using same auth client
import { User, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '../actions';

export default function Onboarding() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) throw new Error("No User Found");

            const result = await updateUserProfile(user.email, name);

            if ('error' in result) {
                console.error(result.error);
                // Handle error (maybe show toast)
            } else {
                router.push('/');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#7dd3fc]/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#86efac]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-md w-full relative z-10 glass-card p-8 rounded-2xl border border-white/5">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <User size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">What should we call you?</h1>
                    <p className="text-gray-400 text-sm">Let's personalize your experience.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider ml-1">Your Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#7dd3fc] focus:ring-1 focus:ring-[#7dd3fc] transition-all text-center text-lg font-medium"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name.trim()}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7dd3fc] to-[#86efac] text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Get Started <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
