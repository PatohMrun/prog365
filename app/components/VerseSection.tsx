"use client";

import { useState, useEffect } from "react";
import { BookOpen, RefreshCw, Calendar, X, ChevronRight } from "lucide-react";
import { getReflections, createReflection } from "../actions/reflections";
import { supabase } from "../utils/supabase";

interface BibleVerse {
  text: string;
  reference: string;
}

interface VerseSectionProps {
  verse: BibleVerse | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function VerseSection({ verse, loading, onRefresh }: VerseSectionProps) {
  const [reflectionText, setReflectionText] = useState("");
  const [reflections, setReflections] = useState<any[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<any | null>(null);

  useEffect(() => {
    loadReflections();
  }, []);

  const loadReflections = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;

    const data = await getReflections(session.user.email);
    setReflections(data);
  };

  const handleSave = async () => {
    if (!reflectionText.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;

    const content = reflectionText.trim();
    const tempId = `temp-${Date.now()}`;
    const today = new Date().toLocaleDateString('en-CA');

    // 1. CLEAR INPUT IMMEDIATELY
    setReflectionText("");

    // 2. OPTIMISTIC UPDATE
    const tempReflection = {
      id: tempId,
      content,
      verseReference: verse?.reference || '',
      date: today
    };

    setReflections(prev => [tempReflection, ...prev]);

    // 3. SILENT SYNC
    createReflection(session.user.email, content, verse?.reference || '').then(result => {
      if (result.success && result.reflection) {
        // SWAP TEMP ID WITH REAL ID
        setReflections(prev => prev.map(r => r.id === tempId ? result.reflection : r));
      } else {
        console.error("Failed to save reflection");
        // ROLLBACK (Remove temp item)
        setReflections(prev => prev.filter(r => r.id !== tempId));
        // Restore text (optional, but good UX)
        setReflectionText(content);
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-white pb-24 px-4 pt-6 relative">
      {/* Detail Modal */}
      {selectedReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full shadow-2xl scale-100 animate-scale-in border border-[#7dd3fc]/20 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
              <div className="flex items-center gap-2 text-[#7dd3fc]">
                <Calendar size={18} />
                <span className="font-mono text-sm">{selectedReflection.date}</span>
              </div>
              <button
                onClick={() => setSelectedReflection(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {selectedReflection.verseReference && (
                <p className="text-xs text-gray-500 mb-4 italic border-l-2 border-gray-700 pl-3">
                  Re: {selectedReflection.verseReference}
                </p>
              )}
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedReflection.content}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Active Verse Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="text-[#7dd3fc]" size={24} />
              <h2 className="text-xl font-bold text-[#7dd3fc]">Daily Verse</h2>
            </div>
            <button
              onClick={onRefresh}
              className="text-[#7dd3fc] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-[#1a1a1a] rounded w-full"></div>
              <div className="h-4 bg-[#1a1a1a] rounded w-3/4"></div>
              <div className="h-4 bg-[#1a1a1a] rounded w-1/2"></div>
            </div>
          ) : verse && (
            <div className="space-y-4">
              <blockquote className="text-base leading-relaxed font-light italic text-center text-gray-200">
                "{verse.text}"
              </blockquote>
              <cite className="text-[#7dd3fc] font-medium block text-center text-xs">
                — {verse.reference}
              </cite>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-3 text-[#86efac]">Reflect</h3>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write your thoughts..."
            style={{ touchAction: "pan-y" }}
            className="w-full h-24 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-3 text-sm text-white placeholder-gray-500 resize-none focus:border-[#7dd3fc] focus:outline-none touch-pan-y"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#7dd3fc] text-black text-xs font-bold rounded-lg hover:bg-[#7dd3fc]/80 transition-colors"
            >
              Save Note
            </button>
          </div>
        </div>

        {/* History Table */}
        {reflections.length > 0 && (
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <h3 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-wider">History</h3>
            <div className="overflow-hidden">
              <table className="w-full border-collapse">
                <tbody className="divide-y divide-gray-800/50">
                  {reflections.map((ref) => (
                    <tr
                      key={ref.id}
                      onClick={() => setSelectedReflection(ref)}
                      className="group cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                    >
                      <td className="py-3 pl-1 pr-4 whitespace-nowrap align-middle w-24">
                        <span className="text-[10px] sm:text-xs font-mono text-[#7dd3fc] opacity-80">{ref.date}</span>
                      </td>
                      <td className="py-3 pr-2 align-middle">
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-1 group-hover:text-white transition-colors">
                          {ref.content}
                        </p>
                      </td>
                      <td className="py-3 pr-1 align-middle w-6 text-right">
                        <ChevronRight size={14} className="text-gray-600 group-hover:text-[#7dd3fc] transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}