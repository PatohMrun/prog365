"use client";

import { useState, useEffect } from "react";
import { BookOpen, RefreshCw } from "lucide-react";

interface BibleVerse {
  text: string;
  reference: string;
}

export default function VerseSection() {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchVerse();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-8 hover-lift animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="text-[#7dd3fc]" size={24} />
              <h2 className="text-2xl font-semibold text-[#7dd3fc]">Daily Verse</h2>
            </div>
            <button 
              onClick={fetchVerse}
              className="text-[#7dd3fc] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
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
            <div className="space-y-6">
              <blockquote className="text-xl leading-relaxed font-light italic text-center">
                "{verse.text}"
              </blockquote>
              <cite className="text-[#7dd3fc] font-medium block text-center text-lg">
                — {verse.reference}
              </cite>
            </div>
          )}
        </div>
        
        <div className="mt-8 glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#86efac]">Reflection</h3>
          <textarea 
            placeholder="Write your thoughts about today's verse..."
            className="w-full h-32 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:border-[#7dd3fc] focus:outline-none"
          />
          <button className="mt-4 px-6 py-2 bg-[#7dd3fc] text-black rounded-lg font-medium hover:bg-[#7dd3fc]/80 transition-colors">
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}