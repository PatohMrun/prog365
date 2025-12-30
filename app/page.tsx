"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, XCircle, Plus, Calendar, Target, Trash2, BarChart3, User } from "lucide-react";
import BottomNav from "./components/BottomNav";
import VerseSection from "./components/VerseSection";
import HabitsSection from "./components/HabitsSection";

interface BibleVerse {
  text: string;
  reference: string;
}

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  lastUpdated: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [positiveHabits, setPositiveHabits] = useState<Habit[]>([]);
  const [badHabits, setBadHabits] = useState<Habit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddHabit, setShowAddHabit] = useState<'positive' | 'bad' | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const savedPositive = localStorage.getItem('positiveHabits');
    const savedBad = localStorage.getItem('badHabits');
    const savedProjects = localStorage.getItem('projects');
    
    if (savedPositive) setPositiveHabits(JSON.parse(savedPositive));
    if (savedBad) setBadHabits(JSON.parse(savedBad));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    
    fetchVerse();
  }, []);

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
        text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6"
      });
    } finally {
      setLoading(false);
    }
  };

  const addHabit = (type: 'positive' | 'bad') => {
    if (!newHabitName.trim()) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completed: false,
      streak: 0
    };

    if (type === 'positive') {
      const updated = [...positiveHabits, newHabit];
      setPositiveHabits(updated);
      localStorage.setItem('positiveHabits', JSON.stringify(updated));
    } else {
      const updated = [...badHabits, newHabit];
      setBadHabits(updated);
      localStorage.setItem('badHabits', JSON.stringify(updated));
    }
    
    setNewHabitName('');
    setShowAddHabit(null);
  };

  const deleteHabit = (id: string, type: 'positive' | 'bad') => {
    if (type === 'positive') {
      const updated = positiveHabits.filter(h => h.id !== id);
      setPositiveHabits(updated);
      localStorage.setItem('positiveHabits', JSON.stringify(updated));
    } else {
      const updated = badHabits.filter(h => h.id !== id);
      setBadHabits(updated);
      localStorage.setItem('badHabits', JSON.stringify(updated));
    }
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      progress: 0,
      lastUpdated: 'Just created'
    };

    const updated = [...projects, newProject];
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
    
    setNewProjectName('');
    setShowAddProject(false);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
  };

  const toggleHabit = (id: string, type: 'positive' | 'bad') => {
    if (type === 'positive') {
      const updated = positiveHabits.map(h => 
        h.id === id ? { ...h, completed: !h.completed } : h
      );
      setPositiveHabits(updated);
      localStorage.setItem('positiveHabits', JSON.stringify(updated));
    } else {
      const updated = badHabits.map(h => 
        h.id === id ? { ...h, completed: !h.completed } : h
      );
      setBadHabits(updated);
      localStorage.setItem('badHabits', JSON.stringify(updated));
    }
  };

  const updateProgress = (id: string, delta: number) => {
    const updated = projects.map(p => 
      p.id === id ? { 
        ...p, 
        progress: Math.max(0, Math.min(100, p.progress + delta)),
        lastUpdated: 'Just now'
      } : p
    );
    setProjects(updated);
    localStorage.setItem('projects', JSON.stringify(updated));
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'verse':
        return <VerseSection />;
      case 'habits':
        return <HabitsSection />;
      case 'projects':
        return <ProjectsSection />;
      case 'profile':
        return <ProfileSection />;
      default:
        return <HomeSection />;
    }
  };

  const HomeSection = () => (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient">MRun365</h1>
              <p className="text-gray-400 text-sm">Daily Growth Tracker</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-[#7dd3fc]">
              <Calendar size={16} />
              <span className="hidden sm:inline">{today}</span>
              <span className="sm:hidden">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Bible Verse Section */}
        <section className="mb-8 sm:mb-12">
          <div className="glass-card rounded-2xl p-6 sm:p-8 hover-lift animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen size={20} className="text-[#7dd3fc]" />
              <h2 className="text-xl font-semibold text-[#7dd3fc]">Today's Verse</h2>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-[#1a1a1a] rounded w-full"></div>
                <div className="h-4 bg-[#1a1a1a] rounded w-3/4"></div>
                <div className="h-4 bg-[#1a1a1a] rounded w-1/2"></div>
              </div>
            ) : verse && (
              <div className="space-y-4">
                <blockquote className="text-base sm:text-lg leading-relaxed font-light italic">
                  "{verse.text}"
                </blockquote>
                <cite className="text-[#7dd3fc] font-medium block text-right text-sm sm:text-base">
                  — {verse.reference}
                </cite>
              </div>
            )}
          </div>
        </section>

        {/* Habits Grid */}
        <section className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Positive Habits */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle size={20} className="text-[#86efac]" />
                <h2 className="text-lg sm:text-xl font-semibold text-[#86efac]">Build Habits</h2>
              </div>
              <button 
                onClick={() => setShowAddHabit('positive')}
                className="text-[#7dd3fc] hover:text-white transition-colors p-1"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {showAddHabit === 'positive' && (
              <div className="mb-4 p-4 rounded-xl gradient-bg">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Enter habit name..."
                  className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit('positive')}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addHabit('positive')}
                    className="px-4 py-2 bg-[#86efac] text-black rounded-lg text-sm font-medium hover:bg-[#86efac]/80 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddHabit(null)}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm hover:bg-[#666] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {positiveHabits.map(habit => (
                <div key={habit.id} className="group">
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <button
                        onClick={() => toggleHabit(habit.id, 'positive')}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                          habit.completed 
                            ? 'bg-[#86efac] border-[#86efac] shadow-lg shadow-[#86efac]/30' 
                            : 'border-[#666] hover:border-[#86efac]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium text-sm sm:text-base break-words ${
                          habit.completed ? 'line-through text-gray-500' : ''
                        }`}>
                          {habit.name}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {habit.streak} day streak
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id, 'positive')}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {positiveHabits.length === 0 && (
                <p className="text-gray-400 text-center py-8 text-sm">No habits yet. Add your first positive habit!</p>
              )}
            </div>
          </div>

          {/* Bad Habits */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <XCircle size={20} className="text-[#fca5a5]" />
                <h2 className="text-lg sm:text-xl font-semibold text-[#fca5a5]">Avoid Today</h2>
              </div>
              <button 
                onClick={() => setShowAddHabit('bad')}
                className="text-[#7dd3fc] hover:text-white transition-colors p-1"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {showAddHabit === 'bad' && (
              <div className="mb-4 p-4 rounded-xl gradient-bg">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Enter habit to avoid..."
                  className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && addHabit('bad')}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addHabit('bad')}
                    className="px-4 py-2 bg-[#fca5a5] text-black rounded-lg text-sm font-medium hover:bg-[#fca5a5]/80 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddHabit(null)}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm hover:bg-[#666] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {badHabits.map(habit => (
                <div key={habit.id} className="group">
                  <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <button
                        onClick={() => toggleHabit(habit.id, 'bad')}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                          habit.completed 
                            ? 'bg-[#fca5a5] border-[#fca5a5] shadow-lg shadow-[#fca5a5]/30' 
                            : 'border-[#666] hover:border-[#fca5a5]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium text-sm sm:text-base break-words ${
                          habit.completed ? 'line-through text-gray-500' : ''
                        }`}>
                          {habit.name}
                        </span>
                        <div className="text-xs text-gray-400 mt-1">
                          {habit.streak} days clean
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id, 'bad')}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all p-1 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {badHabits.length === 0 && (
                <p className="text-gray-400 text-center py-8 text-sm">No habits to avoid yet. Add habits you want to break!</p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section>
          <div className="glass-card rounded-2xl p-6 sm:p-8 hover-lift">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <Target size={20} className="text-[#7dd3fc]" />
                <h2 className="text-lg sm:text-xl font-semibold text-[#7dd3fc]">Active Projects</h2>
              </div>
              <button 
                onClick={() => setShowAddProject(true)}
                className="text-[#7dd3fc] hover:text-white transition-colors p-1"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {showAddProject && (
              <div className="mb-6 p-4 rounded-xl gradient-bg">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                  onKeyPress={(e) => e.key === 'Enter' && addProject()}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={addProject}
                    className="px-4 py-2 bg-[#7dd3fc] text-black rounded-lg text-sm font-medium hover:bg-[#7dd3fc]/80 transition-colors"
                  >
                    Add Project
                  </button>
                  <button
                    onClick={() => setShowAddProject(false)}
                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm hover:bg-[#666] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 sm:gap-6">
              {projects.map(project => (
                <div key={project.id} className="group">
                  <div className="p-4 sm:p-6 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg break-words">{project.name}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{project.lastUpdated}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => updateProgress(project.id, -5)}
                            className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#666] transition-colors flex items-center justify-center text-sm font-bold"
                          >
                            -
                          </button>
                          <span className="text-[#7dd3fc] font-mono text-base sm:text-lg min-w-[3rem] text-center">
                            {project.progress}%
                          </span>
                          <button 
                            onClick={() => updateProgress(project.id, 5)}
                            className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#666] transition-colors flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => deleteProject(project.id)}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-[#1a1a1a] rounded-full h-2 sm:h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            project.progress > 70 ? 'progress-glow' : ''
                          }`}
                          style={{ 
                            width: `${project.progress}%`,
                            background: `linear-gradient(90deg, #7dd3fc, #86efac)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-gray-400 text-center py-8 text-sm">No projects yet. Add your first project to track!</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );

  const ProjectsSection = () => (
    <div className="min-h-screen bg-black text-white pb-20 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <BarChart3 className="text-[#7dd3fc]" size={28} />
          <h1 className="text-3xl font-bold text-[#7dd3fc]">Projects</h1>
        </div>
        
        <div className="glass-card rounded-2xl p-8 hover-lift">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-[#7dd3fc]">Active Projects</h2>
            <button 
              onClick={() => setShowAddProject(true)}
              className="text-[#7dd3fc] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {showAddProject && (
            <div className="mb-6 p-4 rounded-xl gradient-bg">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && addProject()}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={addProject}
                  className="px-4 py-2 bg-[#7dd3fc] text-black rounded-lg text-sm font-medium hover:bg-[#7dd3fc]/80 transition-colors"
                >
                  Add Project
                </button>
                <button
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm hover:bg-[#666] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="grid gap-6">
            {projects.map(project => (
              <div key={project.id} className="group">
                <div className="p-6 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg break-words">{project.name}</h3>
                      <p className="text-gray-400 text-sm">{project.lastUpdated}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateProgress(project.id, -5)}
                          className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#666] transition-colors flex items-center justify-center text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="text-[#7dd3fc] font-mono text-lg min-w-[3rem] text-center">
                          {project.progress}%
                        </span>
                        <button 
                          onClick={() => updateProgress(project.id, 5)}
                          className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#666] transition-colors flex items-center justify-center text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.progress > 70 ? 'progress-glow' : ''
                        }`}
                        style={{ 
                          width: `${project.progress}%`,
                          background: `linear-gradient(90deg, #7dd3fc, #86efac)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No projects yet. Add your first project to track!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ProfileSection = () => (
    <div className="min-h-screen bg-black text-white pb-20 px-4 pt-6">
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
                <div className="text-3xl font-bold text-[#7dd3fc]">{positiveHabits.length}</div>
                <div className="text-gray-400 text-sm">Positive Habits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#fca5a5]">{badHabits.length}</div>
                <div className="text-gray-400 text-sm">Habits to Avoid</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#86efac]">{projects.length}</div>
                <div className="text-gray-400 text-sm">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#7dd3fc]">0</div>
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

  return (
    <div className="min-h-screen bg-black text-white">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}