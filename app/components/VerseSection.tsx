"use client";

import { useState, useEffect } from "react";
import { BookOpen, RefreshCw } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-transparent text-white pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
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
              <div className="h-6 bg-[#1a1a1a] rounded w-full"></div>
              <div className="h-6 bg-[#1a1a1a] rounded w-3/4"></div>
              <div className="h-6 bg-[#1a1a1a] rounded w-1/2"></div>
              <div className="h-4 bg-[#1a1a1a] rounded w-1/3 mt-6"></div>
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

        <div className="mt-6 glass-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-3 text-[#86efac]">Reflection</h3>
          <textarea
            placeholder="Write your thoughts about today's verse..."
            style={{ touchAction: "pan-y" }}
            className="w-full h-32 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:border-[#7dd3fc] focus:outline-none touch-pan-y"
          />
          <button className="mt-4 px-6 py-2 bg-[#7dd3fc] text-black rounded-lg font-medium hover:bg-[#7dd3fc]/80 transition-colors">
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}