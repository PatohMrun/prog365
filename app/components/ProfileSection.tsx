"use client";

import { useState, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { supabase } from "../utils/supabase";
import { getUserProfile } from "../actions/user";
import { getHabits } from "../actions/habits";
import { getProjects } from "../actions/projects";

export default function ProfileSection({ initialUser }: { initialUser?: any }) {
    const [user, setUser] = useState<any>(initialUser || null);
    const [stats, setStats] = useState({
        positiveCount: 0,
        badCount: 0,
        projectsCount: 0,
        bestStreak: 0,
        todayCompletion: 0
    });

    useEffect(() => {
        const loadProfileStats = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;

            // Optimisation: If we already have the user (passed from props), 
            // we don't need to fetch it again, only the stats.
            const fetchPromises: Promise<any>[] = [
                getHabits(session.user.email),
                getProjects(session.user.email)
            ];

            if (!user) {
                fetchPromises.unshift(getUserProfile(session.user.email));
            }

            const results = await Promise.all(fetchPromises);

            let profile, habits, projectsData;

            if (!user) {
                [profile, habits, projectsData] = results;
                if (profile) setUser(profile);
            } else {
                [habits, projectsData] = results;
            }

            if (initialUser && !user) setUser(initialUser); // Fallback sync

            const { positive, negative } = habits;
            const projects = projectsData;

            const allHabits = [...positive, ...negative];
            const bestStreak = allHabits.reduce((max: number, h: any) => Math.max(max, h.streak || 0), 0);
            const total = allHabits.length;
            const completed = allHabits.filter((h: any) => h.completed).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            setStats({
                positiveCount: positive.length,
                badCount: negative.length,
                projectsCount: projects.filter((p: any) => !p.status || p.status === 'active').length,
                bestStreak,
                todayCompletion: percent
            });
        };
        loadProfileStats();
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-white pb-20 px-4 pt-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#7dd3fc] shadow-[0_0_15px_rgba(125,211,252,0.3)]">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-[#7dd3fc]">
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user?.name || 'Loading...'}</h1>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-lg font-semibold mb-6 text-[#86efac]">Statistics</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 rounded-xl bg-[#0f0f0f]/50">
                                <div className="text-3xl font-bold text-[#86efac]">{stats.positiveCount}</div>
                                <div className="text-gray-400 text-xs mt-1">Building</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-[#0f0f0f]/50">
                                <div className="text-3xl font-bold text-[#fca5a5]">{stats.badCount}</div>
                                <div className="text-gray-400 text-xs mt-1">Avoiding</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-[#0f0f0f]/50">
                                <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
                                    {stats.bestStreak} <span className="text-base font-normal text-orange-400/70">days</span>
                                </div>
                                <div className="text-gray-400 text-xs mt-1">Best Streak</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-[#0f0f0f]/50">
                                <div className="text-3xl font-bold text-[#7dd3fc]">{stats.todayCompletion}%</div>
                                <div className="text-gray-400 text-xs mt-1">Today's Focus</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-xl font-semibold mb-6 text-[#86efac]">Settings</h2>
                        <div className="space-y-4">
                            <button className="w-full text-left p-4 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors">
                                <div className="font-medium">Notifications</div>
                                <div className="text-gray-400 text-sm">Manage your notification preferences</div>
                            </button>
                            <button className="w-full text-left p-4 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors">
                                <div className="font-medium">Export Data</div>
                                <div className="text-gray-400 text-sm">Download your progress data</div>
                            </button>
                            <button className="w-full text-left p-4 rounded-lg bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors">
                                <div className="font-medium">Reset Progress</div>
                                <div className="text-gray-400 text-sm">Clear all data and start fresh</div>
                            </button>
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.href = '/login';
                                }}
                                className="w-full text-left p-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors group"
                            >
                                <div className="font-medium text-red-500 flex items-center gap-2">
                                    <LogOut size={16} /> Sign Out
                                </div>
                                <div className="text-red-400/60 text-sm group-hover:text-red-400">End your current session</div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
