import React, { useState, useEffect, useMemo } from 'react';
import { api, formatMinutes } from '../../services/api';
import { PublicVolunteerDetail, PublicReview, PodiumMedal } from '../../types';
import {
  ACHIEVEMENTS_CATALOG,
  checkBadgeUnlocked,
} from '../../data/achievementsCatalog';
import {
  Trophy,
  Star,
  Search,
  Award,
  Shield,
  Medal,
  Crown,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  Send,
  User,
  GraduationCap,
  Calendar,
  ThumbsUp,
  Flame,
  ArrowUpDown,
  BookOpen,
  AlertTriangle,
  Flag,
  Info,
  Clock,
  Check,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicVolunteersRankingViewProps {
  onNavigate: (view: string) => void;
}

export const PublicVolunteersRankingView: React.FC<PublicVolunteersRankingViewProps> = ({
  onNavigate,
}) => {
  const [volunteers, setVolunteers] = useState<PublicVolunteerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('ALL');
  const [sortBy, setSortBy] = useState<'hours' | 'rating' | 'reviews' | 'recent'>('hours');

  // Selected volunteer for public detail modal & review submission
  const [selectedVolunteer, setSelectedVolunteer] = useState<PublicVolunteerDetail | null>(null);
  const [reviewsList, setReviewsList] = useState<PublicReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review submission state (Super simplified: 1-5 rating + optional message + optional name)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [starRating, setStarRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

  // Review reporting state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportedReviewsSet, setReportedReviewsSet] = useState<Set<string>>(new Set());

  // View mode toggle for leaderboard (Podium + Table vs Full Grid)
  const [viewMode, setViewMode] = useState<'podium_table' | 'cards'>('podium_table');

  // Fetch volunteers list
  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicVolunteers({
        search: searchQuery.trim() || undefined,
        school: selectedSchool !== 'ALL' ? selectedSchool : undefined,
        sort: sortBy,
      });
      setVolunteers(res.volunteers || []);
    } catch (err) {
      console.error('Error loading public volunteers ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [searchQuery, selectedSchool, sortBy]);

  // Load reviews when volunteer is selected
  const handleSelectVolunteer = async (vol: PublicVolunteerDetail) => {
    setSelectedVolunteer(vol);
    setShowReviewForm(false);
    setReviewSuccessMsg(null);
    setReviewErrorMsg(null);
    setReportingReviewId(null);

    try {
      setLoadingReviews(true);
      const res = await api.getVolunteerReviews(vol.id);
      setReviewsList(res.reviews || []);
    } catch (err) {
      console.error('Error fetching volunteer reviews:', err);
      setReviewsList([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Submit a public review (simplified)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;

    try {
      setSubmittingReview(true);
      setReviewErrorMsg(null);

      const res = await api.submitVolunteerReview(selectedVolunteer.id, {
        rating: starRating,
        reviewer_name: reviewerName.trim() || undefined,
        message: reviewMessage.trim() || undefined,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      setReviewSuccessMsg('¡Gracias por dejar tu reseña y reconocer a este voluntario!');
      setReviewerName('');
      setReviewMessage('');
      setShowReviewForm(false);

      // Refresh reviews list
      const updatedReviews = await api.getVolunteerReviews(selectedVolunteer.id);
      setReviewsList(updatedReviews.reviews || []);

      // Update selected volunteer local numbers
      setSelectedVolunteer((prev) =>
        prev
          ? {
              ...prev,
              rating_avg: res.rating_avg ?? prev.rating_avg,
              rating_count: res.rating_count ?? prev.rating_count + 1,
            }
          : null
      );

      // Refresh main directory in background
      fetchVolunteers();
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'Error al enviar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Quick report an inappropriate review using one of the 3 buttons
  const handleQuickReport = async (reviewId: string, reasonLabel: string) => {
    try {
      setSubmittingReport(true);
      await api.reportVolunteerReview(reviewId, {
        reason: reasonLabel,
        reporter_name: 'Comunidad DMPS',
        details: 'Reportado mediante botones de denuncia rápida en el portal público.',
      });

      setReportedReviewsSet((prev) => new Set(prev).add(reviewId));
      setReviewSuccessMsg(`⚠️ Denuncia por "${reasonLabel}" enviada al Staff para revisión y retiro.`);
      setTimeout(() => setReviewSuccessMsg(null), 5000);
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'Error al enviar la denuncia de la reseña.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Calculate unlocked badges for a given volunteer
  const getVolunteerBadges = (vol: PublicVolunteerDetail) => {
    const statsObj = {
      approvedHours: vol.approved_hours || 0,
      approvedMinutes: vol.approved_minutes || 0,
      totalSubmissions: vol.total_submissions || 0,
      reviewsCount: vol.rating_count || 0,
      ratingAvg: vol.rating_avg || 5.0,
    };
    return ACHIEVEMENTS_CATALOG.filter((b) => checkBadgeUnlocked(b, statsObj));
  };

  // Podium Positions (1, 2, 3)
  const rank1 = volunteers.find((v) => v.rank === 1) || null;
  const rank2 = volunteers.find((v) => v.rank === 2) || null;
  const rank3 = volunteers.find((v) => v.rank === 3) || null;

  // Remaining volunteers for qualification table (Rank 4+)
  const tableVolunteers = volunteers.filter((v) => (v.rank || 0) > 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-fadeIn pb-24">
      {/* 1. Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-inner">
          <Trophy size={14} className="text-amber-400" />
          <span>Cuadro de Honor Comunitario • Des Moines Public Schools</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Podio de Honor & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Ranking Distrital</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
          Reconocimiento a los voluntarios con más horas de servicio comunitario acumuladas. Los primeros 3 lugares reciben medallas conmemorativas y distintivos exclusivos en sus perfiles.
        </p>

        {/* Rules Explanatory Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2.5 rounded-2xl bg-[#07111F]/80 border border-white/10 text-slate-300 text-[11px]">
          <span className="flex items-center gap-1 text-amber-300 font-semibold">
            <Crown size={13} />
            <span>#1 Oro (Acumula Plata y Bronce)</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-slate-300 font-semibold">
            <Shield size={13} className="text-slate-400" />
            <span>#2 Plata (Acumula Bronce)</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Medal size={13} />
            <span>#3 Bronce</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-sky-400 font-semibold">
            <Clock size={13} />
            <span>Permanencia: 1 mes en podio otorga medalla vitalicia</span>
          </span>
        </div>
      </div>

      {/* 2. THE OLYMPIC STEPPED PODIUM (Gold #1 in Center & Highest, Silver #2 on Left, Bronze #3 on Right) */}
      {!searchQuery && selectedSchool === 'ALL' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              <span>Podio Oficial de Líderes Comunitarios</span>
            </h2>
            <span className="text-xs text-slate-400">
              {volunteers.length > 0 ? `${Math.min(3, volunteers.length)} de 3 puestos ocupados` : 'Podio esperando registros'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
            
            {/* === PEDESTAL #2: SILVER RUNNER-UP (LEFT, MEDIUM HEIGHT) === */}
            <div className="order-2 md:order-1 flex flex-col justify-end">
              {rank2 ? (
                <div
                  onClick={() => handleSelectVolunteer(rank2)}
                  className="bg-gradient-to-b from-[#0B192E] via-[#07111F] to-[#0A1628] border-2 border-slate-400/50 rounded-3xl p-6 text-center shadow-xl space-y-4 hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-400/10 blur-2xl pointer-events-none" />

                  {/* Medal badge & icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500 flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-lg shadow-slate-400/20 ring-4 ring-slate-400/30">
                    <Shield size={30} className="text-slate-950" />
                  </div>

                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-slate-400/20 text-slate-200 border border-slate-400/40 text-[10px] font-extrabold uppercase tracking-widest inline-block mb-1">
                      🥈 #2 Segundo Puesto • Plata
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {rank2.full_name}
                    </h3>
                    <p className="text-xs text-slate-400">{rank2.school || 'Des Moines Public Schools'}</p>
                  </div>

                  <div className="p-3 bg-[#0B192E]/90 rounded-2xl border border-slate-400/20 flex items-center justify-around text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Horas</span>
                      <span className="text-sm font-extrabold text-white font-mono">{rank2.approved_hours.toFixed(1)}h</span>
                    </div>
                    <div className="h-6 w-px bg-slate-400/20" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Estrellas</span>
                      <span className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                        <Star size={12} className="fill-amber-400" /> {rank2.rating_avg.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Medals awarded */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-400/15 border border-slate-400/30 text-slate-200 text-[10px] font-bold flex items-center gap-1">
                      <Shield size={11} className="text-slate-300" />
                      <span>Plata</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-800/20 border border-amber-600/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <Medal size={11} className="text-amber-500" />
                      <span>Bronce (Acumulado)</span>
                    </span>
                  </div>

                  {/* Stepped Pedestal Base */}
                  <div className="pt-2">
                    <div className="w-full h-14 rounded-2xl bg-gradient-to-b from-slate-700/80 to-slate-900 border border-slate-400/40 flex items-center justify-center shadow-inner">
                      <span className="text-xl font-black text-slate-200 font-mono tracking-wider">#2 PODIO PLATA</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Silver Slot */
                <div className="bg-[#07111F]/60 border-2 border-dashed border-slate-600/40 rounded-3xl p-6 text-center space-y-4 relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 font-black text-xl mx-auto">
                    <Shield size={28} className="text-slate-600" />
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-[10px] font-bold uppercase tracking-wider inline-block">
                      Puesto #2 Vacante
                    </span>
                    <h3 className="text-base font-bold text-slate-400 mt-1">Podio Disponible</h3>
                    <p className="text-xs text-slate-500">Registra tus horas para ocupar la posición de Plata.</p>
                  </div>
                  <div className="w-full h-14 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600 font-mono">#2 VACANTE</span>
                  </div>
                </div>
              )}
            </div>

            {/* === PEDESTAL #1: GOLD CHAMPION (CENTER, HIGHEST ELEVATION) === */}
            <div className="order-1 md:order-2 flex flex-col justify-end">
              {rank1 ? (
                <div
                  onClick={() => handleSelectVolunteer(rank1)}
                  className="bg-gradient-to-b from-amber-950/50 via-[#07111F] to-[#0A1628] border-2 border-amber-400 rounded-3xl p-7 text-center shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-5 hover:border-amber-300 transition-all cursor-pointer group relative overflow-hidden transform md:-translate-y-6 hover:-translate-y-7"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 blur-3xl pointer-events-none" />

                  {/* Crown champion badge */}
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl mx-auto shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/40 animate-pulse">
                    <Crown size={38} className="text-slate-950" />
                  </div>

                  <div>
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/60 text-[11px] font-black uppercase tracking-widest inline-block mb-1 shadow-md">
                      👑 #1 CAMPEÓN DISTRITAL • ORO
                    </span>
                    <h3 className="text-2xl font-black text-white group-hover:text-amber-300 transition-colors">
                      {rank1.full_name}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">{rank1.school || 'Des Moines Public Schools'}</p>
                  </div>

                  <div className="p-4 bg-[#0B192E]/90 rounded-2xl border border-amber-500/40 flex items-center justify-around text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Horas</span>
                      <span className="text-lg font-black text-amber-300 font-mono">{rank1.approved_hours.toFixed(1)}h</span>
                    </div>
                    <div className="h-8 w-px bg-amber-500/30" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Calificación</span>
                      <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                        <Star size={16} className="fill-amber-400" /> {rank1.rating_avg.toFixed(1)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">({rank1.rating_count})</span>
                      </span>
                    </div>
                  </div>

                  {/* 3 Stacking Medals for Rank 1 */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-black flex items-center gap-1">
                      <Crown size={11} className="text-amber-400" />
                      <span>Corona Oro #1</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-400/20 border border-slate-400/40 text-slate-200 text-[10px] font-bold flex items-center gap-1">
                      <Shield size={11} />
                      <span>Plata</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-800/25 border border-amber-600/40 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <Medal size={11} />
                      <span>Bronce</span>
                    </span>
                  </div>

                  {/* Stepped Pedestal Base (Tallest) */}
                  <div className="pt-2">
                    <div className="w-full h-20 rounded-2xl bg-gradient-to-b from-amber-500/90 via-yellow-600 to-amber-800 border-2 border-amber-400 flex flex-col items-center justify-center shadow-2xl">
                      <span className="text-2xl font-black text-slate-950 font-mono tracking-wider">#1 LÍDER DE HONOR</span>
                      <span className="text-[10px] font-extrabold text-slate-900 uppercase">Cúspide del Distrito</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Gold Slot */
                <div className="bg-[#07111F]/60 border-2 border-dashed border-amber-500/40 rounded-3xl p-7 text-center space-y-4 relative transform md:-translate-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-2xl mx-auto">
                    <Crown size={36} className="text-amber-500" />
                  </div>
                  <div>
                    <span className="px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold uppercase tracking-wider inline-block">
                      Puesto #1 Disponible
                    </span>
                    <h3 className="text-lg font-bold text-slate-300 mt-1">Cúspide de Oro Vacante</h3>
                    <p className="text-xs text-slate-500">Sé el primer voluntario en acumular horas para reclamar la Corona de Oro.</p>
                  </div>
                  <div className="w-full h-20 rounded-2xl bg-slate-900/60 border border-amber-500/30 flex items-center justify-center">
                    <span className="text-base font-bold text-amber-400/80 font-mono">#1 PODIO DE ORO DISPONIBLE</span>
                  </div>
                </div>
              )}
            </div>

            {/* === PEDESTAL #3: BRONZE (RIGHT, LOWER HEIGHT) === */}
            <div className="order-3 flex flex-col justify-end">
              {rank3 ? (
                <div
                  onClick={() => handleSelectVolunteer(rank3)}
                  className="bg-gradient-to-b from-[#0B192E] via-[#07111F] to-[#0A1628] border-2 border-amber-700/50 rounded-3xl p-6 text-center shadow-xl space-y-4 hover:border-amber-600 transition-all cursor-pointer group relative overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-700/10 blur-2xl pointer-events-none" />

                  {/* Medal badge & icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 flex items-center justify-center text-white font-black text-xl mx-auto shadow-lg shadow-amber-800/20 ring-4 ring-amber-600/30">
                    <Medal size={30} className="text-white" />
                  </div>

                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-amber-800/20 text-amber-400 border border-amber-600/40 text-[10px] font-extrabold uppercase tracking-widest inline-block mb-1">
                      🥉 #3 Tercer Puesto • Bronce
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {rank3.full_name}
                    </h3>
                    <p className="text-xs text-slate-400">{rank3.school || 'Des Moines Public Schools'}</p>
                  </div>

                  <div className="p-3 bg-[#0B192E]/90 rounded-2xl border border-amber-700/20 flex items-center justify-around text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Horas</span>
                      <span className="text-sm font-extrabold text-white font-mono">{rank3.approved_hours.toFixed(1)}h</span>
                    </div>
                    <div className="h-6 w-px bg-amber-700/20" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Estrellas</span>
                      <span className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                        <Star size={12} className="fill-amber-400" /> {rank3.rating_avg.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Medals awarded */}
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-amber-800/20 border border-amber-600/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <Medal size={11} className="text-amber-500" />
                      <span>Medalla Bronce #3</span>
                    </span>
                  </div>

                  {/* Stepped Pedestal Base (Shortest) */}
                  <div className="pt-2">
                    <div className="w-full h-10 rounded-2xl bg-gradient-to-b from-amber-800/80 to-amber-950 border border-amber-600/40 flex items-center justify-center shadow-inner">
                      <span className="text-base font-black text-amber-300 font-mono tracking-wider">#3 PODIO BRONCE</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Bronze Slot */
                <div className="bg-[#07111F]/60 border-2 border-dashed border-amber-800/40 rounded-3xl p-6 text-center space-y-4 relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500 font-black text-xl mx-auto">
                    <Medal size={28} className="text-amber-800" />
                  </div>
                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-slate-800/80 text-slate-400 text-[10px] font-bold uppercase tracking-wider inline-block">
                      Puesto #3 Vacante
                    </span>
                    <h3 className="text-base font-bold text-slate-400 mt-1">Podio Disponible</h3>
                    <p className="text-xs text-slate-500">Suma horas comunitarias para ingresar al podio.</p>
                  </div>
                  <div className="w-full h-10 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center">
                    <span className="text-xs font-bold text-slate-600 font-mono">#3 VACANTE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#07111F] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar voluntario por nombre, ID oficial (ej: 'VOL-') o escuela..."
              className="w-full pl-11 pr-4 py-3 bg-[#0B192E] border border-slate-800 focus:border-sky-500 rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* School Filter */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B192E] border border-slate-800 focus:border-sky-500 rounded-2xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Escuelas DMPS</option>
              <option value="Lincoln High School">Lincoln High School</option>
              <option value="East High School">East High School</option>
              <option value="Roosevelt High School">Roosevelt High School</option>
              <option value="North High School">North High School</option>
              <option value="Hoover High School">Hoover High School</option>
              <option value="Central Campus">Central Campus</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#0B192E] border border-slate-800 focus:border-sky-500 rounded-2xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="hours">🏆 Mayor Cantidad de Horas</option>
              <option value="rating">⭐ Mejor Calificación (Estrellas)</option>
              <option value="reviews">💬 Más Reseñas</option>
              <option value="recent">📅 Más Recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. QUALIFICATION TABLE (SCOREBOARD) FOR ALL VOLUNTEERS OR RANK 4+ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="text-amber-400" size={20} />
              <span>Tabla de Calificaciones & Rendimiento Comunitario</span>
            </h2>
            <p className="text-xs text-slate-400">
              Posiciones ordenadas por horas de voluntariado validadas por el equipo de coordinación.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('podium_table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                viewMode === 'podium_table'
                  ? 'bg-sky-600 text-white'
                  : 'bg-[#07111F] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Vista Tabla
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                viewMode === 'cards'
                  ? 'bg-sky-600 text-white'
                  : 'bg-[#07111F] text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              Vista Tarjetas
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-[#07111F] rounded-3xl border border-white/5">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando tabla de honor...</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="p-12 text-center bg-[#07111F] rounded-3xl border border-white/10 space-y-2">
            <Trophy size={36} className="mx-auto text-slate-600 mb-2" />
            <h3 className="text-base font-bold text-white">No se encontraron voluntarios</h3>
            <p className="text-xs text-slate-400">Prueba ajustando los filtros de búsqueda o la escuela seleccionada.</p>
          </div>
        ) : viewMode === 'podium_table' ? (
          /* TABULAR SCOREBOARD */
          <div className="bg-[#07111F] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0A1628] border-b border-white/10 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-4 text-center w-16">Posición</th>
                    <th className="px-5 py-4">Voluntario / Escuela</th>
                    <th className="px-5 py-4 text-center">Horas Validadas</th>
                    <th className="px-5 py-4 text-center">Calificación</th>
                    <th className="px-5 py-4 text-center">Medallas de Honor</th>
                    <th className="px-5 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {volunteers.map((vol) => {
                    const isPodium = (vol.rank || 0) <= 3;
                    const badges = getVolunteerBadges(vol);

                    return (
                      <tr
                        key={vol.id}
                        onClick={() => handleSelectVolunteer(vol)}
                        className={`hover:bg-sky-950/30 transition-colors cursor-pointer ${
                          vol.rank === 1
                            ? 'bg-amber-950/20'
                            : vol.rank === 2
                            ? 'bg-slate-800/20'
                            : vol.rank === 3
                            ? 'bg-amber-900/10'
                            : ''
                        }`}
                      >
                        {/* Position # */}
                        <td className="px-5 py-4 text-center">
                          {vol.rank === 1 ? (
                            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-sm inline-flex items-center justify-center shadow-md">
                              1
                            </span>
                          ) : vol.rank === 2 ? (
                            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950 font-black text-sm inline-flex items-center justify-center shadow-md">
                              2
                            </span>
                          ) : vol.rank === 3 ? (
                            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white font-black text-sm inline-flex items-center justify-center shadow-md">
                              3
                            </span>
                          ) : (
                            <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-bold font-mono text-xs inline-flex items-center justify-center">
                              #{vol.rank}
                            </span>
                          )}
                        </td>

                        {/* Name & School */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {vol.first_name[0]}
                              {vol.last_name[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm hover:text-sky-300 transition-colors truncate">
                                  {vol.full_name}
                                </span>
                                {vol.approved_hours >= 160 && (
                                  <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                                    Silver Cord
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {vol.school || 'Des Moines Public Schools'} • <span className="font-mono text-slate-500">{vol.volunteer_id}</span>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Hours */}
                        <td className="px-5 py-4 text-center">
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">
                            {vol.approved_hours.toFixed(1)} h
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {vol.total_submissions || 0} actividades
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-5 py-4 text-center">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-xs">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{vol.rating_avg.toFixed(1)}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({vol.rating_count})</span>
                          </div>
                        </td>

                        {/* Badges */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {vol.podium_medals && vol.podium_medals.length > 0 ? (
                              vol.podium_medals.map((m, idx) => (
                                <span
                                  key={idx}
                                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${
                                    m.tier === 'GOLD'
                                      ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                                      : m.tier === 'SILVER'
                                      ? 'bg-slate-400/20 border-slate-400/40 text-slate-200'
                                      : 'bg-amber-800/20 border-amber-600/40 text-amber-400'
                                  }`}
                                >
                                  {m.tier === 'GOLD' ? <Crown size={11} /> : m.tier === 'SILVER' ? <Shield size={11} /> : <Medal size={11} />}
                                  <span>{m.name}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-500 font-medium">
                                {badges.length} logros obtenidos
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-4 text-right">
                          <button className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1">
                            <span>Ver Perfil & Calificar</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* GRID OF CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers.map((vol) => {
              const badges = getVolunteerBadges(vol);

              return (
                <div
                  key={vol.id}
                  onClick={() => handleSelectVolunteer(vol)}
                  className="bg-[#07111F] border border-white/10 hover:border-sky-500/50 rounded-3xl p-5 shadow-lg hover:shadow-sky-500/5 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-base shadow-md shrink-0">
                          {vol.first_name[0]}
                          {vol.last_name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-amber-400 font-mono">
                              #{vol.rank}
                            </span>
                            <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                              {vol.full_name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {vol.school || 'Des Moines Public Schools'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          <span>{vol.rating_avg.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({vol.rating_count})</span>
                        </span>
                      </div>
                    </div>

                    {/* Stats & Hours */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-[#0B192E] rounded-2xl border border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Horas Validadas</span>
                        <span className="text-sm font-extrabold text-emerald-400 font-mono">
                          {vol.approved_hours.toFixed(1)}h
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Logros Obtenidos</span>
                        <span className="text-sm font-extrabold text-amber-400 font-mono">
                          {badges.length} medallas
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-sky-400 transition-colors">
                    <span className="text-[11px] font-mono text-slate-500">{vol.volunteer_id}</span>
                    <span className="font-bold flex items-center gap-1">
                      <span>Ver Perfil & Calificar</span>
                      <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Volunteer Public Modal with Profile, Badges, Reviews & Reporting */}
      {selectedVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/40 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-[#0A1628] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
                  {selectedVolunteer.first_name[0]}
                  {selectedVolunteer.last_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                      POSICIÓN #{selectedVolunteer.rank}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {selectedVolunteer.full_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap size={13} className="text-sky-400" />
                    <span>{selectedVolunteer.school || 'Des Moines Public Schools'}</span>
                    <span>•</span>
                    <span className="font-mono text-sky-300">{selectedVolunteer.volunteer_id}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
              {/* Notification banners */}
              {reviewSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}

              {reviewErrorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <X size={16} className="text-rose-400 shrink-0" />
                  <span>{reviewErrorMsg}</span>
                </div>
              )}

              {/* Podium Medals Strip (Gold, Silver, Bronze badges) */}
              {selectedVolunteer.podium_medals && selectedVolunteer.podium_medals.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#0B192E] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-400" />
                      <span>Insignias de Podio Distrital</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {selectedVolunteer.podium_medals.some((m) => m.is_permanent)
                        ? '★ Medalla Vitalicia Desbloqueada'
                        : 'Activo en Top 3'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {selectedVolunteer.podium_medals.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center gap-3 ${
                          m.tier === 'GOLD'
                            ? 'bg-amber-950/40 border-amber-400/50'
                            : m.tier === 'SILVER'
                            ? 'bg-slate-800/40 border-slate-400/40'
                            : 'bg-amber-900/30 border-amber-600/40'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            m.tier === 'GOLD'
                              ? 'bg-amber-400 text-slate-950'
                              : m.tier === 'SILVER'
                              ? 'bg-slate-300 text-slate-950'
                              : 'bg-amber-700 text-white'
                          }`}
                        >
                          {m.tier === 'GOLD' ? <Crown size={18} /> : m.tier === 'SILVER' ? <Shield size={18} /> : <Medal size={18} />}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-white truncate">{m.name}</h5>
                          <p className="text-[10px] text-slate-300 truncate">{m.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Horas Aprobadas</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                    {selectedVolunteer.approved_hours.toFixed(1)}h
                  </span>
                </div>

                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Valoración Media</span>
                  <span className="text-base sm:text-lg font-black text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                    <Star size={15} className="fill-amber-400" />
                    <span>{selectedVolunteer.rating_avg.toFixed(1)}</span>
                  </span>
                </div>

                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reseñas Registradas</span>
                  <span className="text-base sm:text-lg font-black text-sky-400 font-mono mt-0.5 block">
                    {selectedVolunteer.rating_count}
                  </span>
                </div>

                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Actividades</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                    {selectedVolunteer.total_submissions || 0}
                  </span>
                </div>
              </div>

              {/* Community Reviews & Rate Form Section */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare size={16} className="text-sky-400" />
                      <span>Reseñas de la Comunidad ({reviewsList.length})</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Deja tu calificación con estrellas y un mensaje opcional.
                    </p>
                  </div>

                  {!showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <Star size={14} className="fill-slate-950" />
                      <span>Dejar Calificación</span>
                    </button>
                  )}
                </div>

                {/* Simplified Review Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#0B192E] to-[#0A1628] border border-amber-500/40 space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>Calificar a {selectedVolunteer.first_name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>

                    {/* Interactive 5-Star Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Puntuación (Selecciona 1 a 5 estrellas):
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setStarRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              size={28}
                              className={`${
                                star <= (hoverRating || starRating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              } transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-amber-400 ml-2">
                          {hoverRating || starRating} de 5 Estrellas
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Tu Nombre o Apodo (Opcional):
                      </label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="Ej: Anónimo / Familia Escolar / Juan P."
                        className="w-full px-3.5 py-2 bg-[#07111F] border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Comentario o Mensaje (Opcional):
                      </label>
                      <textarea
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        placeholder="Escribe unas palabras sobre su labor solidaria (opcional)..."
                        rows={2}
                        className="w-full px-3.5 py-2 bg-[#07111F] border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>{submittingReview ? 'Publicando...' : 'Publicar Reseña'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List with the 3 Reporting Buttons */}
                <div className="space-y-3">
                  {loadingReviews ? (
                    <div className="p-6 text-center text-slate-400 text-xs">Cargando reseñas...</div>
                  ) : reviewsList.length === 0 ? (
                    <div className="p-6 text-center bg-[#0B192E]/40 border border-white/5 rounded-2xl space-y-1">
                      <p className="text-xs text-slate-300 font-semibold">No hay reseñas registradas aún</p>
                      <p className="text-[11px] text-slate-400">
                        ¡Sé el primero en dejar una calificación por su labor comunitaria!
                      </p>
                    </div>
                  ) : (
                    reviewsList.map((rev) => {
                      const isReportedLocally = reportedReviewsSet.has(rev.id) || rev.is_reported;

                      return (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-[#0B192E] border border-white/5 space-y-2 text-xs relative group"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                                {rev.reviewer_name?.[0] || 'V'}
                              </div>
                              <div>
                                <span className="font-bold text-white block leading-tight">{rev.reviewer_name}</span>
                                <span className="text-[10px] text-slate-400">{rev.reviewer_relation || 'Comunidad Escolar'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span>{rev.rating} / 5</span>
                              </div>

                              {/* 3 Quick Report Buttons in the corner */}
                              {isReportedLocally ? (
                                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                                  <ShieldAlert size={11} />
                                  <span>Denunciada al Staff</span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleQuickReport(rev.id, 'Contenido Inapropiado u Ofensivo')}
                                    disabled={submittingReport}
                                    title="Denunciar por Contenido Inapropiado"
                                    className="px-2 py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 border border-rose-800/60 text-rose-300 hover:text-white text-[10px] font-semibold transition-all flex items-center gap-1"
                                  >
                                    <Ban size={10} />
                                    <span className="hidden sm:inline">Inapropiado</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickReport(rev.id, 'Spam o Reseña Falsa')}
                                    disabled={submittingReport}
                                    title="Denunciar por Spam o Falso"
                                    className="px-2 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900 border border-amber-800/60 text-amber-300 hover:text-white text-[10px] font-semibold transition-all flex items-center gap-1"
                                  >
                                    <AlertTriangle size={10} />
                                    <span className="hidden sm:inline">Spam</span>
                                  </button>
                                  <button
                                    onClick={() => handleQuickReport(rev.id, 'Información Fuera de Lugar')}
                                    disabled={submittingReport}
                                    title="Denunciar por Fuera de Lugar"
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition-all flex items-center gap-1"
                                  >
                                    <Flag size={10} />
                                    <span className="hidden sm:inline">Fuera de Lugar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {rev.message && (
                            <p className="text-slate-300 leading-relaxed bg-[#07111F]/50 p-2.5 rounded-xl border border-white/5">
                              "{rev.message}"
                            </p>
                          )}

                          <div className="text-[10px] text-slate-500 text-right">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString('es-ES') : 'Reciente'}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
