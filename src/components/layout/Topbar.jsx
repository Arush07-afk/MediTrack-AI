import React from 'react';
import { RefreshCw, Bell, HelpCircle, Power, Menu, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0"
      style={{ borderBottom: '1px solid #ede9fe', boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>

      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden text-violet-500 p-1.5 hover:bg-violet-50 rounded-lg transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <Activity size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-sm sm:text-base uppercase tracking-wide leading-none truncate text-gray-800">
              MediTrack <span className="text-violet-600">AI</span>
            </h1>
            <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-widest hidden sm:block mt-0.5">
              Real-Time Bed Tracking System
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-3">

        {/* Live pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full mr-2 bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />
          <span className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider">Live</span>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-gray-400 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-all"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>

        <button
          className="hidden sm:flex text-gray-400 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-all relative"
          title="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
        </button>

        <button
          className="hidden sm:flex text-gray-400 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-all"
          title="Help"
        >
          <HelpCircle size={16} />
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl ml-1 cursor-pointer
          hover:bg-violet-50 transition-all border border-violet-100">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            {(user?.name?.[0] ?? 'U').toUpperCase()}
          </div>
          <span className="hidden sm:inline text-sm font-semibold text-gray-700">
            {user?.name?.split(' ')[0] ?? 'User'}
          </span>
        </div>

        <button
          onClick={logout}
          className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all ml-0.5"
          title="Sign out"
        >
          <Power size={16} />
        </button>
      </div>
    </header>
  );
}
