"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, XCircle, Calendar, Target, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./components/BottomNav";
import VerseSection from "./components/VerseSection";
import HabitsSection from "./components/HabitsSection";
import ProjectsSection from "./components/ProjectsSection";
import ProfileSection from "./components/ProfileSection";

interface BibleVerse {
  text: string;
  reference: string;
}

interface SummaryStats {
  positiveTotal: number;
  positiveCompleted: number;
  badTotal: number;
  badClean: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState(0);
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [stats, setStats] = useState<SummaryStats>({ positiveTotal: 0, positiveCompleted: 0, badTotal: 0, badClean: 0 });
  const [loading, setLoading] = useState(true);

  const tabs = ['home', 'verse', 'habits', 'projects', 'profile'];

  const handleTabChange = (newTab: string) => {
    const newIndex = tabs.indexOf(newTab);
    const oldIndex = tabs.indexOf(activeTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipeConfidenceThreshold = 200;
    const swipePower = Math.abs(offset.x) * velocity.x;

    const currentIndex = tabs.indexOf(activeTab);

    if (swipePower < -swipeConfidenceThreshold) {
      if (currentIndex < tabs.length - 1) {
        handleTabChange(tabs[currentIndex + 1]);
      }
    } else if (swipePower > swipeConfidenceThreshold) {
      if (currentIndex > 0) {
        handleTabChange(tabs[currentIndex - 1]);
      }
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      position: 'absolute' as const // Ensure absolute positioning for overlap
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      position: 'relative' as const
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      position: 'absolute' as const
    })
  };

  // Fetch Verse ONLY ONCE on mount
  useEffect(() => {
    fetchVerse();
  }, []);

  // Sync Stats when returning to Home or checking profile
  useEffect(() => {
    if (activeTab === 'home' || activeTab === 'profile') {
      loadStats();
    }
  }, [activeTab]);

  const loadStats = () => {
    const positive = JSON.parse(localStorage.getItem('positiveHabits') || '[]');
    const bad = JSON.parse(localStorage.getItem('badHabits') || '[]');

    const posCompleted = positive.filter((h: any) => h.completed).length;
    const badFailures = bad.filter((h: any) => h.completed).length;

    setStats({
      positiveTotal: positive.length,
      positiveCompleted: posCompleted,
      badTotal: bad.length,
      badClean: bad.length - badFailures
    });
  };

  const fetchVerse = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://labs.bible.org/api/?passage=votd&type=json');
      const data = await response.json();
      if (data && data[0]) {
        setVerse({
          text: data[0].text,
          reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`
        });
      }
    } catch (error) {
      setVerse({
        text: "Trust in the Lord with all your heart...",
        reference: "Proverbs 3:5-6"
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'verse': return <VerseSection />;
      case 'habits': return <HabitsSection />;
      case 'projects': return <ProjectsSection />;
      case 'profile': return <ProfileSection />;
      default: return <Dashboard />;
    }
  };

  const Dashboard = () => (
    <div className="min-h-screen bg-black text-white pb-24 px-4 pt-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{today}</p>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
            {getGreeting()}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7dd3fc] to-[#86efac] p-[1px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#7dd3fc] to-[#86efac]">M</span>
          </div>
        </div>
      </header>

      <section className="mb-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7dd3fc]/10 to-transparent opacity-50" />

          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-4 text-[#7dd3fc]">Daily Progress</h2>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => handleTabChange('habits')}
                className="bg-[#0f0f0f]/80 p-4 rounded-xl cursor-pointer hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="text-[#86efac]" size={20} />
                  <span className="text-2xl font-bold">{stats.positiveCompleted}/{stats.positiveTotal}</span>
                </div>
                <p className="text-xs text-gray-400">Habits Done</p>
                {stats.positiveTotal > 0 && (
                  <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#86efac] rounded-full"
                      style={{ width: `${(stats.positiveCompleted / stats.positiveTotal) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              <div
                onClick={() => handleTabChange('habits')}
                className="bg-[#0f0f0f]/80 p-4 rounded-xl cursor-pointer hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="text-[#fca5a5]" size={20} />
                  <span className="text-2xl font-bold">{stats.badClean}/{stats.badTotal}</span>
                </div>
                <p className="text-xs text-gray-400">Avoided</p>
                {stats.badTotal > 0 && (
                  <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-[#fca5a5] rounded-full"
                      style={{ width: `${(stats.badClean / stats.badTotal) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div
          onClick={() => handleTabChange('verse')}
          className="glass-card rounded-2xl p-6 cursor-pointer hover-lift group relative"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-[#7dd3fc]" size={18} />
              <span className="text-sm font-medium text-[#7dd3fc]">Verse of the Day</span>
            </div>
            <ArrowRight size={16} className="text-[#7dd3fc] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {loading ? (
            <div className="h-16 animate-pulse bg-[#1a1a1a] rounded-lg" />
          ) : verse && (
            <>
              <p className="text-gray-300 text-sm line-clamp-2 italic mb-2">"{verse.text}"</p>
              <p className="text-xs text-[#7dd3fc] text-right font-medium">— {verse.reference}</p>
            </>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-500 mb-4 px-1">QUICK ACTIONS</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTabChange('habits')}
            className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#86efac]/50 group transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-[#86efac]/20 flex items-center justify-center mb-3 group-hover:bg-[#86efac] transition-colors">
              <Plus className="text-[#86efac] group-hover:text-black" size={20} />
            </div>
            <span className="font-medium text-sm">New Habit</span>
          </button>

          <button
            onClick={() => handleTabChange('projects')}
            className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1a1a1a] hover:border-[#7dd3fc]/50 group transition-all text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-[#7dd3fc]/20 flex items-center justify-center mb-3 group-hover:bg-[#7dd3fc] transition-colors">
              <Target className="text-[#7dd3fc] group-hover:text-black" size={20} />
            </div>
            <span className="font-medium text-sm">New Project</span>
          </button>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 500, damping: 50 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className="w-full h-full absolute top-0 left-0"
        >
          <TabContent />
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}