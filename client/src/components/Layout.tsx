import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Radio,
  History,
  Settings,
  Shield,
  Volume2,
  VolumeX,
  LogOut,
  Menu,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAudioStore } from '../stores/audioStore';
import { LanguageSelector } from './LanguageSelector';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { isTtsEnabled, toggleTts } = useAudioStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Live Console', path: '/dashboard', icon: Radio },
    { label: 'Sessions Archive', path: '/sessions', icon: History },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Platform Admin', path: '/admin', icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white font-display flex items-center gap-1">
                  Nebula<span className="text-cyan-400">Voice</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                  Conversational Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/30 shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              <LanguageSelector compact />

              {/* TTS Voice Toggle */}
              <button
                type="button"
                onClick={toggleTts}
                aria-label={isTtsEnabled ? 'Disable auto voice TTS' : 'Enable auto voice TTS'}
                className={`p-2 rounded-xl border transition-all ${
                  isTtsEnabled
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                }`}
                title={isTtsEnabled ? 'Voice Auto-Play ON' : 'Voice Auto-Play OFF'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* User Dropdown / Auth CTA */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/settings"
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-semibold text-slate-300"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.full_name || 'Agent'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase font-bold">
                      {user?.role}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md transition-all active:scale-95"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#070b14] px-4 pt-3 pb-4 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 mb-2 bg-white/5 rounded-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user?.full_name}</span>
                <span className="text-xs text-cyan-400 capitalize">{user?.role}</span>
              </div>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive ? 'bg-indigo-600/30 text-cyan-300' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              <Settings className="w-5 h-5 text-slate-500" />
              <span>Settings</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Minimal Status Footer */}
      <footer className="border-t border-white/10 bg-[#02050b] py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Nebula Voice & Conversational Intelligence Platform</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Mesh Active
            </span>
            <span>•</span>
            <span>Gemini NLU & Memory Buffer</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
