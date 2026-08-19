import React, { useState, useEffect, useMemo } from 'react';
import { api, formatMinutes } from '../../services/api';
import { PublicVolunteerDetail, PublicReview } from '../../types';
import {
  ACHIEVEMENTS_CATALOG,
  checkBadgeUnlocked,
} from '../../data/achievementsCatalog';
import { RANK_TIERS } from '../../components/VolunteerRankShields';
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

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [starRating, setStarRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRelation, setReviewerRelation] = useState('Miembro de la Comunidad');
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string | null>(null);

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

  // Submit a public review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;

    if (!reviewerName.trim()) {
      setReviewErrorMsg('Por favor ingresa tu nombre.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewErrorMsg(null);

      const res = await api.submitVolunteerReview(selectedVolunteer.id, {
        rating: starRating,
        reviewer_name: reviewerName.trim(),
        reviewer_relation: reviewerRelation,
        message: reviewMessage.trim() || undefined,
      });

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      setReviewSuccessMsg('¡Gracias por reconocer y valorar la labor de este voluntario!');
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

  // Top 3 Podium volunteers
  const topPodium = volunteers.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-fadeIn pb-24">
      {/* 1. Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-inner">
          <Trophy size={14} className="text-amber-400" />
          <span>Comunidad Abierta • Sin necesidad de iniciar sesión</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Cuadro de Honor & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">Ranking Comunitario</span>
        </h1>

        <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
          Descubre a los voluntarios más destacados de las escuelas públicas de Des Moines, consulta sus medallas oficiales y déjales una valoración comunitaria con estrellas.
        </p>
      </div>

      {/* 2. Top 3 Podium (Visual Hall of Fame) */}
      {topPodium.length > 0 && !searchQuery && selectedSchool === 'ALL' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          {/* Position 2 (Silver) */}
          {topPodium[1] && (
            <div
              onClick={() => handleSelectVolunteer(topPodium[1])}
              className="bg-[#07111F] border border-slate-400/40 rounded-3xl p-6 text-center shadow-xl space-y-4 hover:border-slate-300 transition-all cursor-pointer group order-2 md:order-1 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-slate-950 font-black text-lg mx-auto shadow-lg shadow-slate-500/20">
                #2
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Plata Distrital
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  {topPodium[1].full_name}
                </h3>
                <p className="text-xs text-slate-400">{topPodium[1].school || 'Des Moines Public Schools'}</p>
              </div>
              <div className="p-3 bg-[#0B192E] rounded-2xl border border-white/5 flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Horas</span>
                  <span className="text-sm font-extrabold text-white">{topPodium[1].approved_hours.toFixed(1)}h</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Valoración</span>
                  <span className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400" /> {topPodium[1].rating_avg.toFixed(1)}
                  </span>
                </div>
              </div>
              <button className="w-full py-2 bg-slate-800 group-hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                <span>Ver Perfil & Calificar</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Position 1 (Gold / Champion) */}
          {topPodium[0] && (
            <div
              onClick={() => handleSelectVolunteer(topPodium[0])}
              className="bg-gradient-to-b from-amber-950/40 via-[#07111F] to-[#0A1628] border-2 border-amber-400/80 rounded-3xl p-7 text-center shadow-2xl space-y-5 hover:border-amber-300 transition-all cursor-pointer group order-1 md:order-2 relative overflow-hidden transform md:-translate-y-4"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 blur-2xl pointer-events-none" />

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-xl shadow-amber-500/30 ring-4 ring-amber-400/30">
                <Crown size={32} className="text-slate-950" />
              </div>

              <div>
                <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold uppercase tracking-widest inline-block mb-1">
                  ★ #1 Líder del Distrito ★
                </span>
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                  {topPodium[0].full_name}
                </h3>
                <p className="text-xs text-slate-300 font-medium">{topPodium[0].school || 'Des Moines Public Schools'}</p>
              </div>

              <div className="p-3.5 bg-[#0B192E]/80 rounded-2xl border border-amber-500/30 flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Horas</span>
                  <span className="text-base font-black text-amber-300">{topPodium[0].approved_hours.toFixed(1)}h</span>
                </div>
                <div className="h-7 w-px bg-amber-500/20" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Estrellas</span>
                  <span className="text-base font-black text-amber-400 flex items-center gap-1">
                    <Star size={14} className="fill-amber-400" /> {topPodium[0].rating_avg.toFixed(1)}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">({topPodium[0].rating_count})</span>
                  </span>
                </div>
              </div>

              <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5">
                <span>Ver Medallas & Dejar Reseña</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Position 3 (Bronze) */}
          {topPodium[2] && (
            <div
              onClick={() => handleSelectVolunteer(topPodium[2])}
              className="bg-[#07111F] border border-amber-700/40 rounded-3xl p-6 text-center shadow-xl space-y-4 hover:border-amber-600 transition-all cursor-pointer group order-3 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-black text-lg mx-auto shadow-lg shadow-amber-700/20">
                #3
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  Bronce Distrital
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  {topPodium[2].full_name}
                </h3>
                <p className="text-xs text-slate-400">{topPodium[2].school || 'Des Moines Public Schools'}</p>
              </div>
              <div className="p-3 bg-[#0B192E] rounded-2xl border border-white/5 flex items-center justify-around text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Horas</span>
                  <span className="text-sm font-extrabold text-white">{topPodium[2].approved_hours.toFixed(1)}h</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">Valoración</span>
                  <span className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400" /> {topPodium[2].rating_avg.toFixed(1)}
                  </span>
                </div>
              </div>
              <button className="w-full py-2 bg-slate-800 group-hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                <span>Ver Perfil & Calificar</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
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

          {/* Sort Order Selector */}
          <div className="w-full md:w-56 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-3 bg-[#0B192E] border border-slate-800 focus:border-sky-500 rounded-2xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="hours">🏆 Mayor Cantidad de Horas</option>
              <option value="rating">⭐ Mejor Calificación (Estrellas)</option>
              <option value="reviews">💬 Más Reseñas Comunitarias</option>
              <option value="recent">📅 Más Recientes</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Full Volunteers Directory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <span>Directorio de Voluntarios ({volunteers.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Haz clic en cualquier voluntario para consultar sus medallas o dejarle una reseña.
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-[#07111F] rounded-3xl border border-white/5">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando cuadro de honor...</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="p-12 text-center bg-[#07111F] rounded-3xl border border-white/10 space-y-2">
            <Trophy size={36} className="mx-auto text-slate-600 mb-2" />
            <h3 className="text-base font-bold text-white">No se encontraron voluntarios</h3>
            <p className="text-xs text-slate-400">Prueba ajustando los filtros de búsqueda o la escuela seleccionada.</p>
          </div>
        ) : (
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
                        <span className="text-[10px] text-slate-400 block font-semibold">Medallas Ganadas</span>
                        <span className="text-sm font-extrabold text-amber-400 font-mono">
                          {badges.length} logros
                        </span>
                      </div>
                    </div>

                    {/* Badge Chips Preview */}
                    {badges.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {badges.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            className="px-2 py-0.5 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 text-[9px] font-semibold flex items-center gap-1"
                          >
                            <Medal size={10} className="text-sky-400" />
                            <span className="truncate max-w-[120px]">{b.name}</span>
                          </span>
                        ))}
                        {badges.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold">
                            +{badges.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
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

      {/* 5. Volunteer Public Modal with Profile, Badges, Reviews & Rate Form */}
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
                      RANK #{selectedVolunteer.rank}
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

              {/* 160+ Hours Silver Cord Honor Banner */}
              {selectedVolunteer.approved_hours >= 160 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#171105] via-[#2A1E07] to-[#171105] border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shrink-0 shadow-md">
                    <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                      <Crown size={20} className="text-amber-400 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                        Graduado de Honor Silver Cord
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">160+ Horas Cumplidas</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Este voluntario ha completado el programa oficial con distinción para la Ceremonia de Graduación y continúa su labor cívica en Des Moines.
                    </p>
                  </div>
                </div>
              )}

              {/* Stats & Overall Star Rating */}
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
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Reseñas de Comunidad</span>
                  <span className="text-base sm:text-lg font-black text-sky-400 font-mono mt-0.5 block">
                    {selectedVolunteer.rating_count}
                  </span>
                </div>

                <div className="p-3.5 bg-[#0B192E] rounded-2xl border border-white/5 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Actividades</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                    {selectedVolunteer.total_submissions}
                  </span>
                </div>
              </div>

              {/* Bio if exists */}
              {selectedVolunteer.bio && (
                <div className="p-4 rounded-2xl bg-[#0B192E]/60 border border-white/5 space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Sobre este Voluntario:</span>
                  <p className="text-slate-300 leading-relaxed italic">"{selectedVolunteer.bio}"</p>
                </div>
              )}

              {/* Unlocked Achievements & Medals section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400" />
                    <span>Medallas & Logros Desbloqueados ({getVolunteerBadges(selectedVolunteer).length})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {getVolunteerBadges(selectedVolunteer).map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-2xl bg-[#0B192E] border border-sky-500/20 flex items-center gap-3"
                    >
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${b.colorGrade} flex items-center justify-center shrink-0 shadow-md`}
                      >
                        <Award size={16} className="text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white truncate">{b.name}</h5>
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCircle2 size={10} />
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Reviews & Rate Form Section */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <MessageSquare size={16} className="text-sky-400" />
                      <span>Reseñas & Reconocimientos Comunitarios</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Cualquier persona puede valorar con 1-5 estrellas el trabajo de este voluntario.
                    </p>
                  </div>

                  {!showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <Star size={14} className="fill-slate-950" />
                      <span>Calificar a {selectedVolunteer.first_name}</span>
                    </button>
                  )}
                </div>

                {/* Rating Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#0B192E] to-[#0A1628] border border-amber-500/40 space-y-4 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>Dejar Calificación Pública</span>
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
                        Puntuación (1 a 5 estrellas):
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Tu Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Ej: Sra. González / Juan Pérez"
                          className="w-full px-3.5 py-2 bg-[#07111F] border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Tu Rol o Relación
                        </label>
                        <select
                          value={reviewerRelation}
                          onChange={(e) => setReviewerRelation(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[#07111F] border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white outline-none"
                        >
                          <option value="Miembro de la Comunidad">Miembro de la Comunidad</option>
                          <option value="Profesor / Escuela DMPS">Profesor / Escuela DMPS</option>
                          <option value="Coordinador de Evento">Coordinador de Evento</option>
                          <option value="Familiar de Estudiante">Familiar de Estudiante</option>
                          <option value="Compañero Voluntario">Compañero Voluntario</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mensaje o Reconocimiento (Opcional):
                      </label>
                      <textarea
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        placeholder="Escribe unas palabras destacando su amabilidad, compromiso o ayuda en el evento..."
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
                        <span>{submittingReview ? 'Enviando...' : 'Publicar Calificación'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {loadingReviews ? (
                    <div className="p-6 text-center text-slate-400 text-xs">Cargando reseñas...</div>
                  ) : reviewsList.length === 0 ? (
                    <div className="p-6 text-center bg-[#0B192E]/40 border border-white/5 rounded-2xl space-y-1">
                      <p className="text-xs text-slate-300 font-semibold">Aún no hay reseñas registradas</p>
                      <p className="text-[11px] text-slate-400">
                        ¡Sé el primero en dejarle una calificación de 5 estrellas por su labor comunitaria!
                      </p>
                    </div>
                  ) : (
                    reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-[#0B192E] border border-white/5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                              {rev.reviewer_name[0]}
                            </div>
                            <div>
                              <span className="font-bold text-white block leading-tight">{rev.reviewer_name}</span>
                              <span className="text-[10px] text-slate-400">{rev.reviewer_relation}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-amber-300 text-[11px] font-bold">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span>{rev.rating} / 5</span>
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
                    ))
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
