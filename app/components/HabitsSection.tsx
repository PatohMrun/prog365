"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Plus, Trash2, Target, Pencil, X, Check, AlertTriangle } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
}

export default function HabitsSection() {
  const [positiveHabits, setPositiveHabits] = useState<Habit[]>([]);
  const [badHabits, setBadHabits] = useState<Habit[]>([]);

  // Create State
  const [showAddHabit, setShowAddHabit] = useState<'positive' | 'bad' | null>(null);
  const [newHabitName, setNewHabitName] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Delete Confirmation State
  const [habitToDelete, setHabitToDelete] = useState<{ id: string, type: 'positive' | 'bad' } | null>(null);

  useEffect(() => {
    const savedPositive = localStorage.getItem('positiveHabits');
    const savedBad = localStorage.getItem('badHabits');

    if (savedPositive) setPositiveHabits(JSON.parse(savedPositive));
    if (savedBad) setBadHabits(JSON.parse(savedBad));
  }, []);

  const saveToStorage = (pos: Habit[], bad: Habit[]) => {
    localStorage.setItem('positiveHabits', JSON.stringify(pos));
    localStorage.setItem('badHabits', JSON.stringify(bad));
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
      saveToStorage(updated, badHabits);
    } else {
      const updated = [...badHabits, newHabit];
      setBadHabits(updated);
      saveToStorage(positiveHabits, updated);
    }

    setNewHabitName('');
    setShowAddHabit(null);
  };

  const promptDelete = (id: string, type: 'positive' | 'bad') => {
    setHabitToDelete({ id, type });
  };

  const confirmDelete = () => {
    if (!habitToDelete) return;

    const { id, type } = habitToDelete;
    if (type === 'positive') {
      const updated = positiveHabits.filter(h => h.id !== id);
      setPositiveHabits(updated);
      saveToStorage(updated, badHabits);
    } else {
      const updated = badHabits.filter(h => h.id !== id);
      setBadHabits(updated);
      saveToStorage(positiveHabits, updated);
    }
    setHabitToDelete(null);
  };

  const toggleHabit = (id: string, type: 'positive' | 'bad') => {
    if (type === 'positive') {
      const updated = positiveHabits.map(h =>
        h.id === id ? { ...h, completed: !h.completed } : h
      );
      setPositiveHabits(updated);
      saveToStorage(updated, badHabits);
    } else {
      const updated = badHabits.map(h =>
        h.id === id ? { ...h, completed: !h.completed } : h
      );
      setBadHabits(updated);
      saveToStorage(positiveHabits, updated);
    }
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const saveEdit = (type: 'positive' | 'bad') => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    if (type === 'positive') {
      const updated = positiveHabits.map(h =>
        h.id === editingId ? { ...h, name: editName.trim() } : h
      );
      setPositiveHabits(updated);
      saveToStorage(updated, badHabits);
    } else {
      const updated = badHabits.map(h =>
        h.id === editingId ? { ...h, name: editName.trim() } : h
      );
      setBadHabits(updated);
      saveToStorage(positiveHabits, updated);
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-20 px-4 pt-6 relative">
      {/* Delete Confirmation Modal */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-scale-in border border-[#fca5a5]/20">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Delete Habit?</h3>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Are you sure you want to delete this habit? <br />
              <span className="text-gray-500 italic">This cannot be undone and your streak will be lost.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setHabitToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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
                <h2 className="text-lg font-semibold text-[#86efac]">Build Habits</h2>
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-gray-800">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleHabit(habit.id, 'positive')}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${habit.completed
                          ? 'bg-[#86efac] border-[#86efac] shadow-lg shadow-[#86efac]/30'
                          : 'border-[#666] hover:border-[#86efac]'
                          }`}
                      />

                      {editingId === habit.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit('positive')}
                            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-sm focus:border-[#86efac] outline-none"
                            autoFocus
                          />
                          <button onClick={() => saveEdit('positive')} className="text-[#86efac] hover:text-white p-1"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white p-1"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium break-words ${habit.completed ? 'line-through text-gray-500' : ''
                            }`}>
                            {habit.name}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {habit.streak} day streak
                          </div>
                        </div>
                      )}
                    </div>

                    {!editingId && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(habit)}
                          className="text-gray-400 hover:text-[#7dd3fc] p-2 hover:bg-[#7dd3fc]/10 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => promptDelete(habit.id, 'positive')}
                          className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
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
                <h2 className="text-lg font-semibold text-[#fca5a5]">Avoid Today</h2>
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-gray-800">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => toggleHabit(habit.id, 'bad')}
                        className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${habit.completed
                          ? 'bg-[#fca5a5] border-[#fca5a5] shadow-lg shadow-[#fca5a5]/30'
                          : 'border-[#666] hover:border-[#fca5a5]'
                          }`}
                      />

                      {editingId === habit.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit('bad')}
                            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded px-2 py-1 text-sm focus:border-[#fca5a5] outline-none"
                            autoFocus
                          />
                          <button onClick={() => saveEdit('bad')} className="text-[#fca5a5] hover:text-white p-1"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white p-1"><X size={14} /></button>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <span className={`font-medium break-words ${habit.completed ? 'line-through text-gray-500' : ''
                            }`}>
                            {habit.name}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            {habit.streak} days clean
                          </div>
                        </div>
                      )}
                    </div>

                    {!editingId && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(habit)}
                          className="text-gray-400 hover:text-[#7dd3fc] p-2 hover:bg-[#7dd3fc]/10 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => promptDelete(habit.id, 'bad')}
                          className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
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