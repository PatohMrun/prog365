"use client";

import { Home, BookOpen, Target, BarChart3, User } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'verse', icon: BookOpen, label: 'Verse' },
    { id: 'habits', icon: Target, label: 'Habits' },
    { id: 'projects', icon: BarChart3, label: 'Projects' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-[#1a1a1a] z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
              activeTab === id 
                ? 'text-[#7dd3fc] bg-[#1a1a1a]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}