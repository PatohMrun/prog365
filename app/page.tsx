"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, XCircle, Calendar, Target, Plus, ArrowRight, TrendingUp, AlertCircle, Shield, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "./components/BottomNav";
import VerseSection from "./components/VerseSection";
import HabitsSection from "./components/HabitsSection";
import ProjectsSection from "./components/ProjectsSection";
import ProfileSection from "./components/ProfileSection";
import { Storage } from "./utils/storage";

interface BibleVerse {
  text: string;
  reference: string;
}

interface SummaryStats {
  positiveTotal: number;
  positiveCompleted: number;
  badTotal: number;
  badClean: number;
  projectsTotal: number;
  projectsBehind: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [direction, setDirection] = useState(0);
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [stats, setStats] = useState<SummaryStats>({
    positiveTotal: 0,
    positiveCompleted: 0,
    badTotal: 0,
    badClean: 0,
    projectsTotal: 0,
    projectsBehind: 0
  });
  const [loading, setLoading] = useState(true);

  const tabs = ['home', 'verse', 'habits', 'projects', 'profile'];

  const handleTabChange = (newTab: string) => {
    const newIndex = tabs.indexOf(newTab);
    const oldIndex = tabs.indexOf(activeTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTab(newTab);

    // Efficiently update URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newTab);
    window.history.replaceState({}, '', url);
  };

  useEffect(() => {
    // Check URL on initial load to restore tab
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && tabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // RUN DAILY LOGIC CHECK ON LOAD
    Storage.checkDailyReset();

    // Handle online reconnection & Visibility Change
    const handleRevalidation = () => {
      // 1. Run Daily Reset Check
      Storage.checkDailyReset();

      // 2. Check if we need new Verse
      const today = new Date().toLocaleDateString('en-CA');
      const cachedDate = localStorage.getItem('verseDate');
      if (cachedDate !== today) {
        fetchVerse(true);
      }

      // 3. Refresh Dashboard Stats
      loadStats();
    };

    window.addEventListener('online', handleRevalidation);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleRevalidation();
    });
    window.addEventListener('focus', handleRevalidation);

    return () => {
      window.removeEventListener('online', handleRevalidation);
      document.removeEventListener('visibilitychange', handleRevalidation);
      window.removeEventListener('focus', handleRevalidation);
    };
  }, []);

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
    if (typeof window === 'undefined') return;

    const { positive, negative } = Storage.getHabits();
    const projects = Storage.getProjects();

    const posCompleted = positive.filter(h => h.completed).length;

    // Filter for Active Projects Only
    const activeProjects = projects.filter(p => !p.status || p.status === 'active');

    // Calculate Project status
    let behindCount = 0;
    activeProjects.forEach(p => {
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.deadline).getTime();
      const now = Date.now();

      // Check Overdue
      const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) {
        behindCount++;
        return;
      }

      // Check Pacing
      if (end > start) {
        const timePercent = ((now - start) / (end - start)) * 100;
        // If Work Progress < Time Elapsed - 10%, it's behind
        if (p.progress < Math.min(100, Math.max(0, timePercent)) - 10) behindCount++;
      }
    });


    const allHabits = [...positive, ...negative];
    const bestStreak = allHabits.reduce((max, h) => Math.max(max, h.streak), 0);

    setStats({
      positiveTotal: positive.length,
      positiveCompleted: posCompleted,
      badTotal: negative.length,
      badClean: negative.filter(h => h.completed).length,
      projectsTotal: activeProjects.length,
      projectsBehind: behindCount,
      bestStreak: bestStreak
    });
  };

  const fetchVerse = async (forceRefetch = false) => {
    if (typeof window === 'undefined') return;

    const today = new Date().toLocaleDateString('en-CA');
    const cachedDate = localStorage.getItem('verseDate');
    const cachedVerse = localStorage.getItem('cachedVerse');

    if (!forceRefetch && cachedDate === today && cachedVerse) {
      setVerse(JSON.parse(cachedVerse));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('https://labs.bible.org/api/?passage=votd&type=json');
      const data = await response.json();
      if (data && data[0]) {
        const newVerse = {
          text: data[0].text,
          reference: `${data[0].bookname} ${data[0].chapter}:${data[0].verse}`
        };
        setVerse(newVerse);
        localStorage.setItem('cachedVerse', JSON.stringify(newVerse));
        localStorage.setItem('verseDate', today);
      }
    } catch (error) {
      console.error("Error fetching verse:", error);
      if (cachedVerse) {
        setVerse(JSON.parse(cachedVerse));
      } else {
        setVerse({
          text: "Trust in the Lord with all your heart...",
          reference: "Proverbs 3:5-6"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
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
      case 'verse': return <VerseSection verse={verse} loading={loading} onRefresh={() => fetchVerse(true)} />;
      case 'habits': return <HabitsSection />;
      case 'projects': return <ProjectsSection />;
      case 'profile': return <ProfileSection />;
      default: return <Dashboard />;
    }
  };

  const Dashboard = () => (
    <div className="min-h-screen bg-transparent text-white pb-24 px-4 pt-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{todayStr}</p>
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

      <section className="mb-6">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7dd3fc]/10 to-transparent opacity-50" />

          <div className="relative z-10">
            <h2 className="text-lg font-semibold mb-4 text-[#7dd3fc]">Daily Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Habits Card - Segregated View */}
              <div
                onClick={() => handleTabChange('habits')}
                className="bg-[#0f0f0f]/80 p-5 rounded-xl cursor-pointer hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#86efac]/30 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="text-[#86efac]" size={20} />
                    <span className="font-semibold text-white">Habits</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                    <Flame size={14} fill="currentColor" />
                    <span className="text-xs font-bold">{stats.bestStreak} day streak</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Positive Stats */}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Building</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-[#86efac]">{stats.positiveCompleted}</span>
                      <span className="text-sm text-gray-500">/ {stats.positiveTotal}</span>
                    </div>
                  </div>

                  {/* Negative Stats */}
                  <div className="flex flex-col border-l border-gray-800 pl-4">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Avoiding</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-xl font-bold ${stats.badClean === stats.badTotal ? 'text-[#86efac]' : 'text-[#fca5a5]'}`}>
                        {stats.badClean}
                      </span>
                      <span className="text-sm text-gray-500">/ {stats.badTotal}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Card */}
              <div
                onClick={() => handleTabChange('projects')}
                className="bg-[#0f0f0f]/80 p-4 rounded-xl cursor-pointer hover:bg-[#1a1a1a] transition-colors border border-transparent hover:border-[#7dd3fc]/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-[#7dd3fc]" size={18} />
                    <span className="text-xs text-gray-400">Projects</span>
                  </div>
                  <span className="text-xl font-bold text-white">{stats.projectsTotal}</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Overall Pacing:</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${stats.projectsBehind > 0
                    ? 'bg-[#fca5a5]/10 border-[#fca5a5]/20 text-[#fca5a5]'
                    : 'bg-[#86efac]/10 border-[#86efac]/20 text-[#86efac]'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${stats.projectsBehind > 0 ? 'bg-[#fca5a5]' : 'bg-[#86efac]'
                      }`} />
                    {stats.projectsBehind > 0 ? `${stats.projectsBehind} Behind` : 'On Track'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >



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
    </div >
  );

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden relative">
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
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
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