"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { User, LogIn, LogOut } from "lucide-react";

export default function AuthSection() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="glass-card rounded-2xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#1a1a1a] rounded w-1/3"></div>
          <div className="h-4 bg-[#1a1a1a] rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center space-x-4 mb-6">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <User size={24} className="text-[#7dd3fc]" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold">{session.user?.name}</h3>
            <p className="text-gray-400">{session.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <User size={48} className="text-[#7dd3fc] mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Sign In to Save Progress</h3>
      <p className="text-gray-400 mb-6">
        Sign in with Google to sync your habits and projects across devices
      </p>
      <button
        onClick={() => signIn("google")}
        className="flex items-center space-x-2 px-6 py-3 bg-[#7dd3fc] text-black rounded-lg font-medium hover:bg-[#7dd3fc]/80 transition-colors mx-auto"
      >
        <LogIn size={16} />
        <span>Sign In with Google</span>
      </button>
    </div>
  );
}