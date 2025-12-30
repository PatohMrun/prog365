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
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-[#1a1a1a] z-50 pb-safe">
      <div className="flex justify-around items-center px-4 py-3 max-w-lg mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 group ${isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#7dd3fc]/10 to-transparent rounded-xl animate-fade-in" />
              )}
              <div className={`relative transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${isActive ? 'text-[#7dd3fc] drop-shadow-[0_0_8px_rgba(125,211,252,0.3)]' : ''}`}
                />
              </div>
              <span className={`text-[10px] font-medium absolute bottom-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0 text-[#7dd3fc]' : 'opacity-0 translate-y-2'
                }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}