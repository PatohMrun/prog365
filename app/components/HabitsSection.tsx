"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Trash2, Edit2, Shield, Flame, Archive, RotateCcw, X, AlertTriangle } from "lucide-react";
import { getHabits, createHabit, toggleHabit, updateHabitName, updateHabitStatus } from "../actions/habits";
import { supabase } from "../utils/supabase";

interface HabitsSectionProps {
  habitsData: { positive: any[], negative: any[] };
  setHabitsData: React.Dispatch<React.SetStateAction<{ positive: any[], negative: any[] }>>;
  onUpdate: () => Promise<void>;
}

export default function HabitsSection({ habitsData, setHabitsData, onUpdate }: HabitsSectionProps) {
  const { positive: positiveHabits, negative: badHabits } = habitsData;
  const [newHabitName, setNewHabitName] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Delete/Archive Confirmation State
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'positive' | 'bad', action: 'delete' | 'archive' } | null>(null);

  const addHabit = async (type: 'positive' | 'bad') => {
    if (!newHabitName.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;

    await createHabit(session.user.email, newHabitName.trim(), type === 'positive' ? 'positive' : 'negative');
    setNewHabitName('');
    onUpdate();
  };

  const handleToggle = async (id: string, type: 'positive' | 'negative' = 'positive') => {
    // Optimistic Update
    const updater = (h: any) => h.id === id ? { ...h, completed: !h.completed } : h;

    setHabitsData(prev => ({
      ...prev,
      positive: type === 'positive' ? prev.positive.map(updater) : prev.positive,
      negative: type === 'negative' ? prev.negative.map(updater) : prev.negative
    }));

    await toggleHabit(id);
    onUpdate();
  };

  const startEdit = (habit: any) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const saveEdit = async (id: string, type: 'positive' | 'bad') => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    await updateHabitName(id, editName);
    setEditingId(null);
    onUpdate();
  };

  const promptAction = (id: string, type: 'positive' | 'bad', action: 'delete' | 'archive') => {
    setItemToDelete({ id, type, action });
  };

  const confirmAction = async () => {
    if (!itemToDelete) return;
    const { id, action } = itemToDelete;

    await updateHabitStatus(id, action === 'delete' ? 'deleted' : 'archived');
    setItemToDelete(null);
    onUpdate();
  };

  const restoreHabit = async (id: string) => {
    await updateHabitStatus(id, 'active');
    onUpdate();
  };

  // Filter Views
  const displayedPositive = positiveHabits.filter(h =>
    activeTab === 'active' ? (!h.status || h.status === 'active') : h.status === 'archived'
  );
  const displayedNegative = badHabits.filter(h =>
    activeTab === 'active' ? (!h.status || h.status === 'active') : h.status === 'archived'
  );

  return (
    <div className="min-h-screen bg-transparent text-white pb-24 px-4 pt-6 relative">
      {/* Action Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-scale-in border border-[#fca5a5]/20">
            <h3 className="text-lg font-bold mb-2">
              {itemToDelete.action === 'archive' ? 'Stop Tracking?' : 'Delete Forever?'}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {itemToDelete.action === 'archive'
                ? "This habit will be moved to history. You can restore it anytime."
                : "This will permanently delete this habit and all its history."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 py-3 rounded-xl border transition-colors font-medium text-sm ${itemToDelete.action === 'archive'
                  ? 'bg-[#7dd3fc]/10 text-[#7dd3fc] border-[#7dd3fc]/20 hover:bg-[#7dd3fc]/20'
                  : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                  }`}
              >
                {itemToDelete.action === 'archive' ? 'Archive' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Flame className="text-[#86efac]" size={24} />
            <h1 className="text-2xl font-bold text-[#86efac]">Habits</h1>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#0f0f0f] rounded-xl p-1 gap-1 border border-[#1a1a1a]">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'active'
                ? 'bg-[#1a1a1a] text-[#86efac] shadow-sm border border-[#86efac]/20'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'archived'
                ? 'bg-[#1a1a1a] text-[#86efac] shadow-sm border border-[#86efac]/20 ring-1 ring-[#86efac]/10'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              History
            </button>
          </div>
        </div>

        {/* ACTIVE VIEW - CREATE INPUTS */}
        {activeTab === 'active' && (
          <>
            <div className="glass-card rounded-2xl p-5 mb-6 border border-[#262626]">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="New habit name..."
                  className="flex-1 bg-[#0f0f0f]/60 border border-[#262626] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#86efac]/50 transition-colors backdrop-blur-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => addHabit('positive')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#86efac]/10 text-[#86efac] border border-[#86efac]/20 rounded-xl text-sm font-bold hover:bg-[#86efac] hover:text-black transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus size={18} /> Build
                  </button>
                  <button
                    onClick={() => addHabit('bad')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#fca5a5]/10 text-[#fca5a5] border border-[#fca5a5]/20 rounded-xl text-sm font-bold hover:bg-[#fca5a5] hover:text-black transition-all hover:scale-105 active:scale-95"
                  >
                    <Shield size={18} /> Avoid
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="space-y-6">
          {/* BUILDING / RESTORING HABITS */}
          {(displayedPositive.length > 0 || activeTab === 'active') && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#86efac]/80 flex items-center gap-2 px-1">
                {activeTab === 'active' ? 'Building' : 'Archived (Building)'}
                <span className="bg-[#86efac]/10 text-[#86efac] px-1.5 py-0.5 rounded text-[10px] border border-[#86efac]/10">{displayedPositive.length}</span>
              </h2>
              <div className="grid gap-2">
                {displayedPositive.map(habit => (
                  <div key={habit.id} className="group bg-[#0f0f0f]/80 p-3 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-[#86efac]/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {activeTab === 'active' ? (
                        <button
                          onClick={() => handleToggle(habit.id, 'positive')}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${habit.completed
                            ? 'bg-[#86efac] border-[#86efac] text-black shadow-[0_0_15px_rgba(134,239,172,0.3)]'
                            : 'bg-[#1a1a1a] border-[#262626] text-gray-600 hover:border-[#86efac]/50'
                            }`}
                        >
                          <Check size={18} className={`transition-transform duration-300 ${habit.completed ? 'scale-100' : 'scale-0'}`} />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-gray-600 flex-shrink-0">
                          <Archive size={18} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {editingId === habit.id ? (
                          <div className="flex gap-2">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-[#0f0f0f] border border-[#262626] rounded px-2 py-1 text-sm text-white w-full"
                              autoFocus
                            />
                            <button onClick={() => saveEdit(habit.id, 'positive')} className="p-1 bg-[#86efac] text-black rounded hover:bg-[#86efac]/80"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-[#262626] text-white rounded hover:bg-[#333]"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <h3 className={`font-medium text-sm truncate pr-2 transition-all ${habit.completed ? 'text-[#86efac]' : 'text-gray-200'}`}>
                              {habit.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                <Flame size={10} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-600"} />
                                <span className={habit.streak > 0 ? "text-orange-400" : ""}>{habit.streak} day streak</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {activeTab === 'active' ? (
                        !editingId && (
                          <>
                            <button onClick={() => startEdit(habit)} className="p-1.5 text-gray-500 hover:text-[#86efac] hover:bg-[#86efac]/10 rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => promptAction(habit.id, 'positive', 'archive')} className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors" title="Archive">
                              <Archive size={14} />
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          <button onClick={() => restoreHabit(habit.id)} className="p-1.5 text-[#86efac] hover:bg-[#86efac]/10 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold px-2.5">
                            <RotateCcw size={12} />
                          </button>
                          <button onClick={() => promptAction(habit.id, 'positive', 'delete')} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {displayedPositive.length === 0 && (
                  <p className="text-gray-600 text-center py-6 text-xs italic">
                    {activeTab === 'active' ? "No active habits." : "No archived habits."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AVOIDING / RESTORING BAD HABITS */}
          {(displayedNegative.length > 0 || activeTab === 'active') && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-[#fca5a5]/80 flex items-center gap-2 px-1">
                {activeTab === 'active' ? 'Avoiding' : 'Archived (Avoiding)'}
                <span className="bg-[#fca5a5]/10 text-[#fca5a5] px-1.5 py-0.5 rounded text-[10px] border border-[#fca5a5]/10">{displayedNegative.length}</span>
              </h2>
              <div className="grid gap-2">
                {displayedNegative.map(habit => (
                  <div key={habit.id} className="group bg-[#0f0f0f]/80 p-3 rounded-xl flex items-center justify-between hover:bg-[#1a1a1a] transition-all border border-transparent hover:border-[#fca5a5]/30">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {activeTab === 'active' ? (
                        <button
                          onClick={() => handleToggle(habit.id)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 border ${habit.completed
                            ? 'bg-[#86efac] border-[#86efac] text-black shadow-[0_0_15px_rgba(134,239,172,0.3)]'
                            : 'bg-[#1a1a1a] border-[#262626] text-gray-600 hover:border-[#86efac]/50'
                            }`}
                        >
                          <Shield size={18} className={`transition-transform duration-300 ${habit.completed ? 'scale-110' : 'scale-100'}`} />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-gray-600 flex-shrink-0">
                          <Archive size={18} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {editingId === habit.id ? (
                          <div className="flex gap-2">
                            <input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="bg-[#0f0f0f] border border-[#262626] rounded px-2 py-1 text-sm text-white w-full"
                              autoFocus
                            />
                            <button onClick={() => saveEdit(habit.id, 'bad')} className="p-1 bg-[#86efac] text-black rounded hover:bg-[#86efac]/80"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1 bg-[#262626] text-white rounded hover:bg-[#333]"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <h3 className={`font-medium text-sm truncate pr-2 transition-all ${habit.completed ? 'text-[#fca5a5] line-through opacity-50' : 'text-gray-200'}`}>
                              {habit.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                <Flame size={10} className={habit.streak > 0 ? "text-orange-500 fill-orange-500" : "text-gray-600"} />
                                <span className={habit.streak > 0 ? "text-orange-400" : ""}>{habit.streak} day streak</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {activeTab === 'active' ? (
                        !editingId && (
                          <>
                            <button onClick={() => startEdit(habit)} className="p-1.5 text-gray-500 hover:text-[#7dd3fc] hover:bg-[#7dd3fc]/10 rounded-lg transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => promptAction(habit.id, 'bad', 'archive')} className="p-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors" title="Archive">
                              <Archive size={14} />
                            </button>
                          </>
                        )
                      ) : (
                        <>
                          <button onClick={() => restoreHabit(habit.id)} className="p-1.5 text-[#86efac] hover:bg-[#86efac]/10 rounded-lg transition-colors flex items-center gap-1.5 text-[10px] font-bold px-2.5">
                            <RotateCcw size={12} />
                          </button>
                          <button onClick={() => promptAction(habit.id, 'bad', 'delete')} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {displayedNegative.length === 0 && (
                  <p className="text-gray-600 text-center py-6 text-xs italic">
                    {activeTab === 'active' ? "No habits to avoid added yet." : "No archived items."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}