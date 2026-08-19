import React, { useState, useMemo } from 'react';
import { Logo } from './Logo';
import { formatMinutes } from '../services/api';
import {
  ACHIEVEMENTS_CATALOG,
  AchievementBadge as CatalogBadge,
  checkBadgeUnlocked,
} from '../data/achievementsCatalog';
import { AchievementCelebrationModal } from './AchievementCelebrationModal';
import {
  Shield,
  Award,
  Star,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  QrCode,
  Share2,
  Calendar,
  User,
  GraduationCap,
  Building,
  HeartHandshake,
  BookOpen,
  Users,
  Flame,
  Search,
  Filter,
  Trophy,
  Medal,
  Check,
  Zap,
} from 'lucide-react';

export interface RankTier {
  id: string;
  name: string;
  minHours: number;
  maxHours: number | null;
  shieldColor: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  glowColor: string;
  iconName: string;
  title: string;
  description: string;
  whyAwarded: string;
  rewards: string[];
  certificateMilestone: number | null;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'bronze',
    name: 'Bronce',
    title: 'Iniciado de la Comunidad',
    minHours: 0,
    maxHours: 10,
    shieldColor: 'from-amber-700 to-amber-900',
    badgeBg: 'bg-amber-950/40',
    borderColor: 'border-amber-600/40',
    textColor: 'text-amber-300',
    glowColor: 'shadow-amber-900/40',
    iconName: 'Shield',
    description: 'Etapa inicial del voluntario en la red comunitaria de escuelas y programas DMPS Connect.',
    whyAwarded:
      'Se otorga al registrarse e iniciar activamente el camino del voluntariado escolar, reconociendo el primer compromiso solidario de brindar tiempo a la comunidad educativa.',
    rewards: [
      'Acceso al portal oficial de registro de horas DMPS Connect',
      'Inscripción prioritaria en convocatorias de eventos escolares',
      'Bitácora digital activa con trazabilidad oficial de actividades',
    ],
    certificateMilestone: null,
  },
  {
    id: 'silver',
    name: 'Plata',
    title: 'Servidor Comprometido',
    minHours: 10,
    maxHours: 25,
    shieldColor: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-800/60',
    borderColor: 'border-slate-400/50',
    textColor: 'text-slate-200',
    glowColor: 'shadow-slate-500/30',
    iconName: 'Shield',
    description: 'Nivel alcanzado al completar 10 horas de servicio voluntario verificado.',
    whyAwarded:
      'Reconoce la perseverancia, responsabilidad y dedicación demostrada al superar las primeras 10 horas de servicio comunitario de alto impacto.',
    rewards: [
      'Certificado Oficial de 10 Horas con código QR verificable',
      'Validación curricular para requisitos escolares y de servicio social',
      'Insignia de Servidor Destacado en el perfil público',
    ],
    certificateMilestone: 10,
  },
  {
    id: 'gold',
    name: 'Oro',
    title: 'Voluntario de Impacto',
    minHours: 25,
    maxHours: 50,
    shieldColor: 'from-yellow-400 to-amber-600',
    badgeBg: 'bg-yellow-950/40',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-300',
    glowColor: 'shadow-yellow-500/40',
    iconName: 'Award',
    description: 'Nivel de excelencia al completar más de 25 horas de servicio comunitario.',
    whyAwarded:
      'Se otorga en reconocimiento a un compromiso sobresaliente con las familias y la comunidad educativa, convirtiéndose en un pilar esencial en actividades y eventos.',
    rewards: [
      'Diploma de Honor de 25 Horas firmado por la coordinación de voluntarios',
      'Carta oficial de recomendación y mérito cívico institucional',
      'Distintivo dorado de honor en la credencial digital de voluntario',
    ],
    certificateMilestone: 25,
  },
  {
    id: 'platinum',
    name: 'Platino',
    title: 'Líder Comunitario',
    minHours: 50,
    maxHours: 160,
    shieldColor: 'from-cyan-400 to-blue-600',
    badgeBg: 'bg-cyan-950/40',
    borderColor: 'border-cyan-400/50',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-cyan-500/40',
    iconName: 'Star',
    description: 'Nivel de liderazgo alcanzado tras 50 horas de voluntariado continuo.',
    whyAwarded:
      'Se entrega a voluntarios excepcionales que no solo sirven, sino que guían a nuevos integrantes, coordinan áreas logísticas y son ejemplo de empatía y liderazgo social.',
    rewards: [
      'Certificado de Liderazgo y Excelencia Comunitaria de 50 Horas',
      'Habilitación para coordinar grupos en eventos masivos de la comunidad',
      'Distinción especial Silver Cord en ceremonias de graduación',
    ],
    certificateMilestone: 50,
  },
  {
    id: 'diamond',
    name: 'Diamante',
    title: 'Excelencia Distrital Silver Cord (160 Horas)',
    minHours: 160,
    maxHours: null,
    shieldColor: 'from-purple-400 via-indigo-500 to-pink-500',
    badgeBg: 'bg-purple-950/40',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-200',
    glowColor: 'shadow-purple-500/50',
    iconName: 'Sparkles',
    description: 'El honor más alto del programa de voluntariado de Des Moines Public Schools (160 horas).',
    whyAwarded:
      'Máximo reconocimiento civil otorgado a estudiantes que han brindado 160 horas de su vida al servicio desinteresado de las escuelas públicas.',
    rewards: [
      'Cordón de Plata Oficial (Silver Cord) para portar en la Ceremonia de Graduación',
      'Mención de Honor Distrital Permanente y Medallón de Excelencia Cívica (160 Horas)',
      'Aparición en el anuncio de honor de la página de inicio de DMPS Connect',
    ],
    certificateMilestone: 160,
  },
];

interface VolunteerRankShieldsProps {
  approvedMinutes: number;
  totalSubmissions: number;
  volunteerProfile?: {
    first_name?: string;
    last_name?: string;
    volunteer_id?: string;
    school?: string;
    grade?: string;
    join_date?: string;
    phone?: string;
    email?: string;
    reviews_count?: number;
    rating_avg?: number;
  };
  onOpenCertificate?: (milestone: number) => void;
}

export const VolunteerRankShields: React.FC<VolunteerRankShieldsProps> = ({
  approvedMinutes,
  totalSubmissions,
  volunteerProfile,
  onOpenCertificate,
}) => {
  const approvedHours = approvedMinutes / 60;
  const [selectedRank, setSelectedRank] = useState<RankTier | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<CatalogBadge | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<CatalogBadge | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState(false);

  // Determine current tier
  const currentTier = useMemo(() => {
    return (
      RANK_TIERS.slice()
        .reverse()
        .find((tier) => approvedHours >= tier.minHours) || RANK_TIERS[0]
    );
  }, [approvedHours]);

  // Next tier calculation
  const nextTier = useMemo(() => {
    const currentIndex = RANK_TIERS.findIndex((t) => t.id === currentTier.id);
    if (currentIndex < RANK_TIERS.length - 1) {
      return RANK_TIERS[currentIndex + 1];
    }
    return null;
  }, [currentTier]);

  const hoursToNextTier = nextTier ? Math.max(0, nextTier.minHours - approvedHours) : 0;
  const tierProgress = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((approvedHours - currentTier.minHours) / (nextTier.minHours - currentTier.minHours)) *
              100
          )
        )
      )
    : 100;

  // Evaluation of 100+ badges catalog
  const evaluatedBadges = useMemo(() => {
    const statsObj = {
      approvedHours,
      approvedMinutes,
      totalSubmissions,
      reviewsCount: volunteerProfile?.reviews_count || 0,
      ratingAvg: volunteerProfile?.rating_avg || 5.0,
    };

    return ACHIEVEMENTS_CATALOG.map((badge) => ({
      ...badge,
      unlocked: checkBadgeUnlocked(badge, statsObj),
    }));
  }, [approvedHours, approvedMinutes, totalSubmissions, volunteerProfile]);

  const unlockedCount = evaluatedBadges.filter((b) => b.unlocked).length;
  const totalBadgesCount = evaluatedBadges.length;

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return evaluatedBadges.filter((b) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = activeCategory === 'all' || b.category === activeCategory;
      const matchesUnlocked = !filterUnlockedOnly || b.unlocked;

      return matchesSearch && matchesCat && matchesUnlocked;
    });
  }, [evaluatedBadges, searchQuery, activeCategory, filterUnlockedOnly]);

  const categories = [
    { id: 'all', label: 'Todos los Logros', count: totalBadgesCount },
    { id: 'hours', label: 'Horas y Rango', count: evaluatedBadges.filter((b) => b.category === 'hours').length },
    { id: 'specialty', label: 'Destrezas y Áreas', count: evaluatedBadges.filter((b) => b.category === 'specialty').length },
    { id: 'consistency', label: 'Rachas y Frecuencia', count: evaluatedBadges.filter((b) => b.category === 'consistency').length },
    { id: 'reviews', label: 'Reseñas y Estrellas', count: evaluatedBadges.filter((b) => b.category === 'reviews').length },
    { id: 'schools', label: 'Escuelas y Liderazgo', count: evaluatedBadges.filter((b) => b.category === 'schools').length },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Main Current Rank Shield Card */}
      <div className="bg-[#07111F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div
          className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${currentTier.shieldColor} opacity-10 blur-[90px] pointer-events-none`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-5">
            {/* Rank Shield Emblem */}
            <div
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${currentTier.shieldColor} flex items-center justify-center shadow-2xl ${currentTier.glowColor} shrink-0 p-1.5 transform hover:scale-105 transition-transform`}
            >
              <div className="w-full h-full rounded-2xl bg-[#07111F]/40 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Shield size={36} className="text-white drop-shadow-md" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold ${currentTier.badgeBg} ${currentTier.borderColor} border ${currentTier.textColor} shadow-sm`}
                >
                  Nivel Actual: {currentTier.name}
                </span>
                <span className="text-xs text-slate-400">
                  {approvedHours.toFixed(1)} Horas Acreditadas
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {currentTier.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-2">
                {currentTier.description}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-[#0B192E] border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Medallas Totales
              </span>
              <span className="text-lg font-black text-amber-400 mt-0.5 block">
                {unlockedCount}{' '}
                <span className="text-xs font-normal text-slate-500">/ {totalBadgesCount}</span>
              </span>
            </div>

            <button
              onClick={() => setSelectedRank(currentTier)}
              className="px-4 py-3 rounded-2xl bg-[#1677FF] hover:bg-[#258BFF] text-white text-xs font-bold shadow-lg shadow-[#1677FF]/25 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Info size={15} />
              <span>Ver Beneficios</span>
            </button>
          </div>
        </div>

        {/* Progress to Next Rank Tier */}
        {nextTier && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-400" />
                <span>Progreso hacia rango <strong>{nextTier.name}</strong> ({nextTier.minHours}h)</span>
              </span>
              <span className="text-white font-bold font-mono">
                {tierProgress}% ({hoursToNextTier.toFixed(1)}h faltantes)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${currentTier.shieldColor} transition-all duration-700`}
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Ranks & Shields Ladder */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Shield className="text-sky-400" size={20} />
            <span>Escala de Rangos & Escudos Distritales</span>
          </h3>
          <p className="text-xs text-slate-400">
            Avanza de nivel acumulando horas de voluntariado verificadas en el distrito escolar.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {RANK_TIERS.map((tier) => {
            const isReached = approvedHours >= tier.minHours;
            const isCurrent = currentTier.id === tier.id;

            return (
              <button
                key={tier.id}
                onClick={() => setSelectedRank(tier)}
                className={`text-left rounded-3xl p-4 transition-all duration-200 border relative overflow-hidden group cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#0B192E] border-sky-400/80 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/40'
                    : isReached
                    ? 'bg-[#0B192E]/70 border-slate-700/80 hover:border-slate-500'
                    : 'bg-[#07111F]/50 border-slate-800/60 opacity-60 hover:opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    {isReached ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={11} /> {isCurrent ? 'Actual' : 'Alcanzado'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                        <Lock size={11} /> Bloqueado
                      </span>
                    )}
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {tier.minHours}h+
                    </span>
                  </div>

                  <div className="my-3 flex flex-col items-center justify-center text-center">
                    <div
                      className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${tier.shieldColor} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 p-1 relative`}
                    >
                      <div className="w-full h-full rounded-xl bg-[#07111F]/30 backdrop-blur-xs flex items-center justify-center border border-white/20">
                        <Shield size={24} className="text-white drop-shadow-md" />
                      </div>
                    </div>
                    <h4 className={`text-sm font-extrabold mt-2.5 ${tier.textColor}`}>
                      {tier.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                      {tier.title}
                    </p>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between group-hover:text-sky-400 transition-colors">
                  <span>Ver detalles</span>
                  <ChevronRight size={13} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Catalog of 100+ Badges & Recognitions (Expanded Content) */}
      <div className="bg-[#07111F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="text-amber-400" size={22} />
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Colección de Medallas & Logros ({unlockedCount}/{totalBadgesCount})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Más de 100 reconocimientos oficiales desbloqueables por horas, constancia, valoraciones y actividades especiales.
            </p>
          </div>

          {/* Quick unlock filter switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                filterUnlockedOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 size={14} className={filterUnlockedOnly ? 'text-emerald-400' : 'text-slate-400'} />
              <span>Solo Desbloqueadas ({unlockedCount})</span>
            </button>
          </div>
        </div>

        {/* Search & Category Chips */}
        <div className="space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar entre los más de 100 logros (ej: '10 Horas', 'Bilingüe', '5 Estrellas', 'Lincoln')..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-slate-800 focus:border-sky-500 rounded-2xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-[#0B192E] text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid (100+ achievements responsive card grid) */}
        {filteredBadges.length === 0 ? (
          <div className="p-10 text-center text-slate-400 border border-slate-800/60 rounded-2xl bg-[#0B192E]/40 space-y-2">
            <Trophy size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron medallas con ese filtro</p>
            <p className="text-xs text-slate-500">Prueba cambiando la categoría o limpiando la búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredBadges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`text-left rounded-2xl p-3.5 transition-all duration-200 border flex items-start gap-3 relative overflow-hidden group cursor-pointer ${
                  badge.unlocked
                    ? 'bg-[#0B192E] border-sky-500/30 hover:border-sky-400/60 shadow-md hover:scale-[1.01]'
                    : 'bg-[#07111F]/70 border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${badge.colorGrade} flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105`}
                >
                  <Award size={18} className="text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                      {badge.categoryLabel}
                    </span>
                    {badge.unlocked ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 shrink-0">
                        <CheckCircle2 size={11} />
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5 shrink-0">
                        <Lock size={10} />
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white truncate mt-0.5">
                    {badge.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                    {badge.description}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-sky-300 font-medium truncate">{badge.requirement}</span>
                    <span className="text-slate-500 group-hover:text-sky-400">Ver →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Rank Shield Details */}
      {selectedRank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#07111F] border border-sky-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div
              className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${selectedRank.shieldColor} opacity-15 blur-[80px] pointer-events-none`}
            />

            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedRank.shieldColor} flex items-center justify-center shadow-lg shrink-0 p-1`}
                >
                  <div className="w-full h-full rounded-xl bg-[#07111F]/30 backdrop-blur-xs flex items-center justify-center border border-white/20">
                    <Shield size={28} className="text-white" />
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedRank.badgeBg} ${selectedRank.borderColor} border ${selectedRank.textColor}`}
                  >
                    Escudo de Rango: {selectedRank.name}
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">
                    {selectedRank.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedRank(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="p-3.5 rounded-2xl bg-[#0B192E] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                    Requisito de Horas
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    {selectedRank.minHours} horas aprobadas en DMPS
                  </span>
                </div>
                <div>
                  {approvedHours >= selectedRank.minHours ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Desbloqueado
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                      <Lock size={13} /> {(selectedRank.minHours - approvedHours).toFixed(1)}h restantes
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-1.5">
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={14} className="text-sky-400" />
                  <span>¿Por qué se otorga este reconocimiento?</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedRank.whyAwarded}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Recompensas y Beneficios Incluidos:
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedRank.rewards.map((reward, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{reward}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 relative z-10">
              <button
                onClick={() => setSelectedRank(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cerrar
              </button>

              {selectedRank.certificateMilestone &&
                approvedHours >= selectedRank.certificateMilestone &&
                onOpenCertificate && (
                  <button
                    onClick={() => {
                      const milestone = selectedRank.certificateMilestone!;
                      setSelectedRank(null);
                      onOpenCertificate(milestone);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    <Award size={15} />
                    <span>Ver Diploma Oficial de {selectedRank.certificateMilestone} Horas</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Single Achievement Medal Detailed View */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#07111F] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedBadge.colorGrade} flex items-center justify-center shrink-0 shadow-lg`}
                >
                  <Award size={26} className="text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    {selectedBadge.categoryLabel}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedBadge.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#0B192E] border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estado de Desbloqueo:</span>
                {selectedBadge.unlocked ? (
                  <span className="px-3 py-1 rounded-full text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Desbloqueado y Verificado
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-slate-400 bg-slate-800 border border-slate-700 font-medium flex items-center gap-1">
                    <Lock size={12} /> Bloqueado
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Descripción del Reconocimiento:
                </h4>
                <p className="text-xs text-slate-300 bg-[#0B192E]/60 border border-slate-800 rounded-2xl p-3.5 leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-xs space-y-1">
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                  Requisito para Desbloquear:
                </span>
                <p className="text-slate-200 font-medium">
                  {selectedBadge.requirement}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              {selectedBadge.unlocked && (
                <button
                  onClick={() => {
                    const badgeToCelebrate = selectedBadge;
                    setSelectedBadge(null);
                    setCelebratingBadge(badgeToCelebrate);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>Ver Animación 3D Dorada</span>
                </button>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all ml-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Golden Celebration Modal */}
      {celebratingBadge && (
        <AchievementCelebrationModal
          badges={[celebratingBadge]}
          onClose={() => setCelebratingBadge(null)}
          onNavigateToCertificates={() => {
            setCelebratingBadge(null);
            if (onOpenCertificate) {
              onOpenCertificate(160);
            }
          }}
        />
      )}
    </div>
  );
};
