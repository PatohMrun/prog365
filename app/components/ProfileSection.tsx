"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

export default function ProfileSection() {
    const [stats, setStats] = useState({
        positiveCount: 0,
        badCount: 0,
        projectsCount: 0,
        streak: 0
    });

    useEffect(() => {
        const savedPositive = JSON.parse(localStorage.getItem('positiveHabits') || '[]');
        const savedBad = JSON.parse(localStorage.getItem('badHabits') || '[]');
        const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');

        setStats({
            positiveCount: savedPositive.length,
            badCount: savedBad.length,
            projectsCount: savedProjects.length,
            streak: 0 // Placeholder logic for now
        });
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-white pb-20 px-4 pt-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center space-x-3 mb-8">
                    <User className="text-[#7dd3fc]" size={28} />
                    <h1 className="text-3xl font-bold text-[#7dd3fc]">Profile</h1>
                </div>

                <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-xl font-semibold mb-6 text-[#86efac]">Statistics</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#7dd3fc]">{stats.positiveCount}</div>
                                <div className="text-gray-400 text-sm">Positive Habits</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#fca5a5]">{stats.badCount}</div>
                                <div className="text-gray-400 text-sm">Habits to Avoid</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#86efac]">{stats.projectsCount}</div>
                                <div className="text-gray-400 text-sm">Active Projects</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-[#7dd3fc]">{stats.streak}</div>
                                <div className="text-gray-400 text-sm">Days Streak</div>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
