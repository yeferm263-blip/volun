import React from 'react';
import { Menu, Calendar, Layers, BookOpen, Info, LogIn, User, Trophy } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

interface PublicHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenDrawer: () => void;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenDrawer,
}) => {
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#050A14]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <button
          id="public-header-brand-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <Logo size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-sky-300 transition-colors leading-none">
                DMPS Connect
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.5 rounded-full">
                HUB
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:block">
              Conectando Familias & Comunidad
            </span>
          </div>
        </button>

        {/* Center: Desktop Quick Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              currentView === 'home'
                ? 'text-sky-300 bg-sky-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => onNavigate('public-ranking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'public-ranking'
                ? 'text-amber-300 bg-amber-500/10'
                : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Ranking & Cuadro de Honor</span>
          </button>
          <button
            onClick={() => onNavigate('public-events')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'public-events' || currentView === 'public-event-detail'
                ? 'text-sky-300 bg-sky-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Eventos</span>
          </button>
          <button
            onClick={() => onNavigate('apps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'apps'
                ? 'text-sky-300 bg-sky-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Nuestras Apps</span>
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'about'
                ? 'text-sky-300 bg-sky-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Sobre Nosotros</span>
          </button>
          <button
            onClick={() => onNavigate('resources')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'resources'
                ? 'text-sky-300 bg-sky-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Recursos</span>
          </button>
        </nav>

        {/* Right: Actions & Main Drawer Toggle ☰ */}
        <div className="flex items-center gap-2.5">
          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <button
                id="header-login-btn"
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/80 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Ingresar</span>
              </button>
              <button
                id="header-register-btn"
                onClick={() => onNavigate('register')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-md shadow-blue-900/30 transition-all active:scale-95"
              >
                Crear Cuenta
              </button>
            </div>
          ) : (
            <button
              id="header-account-btn"
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-sky-500/30 text-xs font-semibold text-sky-300 hover:bg-blue-900/50 transition-all"
            >
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Mi Cuenta ({user.role})</span>
            </button>
          )}

          {/* Main ☰ Button (ALWAYS available as the primary access to the full public menu) */}
          <button
            id="public-drawer-toggle-btn"
            onClick={onOpenDrawer}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-sky-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-md active:scale-95 flex items-center gap-2"
            aria-label="Abrir menú de navegación"
            title="Menú general DMPS Connect"
          >
            <Menu className="w-5 h-5 text-sky-400" />
            <span className="text-xs font-bold hidden xs:inline text-slate-200">
              Menú
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
