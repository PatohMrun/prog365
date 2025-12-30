"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Plus, Trash2, Target } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
}

export default function HabitsSection() {
  const [positiveHabits, setPositiveHabits] = useState<Habit[]>([]);
  const [badHabits, setBadHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState<'positive' | 'bad' | null>(null);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    const savedPositive = localStorage.getItem('positiveHabits');
    const savedBad = localStorage.getItem('badHabits');
    
    if (savedPositive) setPositiveHabits(JSON.parse(savedPositive));
    if (savedBad) setBadHabits(JSON.parse(savedBad));
  }, []);

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
    <div className="min-h-screen bg-black text-white pb-20 px-4 pt-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Target className="text-[#7dd3fc]" size={28} />
          <h1 className="text-3xl font-bold text-[#7dd3fc]">Daily Habits</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Positive Habits */}
          <div className="glass-card rounded-2xl p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="text-[#86efac]" size={24} />
                <h2 className="text-xl font-semibold text-[#86efac]">Build Habits</h2>
              </div>
              <button 
                onClick={() => setShowAddHabit('positive')}
                className="text-[#7dd3fc] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
              >
                <Plus size={20} />
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleHabit(habit.id, 'positive')}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                          habit.completed 
                            ? 'bg-[#86efac] border-[#86efac] shadow-lg shadow-[#86efac]/30' 
                            : 'border-[#666] hover:border-[#86efac]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium break-words ${
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
          <div className="glass-card rounded-2xl p-8 hover-lift">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <XCircle className="text-[#fca5a5]" size={24} />
                <h2 className="text-xl font-semibold text-[#fca5a5]">Avoid Today</h2>
              </div>
              <button 
                onClick={() => setShowAddHabit('bad')}
                className="text-[#7dd3fc] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
              >
                <Plus size={20} />
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleHabit(habit.id, 'bad')}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                          habit.completed 
                            ? 'bg-[#fca5a5] border-[#fca5a5] shadow-lg shadow-[#fca5a5]/30' 
                            : 'border-[#666] hover:border-[#fca5a5]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`font-medium break-words ${
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
        </div>
      </div>
    </div>
  );
}