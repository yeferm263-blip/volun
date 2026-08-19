import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Layers,
  HeartHandshake,
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Award,
  Users,
  Clock,
  MapPin,
  ChevronRight,
  Info,
  Activity,
  LogIn,
  UserPlus,
  Crown,
  Medal,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from '../../components/Logo';
import { api, formatMinutes } from '../../services/api';
import { EventItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface HomeHubViewProps {
  onNavigate: (view: string) => void;
  onSelectEvent: (eventId: string) => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = ({
  onNavigate,
  onSelectEvent,
}) => {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [honorees160, setHonorees160] = useState<any[]>([]);
  const [loadingHonorees, setLoadingHonorees] = useState(true);

  useEffect(() => {
    loadUpcoming();
    load160Honorees();
  }, []);

  const loadUpcoming = async () => {
    try {
      const res = await api.getPublicEvents({ status: 'OPEN' });
      setUpcomingEvents((res.events || []).slice(0, 3));
    } catch (e) {
      console.error('Error fetching upcoming events:', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const load160Honorees = async () => {
    try {
      const res = await api.getSilverCord160Honorees();
      if (res.success && Array.isArray(res.honorees)) {
        setHonorees160(res.honorees);
      }
    } catch (e) {
      console.error('Error fetching 160-hour honorees:', e);
    } finally {
      setLoadingHonorees(false);
    }
  };

  const formatDateSpanish = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Principal */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-sky-500/30 text-sky-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Portal Unificado de Comunidad & Voluntariado</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
              DMPS Connect <span className="text-sky-400">Hub</span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-slate-200 tracking-tight">
              Conectando recursos, oportunidades, herramientas y personas en un mismo lugar.
            </p>
            <p className="text-xs sm:text-sm text-sky-400/90 font-medium italic">
              "Conectando Familias, Información y Personas."
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-slate-400 text-xs sm:text-base leading-relaxed">
            Descubre eventos comunitarios abiertos, accede a guías escolares bilingües y certifícate como voluntario activo con registro oficial de horas.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="hero-btn-events"
              onClick={() => onNavigate('public-events')}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Eventos Abiertos</span>
            </button>

            <button
              id="hero-btn-apps"
              onClick={() => onNavigate('apps')}
              className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Nuestras Apps</span>
            </button>

            {!user ? (
              <button
                id="hero-btn-register"
                onClick={() => onNavigate('register')}
                className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/80 hover:bg-slate-800 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta</span>
              </button>
            ) : (
              <button
                id="hero-btn-account"
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-950 hover:bg-blue-900 text-sky-300 border border-blue-500/40 transition-all flex items-center gap-2"
              >
                <span>Mi Cuenta ({user.role})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Reconocimiento Especial y Anuncio Discreto: 160 Horas Cumplidas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#07111F] via-[#0D1B2E] to-[#07111F] border border-amber-500/30 hover:border-amber-400/50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
                <Crown size={20} className="text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    Reconocimiento Distrital de Honor
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 text-[10px] font-bold">
                    160 Horas Silver Cord
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Voluntarios que alcanzaron el Máximo Galardón de Honor
                </h3>
              </div>
            </div>

            <button
              onClick={() => onNavigate('public-ranking')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start md:self-auto transition-colors shrink-0"
            >
              <span>Ver ranking distrital</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Felicitamos con orgullo a los estudiantes que han consagrado <strong>160 horas de servicio solidario</strong> enriqueciendo las escuelas y familias de Des Moines.
            </p>

            {loadingHonorees ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Consultando cuadro de honor...</span>
              </div>
            ) : honorees160.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 pt-1">
                {honorees160.map((honoree) => (
                  <div
                    key={honoree.id || honoree.volunteer_id}
                    onClick={() => onNavigate('public-ranking')}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#050A14]/90 border border-amber-500/30 hover:border-amber-400/70 text-slate-200 hover:text-white transition-all cursor-pointer group shadow-sm"
                    title={`Ver perfil público de ${honoree.first_name} ${honoree.last_name}`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                      ★
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        {honoree.first_name} {honoree.last_name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {honoree.school || 'DMPS'} • <strong className="text-amber-300">{honoree.approved_hours || Math.round(honoree.approved_minutes / 60)}h</strong>
                      </div>
                    </div>
                    {honoree.rating_avg && (
                      <div className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold ml-1 pl-1.5 border-l border-white/10">
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span>{honoree.rating_avg.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#050A14]/60 border border-white/5 text-xs text-slate-400 flex items-center justify-between gap-4">
                <span>
                  🌟 El ciclo actual está en marcha. Sé uno de los primeros estudiantes en registrar y completar 160 horas de voluntariado para aparecer en este anuncio de honor.
                </span>
                <button
                  onClick={() => onNavigate('submit-hours')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 shrink-0 transition-colors"
                >
                  Registrar Horas
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. Cuadro de Honor & Ranking de Voluntarios */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#07111F] via-[#0A1830] to-[#07111F] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Reconocimiento Comunitario DMPS</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Cuadro de Honor & <span className="text-amber-400">Ranking de Voluntarios</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Reconoce el impacto de los estudiantes y voluntarios del distrito. Busca a cualquier voluntario de forma pública sin iniciar sesión, consulta sus medallas oficiales y califícalo con 1 a 5 estrellas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => onNavigate('public-ranking')}
                className="px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>Explorar Ranking & Calificar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10">
            <div className="p-3.5 bg-[#050A14]/80 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Acceso Público</span>
              <span className="text-xs sm:text-sm font-extrabold text-white">Sin Registro Previo</span>
            </div>
            <div className="p-3.5 bg-[#050A14]/80 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Valoraciones</span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-400">1 a 5 Estrellas ⭐</span>
            </div>
            <div className="p-3.5 bg-[#050A14]/80 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Catálogo Oficial</span>
              <span className="text-xs sm:text-sm font-extrabold text-sky-400">+100 Medallas</span>
            </div>
            <div className="p-3.5 bg-[#050A14]/80 border border-white/10 rounded-2xl">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Constancias</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-400">PDF Diplomas</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Acceso Rápido a Nuestras Apps */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>Ecosistema Digital DMPS Connect</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Herramientas creadas para apoyar a familias y coordinadores.
            </p>
          </div>
          <button
            onClick={() => onNavigate('apps')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 hidden sm:flex items-center gap-1"
          >
            <span>Ver detalles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DMPS INFO */}
          <div className="bg-[#07111F]/90 border border-sky-500/25 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-sky-500/50 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400">
                  <Info className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">
                  PORTAL INFORMATIVO
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                DMPS INFO
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Plataforma informativa para encontrar recursos, programas, guías prácticas y servicios para familias y estudiantes.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80">
              <a
                href="https://info.familiasdmps.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>ABRIR DMPS INFO</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* DMPS STATUS */}
          <div className="bg-[#07111F]/90 border border-amber-500/25 rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-amber-500/50 transition-all group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  HERRAMIENTA OPERATIVA
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                DMPS STATUS
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Herramienta independiente utilizada para apoyar la operación en vivo y monitoreo de actividades específicas en terreno.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-800/80">
              <a
                href="https://status.familiasdmps.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-600/90 hover:bg-amber-500 text-white flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>ABRIR DMPS STATUS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Próximos Eventos Comunitarios */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-sky-400" />
              <span>Próximos Eventos & Oportunidades</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Participa como voluntario en nuestras próximas jornadas comunitarias.
            </p>
          </div>
          <button
            onClick={() => onNavigate('public-events')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            <span>Ver todos ({upcomingEvents.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loadingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-[#07111F]/60 border border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="bg-[#07111F]/70 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-white">No hay eventos próximos en este momento</p>
            <p className="text-xs text-slate-400">Vuelve a consultar pronto o revisa la lista completa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#07111F]/90 border border-slate-800/90 hover:border-sky-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {evt.available_spots} cupos libres
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {evt.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {evt.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="capitalize">{formatDateSpanish(evt.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{formatMinutes(evt.estimated_minutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onSelectEvent(evt.id)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <span>Ver Evento</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Voluntariado & Certificación de Horas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-950/40 via-[#07111F] to-sky-950/40 border border-sky-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 text-sky-300 text-xs font-semibold">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Portal de Voluntariado Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Acredita tus Horas de Servicio con Confianza
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Nuestro sistema audita cada minuto de voluntariado realizado en ferias escolares, talleres digitales y jornadas comunitarias. Obtén tu constancia en PDF con código QR y validación oficial.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-[#050A14]/70 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-sky-400 block font-mono">VOL-XXXXX</span>
                <span className="text-[11px] text-slate-400">ID de Voluntario</span>
              </div>
              <div className="p-3 bg-[#050A14]/70 border border-slate-800 rounded-xl">
                <span className="text-xs font-bold text-emerald-400 block">Minutos Exactos</span>
                <span className="text-[11px] text-slate-400">Sin redondeos falsos</span>
              </div>
              <div className="p-3 bg-[#050A14]/70 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-xs font-bold text-amber-400 block">Certificado PDF</span>
                <span className="text-[11px] text-slate-400">Descarga instantánea</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-64 shrink-0">
            <button
              onClick={() => onNavigate(user ? 'dashboard' : 'register')}
              className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/40 transition-all text-center"
            >
              {user ? 'Ir a Mi Panel' : 'Registrarse como Voluntario'}
            </button>
            <button
              onClick={() => onNavigate('volunteer-info')}
              className="w-full py-3 px-6 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-center"
            >
              ¿Cómo funciona?
            </button>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 text-xs text-slate-400 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <p className="text-sm font-bold text-white">DMPS Connect Hub</p>
              <p className="text-[11px] text-slate-400">"Conectando Familias, Información y Personas."</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <button onClick={() => onNavigate('home')} className="hover:text-sky-300">Inicio</button>
            <button onClick={() => onNavigate('about')} className="hover:text-sky-300">Sobre Nosotros</button>
            <button onClick={() => onNavigate('apps')} className="hover:text-sky-300">Apps</button>
            <button onClick={() => onNavigate('public-events')} className="hover:text-sky-300">Eventos</button>
            <button onClick={() => onNavigate('resources')} className="hover:text-sky-300">Recursos</button>
            <button onClick={() => onNavigate('faq')} className="hover:text-sky-300">FAQ</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-sky-300">Contacto</button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 border-t border-slate-800/60 pt-4">
          © {new Date().getFullYear()} DMPS Connect. Plataforma comunitaria independiente para la gestión y acreditación de voluntariado escolar.
        </p>
      </footer>
    </div>
  );
};
