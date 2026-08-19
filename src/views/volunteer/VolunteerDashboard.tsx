import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import { HourSubmission, EventApplication } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { RANK_TIERS } from '../../components/VolunteerRankShields';
import {
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Plus,
  ArrowRight,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  FileCheck,
  Building,
  Wand2,
  HeartHandshake,
  Compass,
  Shield,
  Star,
} from 'lucide-react';

interface VolunteerDashboardProps {
  onNavigate: (view: string) => void;
  onOpenSubmissionDetails: (id: string) => void;
  onOpenCorrection: (id: string) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  onNavigate,
  onOpenSubmissionDetails,
  onOpenCorrection,
}) => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<HourSubmission[]>([]);
  const [myApplications, setMyApplications] = useState<EventApplication[]>([]);
  const [stats, setStats] = useState({
    approved_minutes: 0,
    pending_minutes: 0,
    this_month_minutes: 0,
    rejected_count: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [subsData, appsData] = await Promise.all([
        api.getMySubmissions(),
        api.getMyApplications().catch(() => ({ applications: [] })),
      ]);
      setSubmissions(subsData.submissions || []);
      if (subsData.stats) {
        setStats(subsData.stats);
      }
      setMyApplications(appsData.applications || []);
    } catch (err) {
      console.error('Error loading volunteer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const needsCorrectionItems = submissions.filter((s) => s.status === 'NEEDS_CORRECTION');
  const pendingSubmissions = submissions.filter((s) => s.status === 'PENDING');
  const recentSubmissions = submissions.slice(0, 6);

  const acceptedEvents = myApplications.filter((a) => a.status === 'ACCEPTED');
  const activeApplications = myApplications.filter((a) => a.status === 'PENDING' || a.status === 'WAITLIST');

  // Calculate hours & minutes for display
  const approvedHours = Math.floor((stats.approved_minutes || 0) / 60);
  const approvedMins = (stats.approved_minutes || 0) % 60;

  const pendingHours = Math.floor((stats.pending_minutes || 0) / 60);
  const pendingMins = (stats.pending_minutes || 0) % 60;

  const monthHours = Math.floor((stats.this_month_minutes || 0) / 60);
  const monthMins = (stats.this_month_minutes || 0) % 60;

  // Monthly Goal (e.g. 50 hours standard goal)
  const targetGoalMinutes = 50 * 60;
  const goalPercentage = Math.min(
    100,
    Math.round(((stats.approved_minutes || 0) / targetGoalMinutes) * 100)
  );
  const hoursLeftForGoal = Math.max(
    0,
    Math.ceil((targetGoalMinutes - (stats.approved_minutes || 0)) / 60)
  );

  // SVG circle calculation
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalPercentage / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-blue-600/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
              {profile?.volunteer_id || 'VOL-00001'}
            </span>
            <span className="text-xs text-slate-400">
              {profile?.school || 'Servicio Comunitario DMPS'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            ¡Hola, {profile?.first_name || 'Voluntario'}!
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Bienvenido a tu panel de voluntariado y eventos de DMPS Connect.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('public-events')}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shrink-0"
          >
            <Compass size={15} />
            <span>Explorar Convocatorias</span>
          </button>
          <button
            onClick={() => onNavigate('submit-hours')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/30 flex items-center gap-2 transition-all active:scale-95 shrink-0 text-xs"
          >
            <Plus size={16} />
            <span>Registrar Horas</span>
          </button>
        </div>
      </header>

      {/* Needs Correction Urgent Banner if any */}
      {needsCorrectionItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-orange-200">
                Tienes {needsCorrectionItems.length} {needsCorrectionItems.length === 1 ? 'registro' : 'registros'} que requiere corrección
              </h4>
              <p className="text-xs text-orange-300/80 mt-0.5">
                Actividad: "{needsCorrectionItems[0].activity_name}". Haz clic para revisar las notas del coordinador.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenCorrection(needsCorrectionItems[0].id)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
          >
            Corregir Ahora
          </button>
        </div>
      )}

      {/* Event Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Mis Eventos Confirmados */}
        <div
          onClick={() => onNavigate('my-events')}
          className="p-5 rounded-2xl bg-[#07111F] border border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mis Eventos Confirmados
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400">
                  {acceptedEvents.length}
                </span>
              </div>
              <p className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mt-0.5">
                {acceptedEvents.length === 0
                  ? 'No tienes eventos próximos agendados'
                  : `${acceptedEvents.length} ${acceptedEvents.length === 1 ? 'evento confirmado con cupo' : 'eventos confirmados con cupo'}`}
              </p>
              <span className="text-xs text-sky-400 font-medium inline-flex items-center gap-1 mt-1">
                Ver calendario y cuenta regresiva →
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
        </div>

        {/* Mis Solicitudes Activas */}
        <div
          onClick={() => onNavigate('my-applications')}
          className="p-5 rounded-2xl bg-[#07111F] border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HeartHandshake size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Mis Solicitudes Activas
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400">
                  {activeApplications.length}
                </span>
              </div>
              <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mt-0.5">
                {activeApplications.length === 0
                  ? 'Sin postulaciones pendientes'
                  : `${activeApplications.length} ${activeApplications.length === 1 ? 'postulación en proceso de revisión' : 'postulaciones en proceso de revisión'}`}
              </p>
              <span className="text-xs text-purple-400 font-medium inline-flex items-center gap-1 mt-1">
                Ver estado de postulaciones →
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* 4 Metrics Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Horas Aprobadas */}
        <div className="bg-[#07111F]/60 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Horas Aprobadas
          </p>
          <h3 className="text-2xl sm:text-4xl font-bold text-white">
            {approvedHours}
            <span className="text-lg sm:text-xl font-normal text-slate-500 ml-1">h</span>{' '}
            {approvedMins}
            <span className="text-lg sm:text-xl font-normal text-slate-500 ml-1">min</span>
          </h3>
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, goalPercentage))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Horas Pendientes */}
        <div className="bg-[#07111F]/60 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Horas en Revisión
          </p>
          <h3 className="text-2xl sm:text-4xl font-bold text-blue-400">
            {pendingHours}
            <span className="text-lg sm:text-xl font-normal text-slate-500 ml-1">h</span>{' '}
            {pendingMins}
            <span className="text-lg sm:text-xl font-normal text-slate-500 ml-1">min</span>
          </h3>
          <p className="text-xs text-slate-500 mt-4 truncate">
            {pendingSubmissions.length} {pendingSubmissions.length === 1 ? 'registro enviado' : 'registros enviados'}
          </p>
        </div>

        {/* Card 3: Este Mes */}
        <div className="bg-[#07111F]/60 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Este Mes
          </p>
          <h3 className="text-2xl sm:text-4xl font-bold text-indigo-400">
            {monthHours}
            <span className="text-lg sm:text-xl font-normal text-slate-500 ml-1">h</span>{' '}
            {monthMins}
            <span className="text-lg sm:text-xl font-normal text-slate-500 ml-1">min</span>
          </h3>
          <p className="text-xs text-green-400 mt-4 flex items-center gap-1 font-medium">
            <span>+ Horas registradas</span>
          </p>
        </div>

        {/* Card 4: Rechazadas */}
        <div className="bg-[#07111F]/60 border border-white/5 p-5 sm:p-6 rounded-2xl backdrop-blur-sm hover:border-white/10 transition-colors">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Rechazadas
          </p>
          <h3 className="text-2xl sm:text-4xl font-bold text-rose-500">
            {stats.rejected_count}
          </h3>
          <p
            onClick={() => onNavigate('my-hours')}
            className="text-xs text-rose-400 mt-4 underline cursor-pointer hover:text-rose-300"
          >
            Ver registros no válidos
          </p>
        </div>
      </section>

      {/* Main Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity Feed (2 cols on lg) */}
        <div className="lg:col-span-2 bg-[#07111F]/40 border border-white/5 rounded-3xl p-5 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Historial de Horas Recientes</h2>
              <p className="text-xs text-slate-400">Tus últimas actividades enviadas</p>
            </div>
            <button
              onClick={() => onNavigate('my-hours')}
              className="text-blue-400 text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1"
            >
              <span>Ver todo</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock size={40} className="mx-auto mb-2 opacity-20 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">Aún no has registrado actividades</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Comienza registrando tu primera actividad comunitaria o solicitando cupo en un evento.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={() => onNavigate('submit-hours')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  <Plus size={14} />
                  <span>Registrar Horas</span>
                </button>
                <button
                  onClick={() => onNavigate('public-events')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                >
                  <Compass size={14} />
                  <span>Explorar Eventos</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1 custom-scrollbar">
              {recentSubmissions.map((sub) => {
                const isApproved = sub.status === 'APPROVED';
                const isPending = sub.status === 'PENDING' || sub.status === 'CORRECTED';
                const isCorrection = sub.status === 'NEEDS_CORRECTION';
                const isRejected = sub.status === 'REJECTED';

                const borderLeftClass = isApproved
                  ? 'border-l-green-500 border-l-4'
                  : isPending
                  ? 'border-l-yellow-500 border-l-4'
                  : isCorrection
                  ? 'border-l-orange-500 border-l-4'
                  : 'border-l-rose-500 border-l-4 opacity-80';

                const iconBgClass = isApproved
                  ? 'bg-green-500/20 text-green-400'
                  : isPending
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : isCorrection
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-rose-500/20 text-rose-400';

                return (
                  <div
                    key={sub.id}
                    onClick={() => {
                      if (sub.status === 'NEEDS_CORRECTION') {
                        onOpenCorrection(sub.id);
                      } else {
                        onOpenSubmissionDetails(sub.id);
                      }
                    }}
                    className={`flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group ${borderLeftClass}`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}
                    >
                      {isApproved ? (
                        <CheckCircle2 size={20} />
                      ) : isRejected ? (
                        <XCircle size={20} />
                      ) : isCorrection ? (
                        <AlertTriangle size={20} />
                      ) : (
                        <Clock size={20} />
                      )}
                    </div>

                    <div className="flex-1 ml-3.5 min-w-0">
                      <h4 className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                        {sub.activity_name}
                      </h4>
                      <p className="text-xs text-slate-400 tracking-tight truncate mt-0.5">
                        {sub.organization_name} • {sub.date}
                      </p>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-xs sm:text-sm text-white font-mono">
                        {formatMinutes(sub.approved_minutes || sub.submitted_minutes)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={sub.status} size="sm" showIcon={false} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Immersive Widgets (1 col on lg) */}
        <div className="space-y-6">
          {/* Monthly Achievement Card with Radial Progress */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Meta de Horas</h2>
              <Award size={20} className="text-blue-200 opacity-80" />
            </div>
            <p className="text-blue-100 text-xs mt-1">
              {hoursLeftForGoal > 0
                ? `¡Estás a solo ${hoursLeftForGoal} horas de alcanzar la meta de 50 horas!`
                : '¡Felicidades! Has completado tu meta de 50 horas.'}
            </p>

            {/* Radial SVG Gauge */}
            <div className="relative w-32 h-32 mx-auto my-5">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/15"
                />
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-white transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{goalPercentage}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Progreso
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('my-hours')}
              className="w-full bg-white text-blue-700 hover:bg-blue-50 py-2.5 rounded-xl font-bold text-xs shadow-inner active:scale-95 transition-all"
            >
              Ver Constancia de Horas
            </button>
          </div>

          {/* Rank Shields & Achievements Widget */}
          {(() => {
            const approvedHoursTotal = (stats.approved_minutes || 0) / 60;
            const currentTier = RANK_TIERS.reduce((acc, tier) => {
              if (approvedHoursTotal >= tier.minHours) return tier;
              return acc;
            }, RANK_TIERS[0]);

            return (
              <div
                onClick={() => onNavigate('profile')}
                className="bg-[#07111F] border border-sky-500/30 hover:border-sky-400/60 rounded-3xl p-6 transition-all cursor-pointer group shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                    <Shield size={16} />
                    <span>Rango de Voluntario</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${currentTier.badgeBg} ${currentTier.borderColor} border ${currentTier.textColor}`}>
                    {currentTier.name}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 my-2">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentTier.shieldColor} flex items-center justify-center shadow-md p-0.5 shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <div className="w-full h-full rounded-xl bg-[#07111F]/30 backdrop-blur-xs flex items-center justify-center border border-white/20">
                      <Shield size={22} className="text-white" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {currentTier.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {approvedHoursTotal.toFixed(1)} horas acumuladas
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-sky-400 font-semibold group-hover:underline">
                  <span>Ver todos los escudos y logros</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })()}

          {/* Quick Access to Certificates View */}
          <div className="bg-[#07111F]/90 border border-amber-500/30 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <span>Mis Certificados Oficiales</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                DMPS Silver Cord
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consulta, imprime o descarga tus diplomas de 10h, 25h, 50h y 100h con sello digital y código QR verificable.
            </p>
            <button
              onClick={() => onNavigate('certificates')}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Award size={14} />
              <span>Abrir Portal de Certificados →</span>
            </button>
          </div>

          {/* Quick Access to Events Hub */}
          <div className="bg-[#07111F]/60 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Compass size={16} className="text-sky-400" />
                <span>Explorar DMPS Connect</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encuentra convocatorias activas en escuelas, ferias y bibliotecas del distrito escolar.
            </p>
            <button
              onClick={() => onNavigate('public-events')}
              className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-sky-300 border border-blue-500/20 rounded-xl text-xs font-bold transition-all text-center"
            >
              Ver Convocatorias Abiertas →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
