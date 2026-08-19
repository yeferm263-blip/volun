import React, { useEffect } from 'react';
import {
  Home,
  Info,
  Layers,
  Calendar,
  HeartHandshake,
  BookOpen,
  Image as ImageIcon,
  HelpCircle,
  Mail,
  LogIn,
  UserPlus,
  UserCheck,
  X,
  ExternalLink,
  Trophy,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';

interface PublicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const PublicDrawer: React.FC<PublicDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
}) => {
  const { user, profile } = useAuth();

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavClick = (view: string) => {
    onNavigate(view);
    onClose();
  };

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'public-ranking', label: 'Ranking & Cuadro de Honor', icon: Trophy },
    { id: 'about', label: 'Sobre DMPS Connect', icon: Info },
    { id: 'apps', label: 'Nuestras Apps', icon: Layers },
    { id: 'public-events', label: 'Eventos', icon: Calendar },
    { id: 'volunteer-info', label: 'Voluntariado', icon: HeartHandshake },
    { id: 'resources', label: 'Recursos', icon: BookOpen },
    { id: 'gallery', label: 'Galería', icon: ImageIcon },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle },
    { id: 'contact', label: 'Contacto', icon: Mail },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" id="public-drawer-overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        id="public-drawer-panel"
        className="relative z-10 w-[85%] sm:w-[380px] max-w-full h-full bg-[#07111F]/95 backdrop-blur-xl border-l border-sky-500/20 text-slate-100 flex flex-col shadow-2xl shadow-black/80 transition-transform duration-300 animate-slideLeft"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#050A14]/80">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <span className="font-extrabold text-white text-base tracking-tight leading-none block">
                DMPS Connect
              </span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wide">
                HUB CENTRAL
              </span>
            </div>
          </div>
          <button
            id="public-drawer-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar">
          {/* Main Navigation Links */}
          <nav className="space-y-1" aria-label="Menú público general">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-700/60 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-sky-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="h-px bg-slate-800/80 my-2" />

          {/* Apps Externas Shortcut */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
              Ecosistema Digital
            </span>
            <a
              href="https://info.familiasdmps.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-sky-300 hover:bg-sky-950/30 border border-slate-800/60 hover:border-sky-500/30 transition-all"
            >
              <span>DMPS Info</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <a
              href="https://status.familiasdmps.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-amber-300 hover:bg-amber-950/20 border border-slate-800/60 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <span>DMPS Status</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                  OPERATIVO
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>

          {/* Account Authentication Section */}
          <div className="pt-2">
            {!user ? (
              <div className="space-y-2.5">
                <button
                  id="drawer-login-btn"
                  onClick={() => handleNavClick('login')}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-md active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-sky-400" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  id="drawer-register-btn"
                  onClick={() => handleNavClick('register')}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Cuenta</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/40 border border-sky-500/30 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sky-300 font-bold text-xs">
                    {profile?.first_name ? profile.first_name[0] : user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
                    </p>
                    <p className="text-[10px] text-sky-400 font-mono">
                      {user.role} {profile?.volunteer_id ? `• ${profile.volunteer_id}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  id="drawer-account-btn"
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Ir a Mi Cuenta</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800/80 bg-[#050A14]/90 text-center">
          <p className="text-xs font-bold text-slate-200">DMPS Connect</p>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            "Conectando Familias, Información y Personas."
          </p>
        </div>
      </aside>
    </div>
  );
};
