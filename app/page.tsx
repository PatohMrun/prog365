"use client";

import { useState, useEffect } from "react";

interface BibleVerse {
  text: string;
  reference: string;
}

interface Habit {
  id: string;
  name: string;
  completed: boolean;
}

interface Project {
  id: string;
  name: string;
  progress: number;
}

export default function Home() {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [positiveHabits, setPositiveHabits] = useState<Habit[]>([]);
  const [badHabits, setBadHabits] = useState<Habit[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

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
      const response = await fetch('https://bible-api.com/john 3:16');
      const data = await response.json();
      setVerse({ text: data.text, reference: data.reference });
    } catch (error) {
      setVerse({ text: "For God so loved the world...", reference: "John 3:16" });
    }
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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#7dd3fc] to-white bg-clip-text text-transparent">
            MRun365
          </h1>
          <p className="text-[#333333] mt-2">Daily Growth Tracker</p>
        </header>

        {/* Bible Verse */}
        <div className="gradient-card rounded-xl p-6 border border-[#333333]">
          <h2 className="text-xl font-semibold text-[#7dd3fc] mb-4">Daily Verse</h2>
          {verse && (
            <div>
              <p className="text-lg leading-relaxed mb-2">"{verse.text}"</p>
              <p className="text-[#333333] text-right">- {verse.reference}</p>
            </div>
          )}
        </div>

        {/* Habits Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Positive Habits */}
          <div className="gradient-card rounded-xl p-6 border border-[#333333]">
            <h2 className="text-xl font-semibold text-[#86efac] mb-4">Good Habits</h2>
            <div className="space-y-3">
              {positiveHabits.map(habit => (
                <div key={habit.id} className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleHabit(habit.id, 'positive')}
                    className={`w-5 h-5 rounded border-2 ${
                      habit.completed 
                        ? 'bg-[#86efac] border-[#86efac]' 
                        : 'border-[#333333]'
                    }`}
                  />
                  <span className={habit.completed ? 'line-through text-[#333333]' : ''}>
                    {habit.name}
                  </span>
                </div>
              ))}
              <button className="text-[#7dd3fc] text-sm hover:underline">
                + Add habit
              </button>
            </div>
          </div>

          {/* Bad Habits */}
          <div className="gradient-card rounded-xl p-6 border border-[#333333]">
            <h2 className="text-xl font-semibold text-[#fca5a5] mb-4">Avoid Today</h2>
            <div className="space-y-3">
              {badHabits.map(habit => (
                <div key={habit.id} className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleHabit(habit.id, 'bad')}
                    className={`w-5 h-5 rounded border-2 ${
                      habit.completed 
                        ? 'bg-[#fca5a5] border-[#fca5a5]' 
                        : 'border-[#333333]'
                    }`}
                  />
                  <span className={habit.completed ? 'line-through text-[#333333]' : ''}>
                    {habit.name}
                  </span>
                </div>
              ))}
              <button className="text-[#7dd3fc] text-sm hover:underline">
                + Add habit
              </button>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="gradient-card rounded-xl p-6 border border-[#333333]">
          <h2 className="text-xl font-semibold text-[#7dd3fc] mb-4">Projects</h2>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>{project.name}</span>
                  <span className="text-[#333333] text-sm">{project.progress}%</span>
                </div>
                <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#7dd3fc] to-[#86efac] h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
            <button className="text-[#7dd3fc] text-sm hover:underline">
              + Add project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
