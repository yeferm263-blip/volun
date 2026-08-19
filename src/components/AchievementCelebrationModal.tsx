import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Crown,
  Medal,
  Star,
  Sparkles,
  Trophy,
  Gem,
  CheckCircle2,
  ChevronRight,
  X,
  Flame,
  Zap,
  Heart,
  Globe,
  Smile,
  Users,
  Compass,
  FileCheck,
  Building,
  GraduationCap,
} from 'lucide-react';
import { AchievementBadge } from '../data/achievementsCatalog';

interface AchievementCelebrationModalProps {
  badges: AchievementBadge[];
  onClose: () => void;
  onNavigateToCertificates?: () => void;
}

export const AchievementCelebrationModal: React.FC<AchievementCelebrationModalProps> = ({
  badges,
  onClose,
  onNavigateToCertificates,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBadge = badges[currentIndex];
  const is160GrandFinale = currentBadge?.id === 'badge_hrs_160' || (currentBadge?.unlockedAt?.hours && currentBadge.unlockedAt.hours >= 160);

  // Trigger celebration confetti on mount and when changing badge
  useEffect(() => {
    if (!currentBadge) return;

    if (is160GrandFinale) {
      // Grand Golden Fireworks for 160h Grand Finale!
      const end = Date.now() + 2500;
      const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FFFFFF', '#6366F1'];

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 9999,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 9999,
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      // Standard joyful confetti burst
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#FBBF24'],
        zIndex: 9999,
      });
    }
  }, [currentIndex, is160GrandFinale, currentBadge]);

  if (!currentBadge) return null;

  // Icon mapping
  const renderIcon = (iconName: string, size = 48) => {
    switch (iconName) {
      case 'Crown':
        return <Crown size={size} className="text-amber-300 drop-shadow-md" />;
      case 'Trophy':
        return <Trophy size={size} className="text-amber-300 drop-shadow-md" />;
      case 'Gem':
        return <Gem size={size} className="text-purple-300 drop-shadow-md" />;
      case 'Medal':
        return <Medal size={size} className="text-amber-300 drop-shadow-md" />;
      case 'Star':
        return <Star size={size} className="text-yellow-300 drop-shadow-md fill-yellow-300" />;
      case 'Flame':
        return <Flame size={size} className="text-orange-400 drop-shadow-md" />;
      case 'Zap':
        return <Zap size={size} className="text-sky-300 drop-shadow-md" />;
      case 'Heart':
        return <Heart size={size} className="text-rose-400 drop-shadow-md" />;
      case 'Globe':
        return <Globe size={size} className="text-cyan-300 drop-shadow-md" />;
      case 'Users':
        return <Users size={size} className="text-blue-300 drop-shadow-md" />;
      case 'Smile':
        return <Smile size={size} className="text-emerald-300 drop-shadow-md" />;
      case 'Sparkle':
      case 'Sparkles':
      default:
        return <Sparkles size={size} className="text-amber-300 drop-shadow-md" />;
    }
  };

  const handleNext = () => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Container Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0B1728] via-[#07111F] to-[#040810] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col items-center">
        {/* Background Rotating Golden Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[conic-gradient(from_0deg,transparent_0deg,#F59E0B30_25deg,transparent_50deg,#F59E0B30_75deg,transparent_100deg,#F59E0B30_125deg,transparent_150deg,#F59E0B30_175deg,transparent_200deg,#F59E0B30_225deg,transparent_250deg,#F59E0B30_275deg,transparent_300deg,#F59E0B30_325deg,transparent_360deg)] rounded-full animate-gold-rays pointer-events-none opacity-80" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/20 blur-[90px] rounded-full pointer-events-none" />

        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20"
          title="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Counter Pill if multiple badges */}
        {badges.length > 1 && (
          <div className="relative z-10 mb-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
            Reconocimiento {currentIndex + 1} de {badges.length}
          </div>
        )}

        {/* Header Ribbon / Pill */}
        <div className="relative z-10 mb-3">
          {is160GrandFinale ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/30">
              <Crown size={14} className="animate-pulse" />
              <span>🎓 MÁXIMO GALARDÓN • 160 HORAS</span>
              <Crown size={14} className="animate-pulse" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles size={13} className="text-amber-400" />
              <span>¡NUEVO LOGRO DESBLOQUEADO!</span>
            </div>
          )}
        </div>

        {/* Central 3D Spinning Golden Medallion */}
        <div className="relative z-10 my-4 flex items-center justify-center">
          {/* Outer Pulsing Golden Halo Ring */}
          <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-amber-400/40 animate-ping opacity-25 pointer-events-none" />
          <div className="absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

          {/* 3D Spinning Medal */}
          <div className="animate-gold-float">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 p-1 shadow-[0_0_40px_rgba(245,158,11,0.6)] border-2 border-amber-200 animate-spin-3d flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-[#121E33] via-[#091322] to-[#040914] border border-amber-400/50 flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-inner">
                {/* Shiny highlight overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none" />
                {renderIcon(currentBadge.iconName, is160GrandFinale ? 46 : 42)}
                <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider mt-1 drop-shadow">
                  {currentBadge.categoryLabel?.split(' ')[0] || 'DMPS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Celebratory Details */}
        <div className="relative z-10 space-y-2 mt-2 max-w-md">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {is160GrandFinale ? (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200">
                ¡Has Completado Oficialmente el Programa Silver Cord!
              </span>
            ) : (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">
                {currentBadge.name}
              </span>
            )}
          </h2>

          {is160GrandFinale ? (
            <div className="space-y-3 pt-1">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ¡Felicidades! Has cumplido la meta oficial de <strong>160 horas de servicio solidario</strong> en el Distrito Escolar de Des Moines.
              </p>

              {/* Graduation Honors Breakdown */}
              <div className="p-3.5 rounded-2xl bg-[#071324]/90 border border-amber-500/40 text-left space-y-2 text-xs">
                <div className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={15} />
                  <span>Beneficios y Honores de Graduación:</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200 text-[11px]">
                  <CheckCircle2 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Cordón de Plata Oficial (Silver Cord)</strong> para portar en la Ceremonia de Graduación.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200 text-[11px]">
                  <CheckCircle2 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Medallón de Excelencia Cívica</strong> y Mención de Honor Distrital Permanente.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200 text-[11px]">
                  <CheckCircle2 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Certificado de Honor Dorado</strong> con folio oficial y QR verificable.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-200 text-[11px]">
                  <CheckCircle2 size={13} className="text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Distintivo de Graduado</strong> visible en tu perfil distrital.</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-300/90 italic">
                ✨ ¡Puedes continuar registrando más horas y desbloqueando insignias adicionales sin límite!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentBadge.description}
              </p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Requisito cumplido: {currentBadge.requirement}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 w-full mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {is160GrandFinale && onNavigateToCertificates && (
            <button
              onClick={() => {
                onClose();
                onNavigateToCertificates();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Award size={15} />
              <span>Ver Mi Diploma Dorado Oficial</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
              is160GrandFinale
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/25'
            }`}
          >
            <span>{currentIndex < badges.length - 1 ? 'Siguiente Logro' : '¡Genial, Continuar!'}</span>
            {currentIndex < badges.length - 1 ? <ChevronRight size={15} /> : <Sparkles size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
};
