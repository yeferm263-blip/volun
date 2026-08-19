import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import { Certificate } from '../../types';
import { Logo } from '../../components/Logo';
import {
  Award,
  Shield,
  Star,
  CheckCircle2,
  Calendar,
  Download,
  Printer,
  ExternalLink,
  QrCode,
  Sparkles,
  Lock,
  ChevronRight,
  Eye,
  X,
  Share2,
  Check,
  Building,
  User,
  Clock,
  FileCheck2,
  Wand2,
  BookmarkCheck,
  ShieldCheck,
  Crown,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyCertificatesViewProps {
  onNavigate?: (view: string) => void;
}

export const MyCertificatesView: React.FC<MyCertificatesViewProps> = ({ onNavigate }) => {
  const { profile, stats, refreshUserData } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const approvedMinutes = profile?.approved_minutes || stats?.approved_minutes || 0;
  const approvedHours = approvedMinutes / 60;

  const milestones = [
    {
      hours: 10,
      title: 'Certificado de Plata - 10 Horas',
      subtitle: 'Iniciación de Impacto Comunitario',
      badgeColor: 'from-slate-300 via-slate-400 to-slate-600',
      textColor: 'text-slate-200',
      borderColor: 'border-slate-400/40',
      sealText: '10 HORAS • PLATA',
      description: 'Reconocimiento oficial por superar las primeras 10 horas de servicio solidario en DMPS.',
    },
    {
      hours: 25,
      title: 'Diploma de Honor - 25 Horas',
      subtitle: 'Voluntario de Excelencia',
      badgeColor: 'from-amber-300 via-yellow-500 to-amber-600',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-500/40',
      sealText: '25 HORAS • ORO',
      description: 'Distinción cívica por dedicación sobresaliente con las escuelas y familias del distrito.',
    },
    {
      hours: 50,
      title: 'Galardón de Liderazgo - 50 Horas',
      subtitle: 'Líder Juvenil Comunitario',
      badgeColor: 'from-cyan-300 via-sky-500 to-blue-600',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-400/40',
      sealText: '50 HORAS • ZAFIRO',
      description: 'Acreditación de liderazgo, proactividad y coordinación en eventos masivos escolares.',
    },
    {
      hours: 160,
      title: 'Máximo Galardón de Honor - 160 Horas',
      subtitle: 'Excelencia Cívica Silver Cord DMPS',
      badgeColor: 'from-amber-300 via-indigo-500 to-purple-500',
      textColor: 'text-amber-200',
      borderColor: 'border-amber-400/50',
      sealText: '160 HORAS • SILVER CORD',
      description: 'La más alta distinción honorífica del Distrito Escolar de Des Moines por completar 160 horas de servicio solidario.',
    },
  ];

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.getMyCertificates();
      setCertificates(res.certificates || []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Award size={12} />
              <span>Acreditación Oficial DMPS</span>
            </span>
            <span className="text-xs text-slate-400">
              Des Moines Public Schools • Silver Cord
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>Mis Diplomas & Certificados Oficiales</span>
            <Sparkles size={22} className="text-amber-400" />
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Tus diplomas se emiten automáticamente en formato apaisado horizontal con sello digital, folio y QR verificable
            al alcanzar los hitos de 10h, 25h, 50h y 160h de voluntariado.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigate && (
            <button
              onClick={() => onNavigate('submit-hours')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30"
            >
              <Wand2 size={15} />
              <span>Registrar Horas con IA</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="bg-[#07111F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
              <Award size={30} />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Progreso Acumulado de Horas Aprobadas
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {approvedHours.toFixed(1)}{' '}
                <span className="text-base sm:text-lg font-normal text-slate-400">/ 160 horas Silver Cord</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#0B192E] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Diplomas Emitidos</span>
              <span className="text-xl font-bold text-amber-400">{certificates.length}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#0B192E] border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Próximo Hito</span>
              <span className="text-xl font-bold text-sky-400">
                {milestones.find((m) => approvedHours < m.hours)?.hours || 160}h
              </span>
            </div>
          </div>
        </div>

        {/* Milestones Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {milestones.map((ms) => {
            const isUnlocked = approvedHours >= ms.hours;
            const progress = Math.min(100, Math.round((approvedHours / ms.hours) * 100));
            const hoursRemaining = Math.max(0, ms.hours - approvedHours);
            const issuedCert = certificates.find((c) => c.hours_milestone === ms.hours);

            return (
              <div
                key={ms.hours}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#0B192E] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-[#07111F]/40 border-white/5 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${
                        isUnlocked
                          ? `bg-gradient-to-br ${ms.badgeColor} text-slate-950`
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {ms.hours}h
                    </div>

                    {isUnlocked ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Desbloqueado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium flex items-center gap-1">
                        <Lock size={10} /> {ms.hours}h meta
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{ms.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{ms.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isUnlocked ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{progress}% completado</span>
                    {isUnlocked ? (
                      <span className="text-emerald-400 font-bold">¡Completado!</span>
                    ) : (
                      <span>Faltan {hoursRemaining.toFixed(1)}h</span>
                    )}
                  </div>

                  {issuedCert && (
                    <button
                      onClick={() => setSelectedCert(issuedCert)}
                      className="w-full mt-2 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Ver Diploma Horizontal</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issued Certificates Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-amber-400" />
            <span>Diplomas Oficiales Emitidos ({certificates.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-[#07111F] rounded-3xl border border-white/5">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando diplomas oficiales...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-[#07111F] rounded-3xl border border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <Award size={32} />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">Aún no tienes diplomas emitidos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Alcanza 10 horas de servicio comunitario voluntario y el administrador las validará para desbloquear tu
                primer diploma oficial con sello institucional.
              </p>
            </div>
            {onNavigate && (
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('submit-hours')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/30"
                >
                  <Wand2 size={15} />
                  <span>Registrar Horas con IA</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((cert) => {
              const is160Gold = cert.hours_milestone >= 160;
              return (
                <div
                  key={cert.id}
                  className={`rounded-3xl p-6 transition-all shadow-xl space-y-4 relative overflow-hidden group ${
                    is160Gold
                      ? 'bg-gradient-to-br from-[#1B1203] via-[#0E0B02] to-[#241905] border-2 border-amber-400/80 shadow-amber-500/20 hover:border-amber-300'
                      : 'bg-[#07111F] border border-amber-500/30 hover:border-amber-500/60 hover:shadow-amber-500/5'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-36 h-36 blur-3xl pointer-events-none ${is160Gold ? 'bg-amber-400/20' : 'bg-amber-500/5'}`} />

                  {is160Gold && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-widest w-fit shadow-md shadow-amber-500/20">
                      <Crown size={12} />
                      <span>DIPLOMA DORADO DE GRADUACIÓN</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0 ${
                        is160Gold
                          ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-amber-400/40 border border-yellow-200'
                          : 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 shadow-amber-500/20'
                      }`}>
                        {is160Gold ? <Crown size={26} className="text-slate-950" /> : <Award size={26} />}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                          DMPS SILVER CORD • {is160Gold ? 'MÁXIMO HONOR DISTRITAL' : 'DIPLOMA OFICIAL'}
                        </span>
                        <h3 className="text-base font-bold text-white leading-tight">
                          Certificado de {cert.hours_milestone} Horas {is160Gold ? 'de Graduación' : 'de Mérito'}
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Válido Oficial
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                    is160Gold ? 'bg-[#120D02]/80 border-amber-500/30 text-amber-100' : 'bg-[#0B192E] border-white/5 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Titular:</span>
                      <strong className="text-white font-semibold">{cert.volunteer_name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Escuela:</span>
                      <span>{cert.school || 'Des Moines Public Schools'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fecha de Emisión:</span>
                      <span>{cert.issue_date || new Date().toISOString().split('T')[0]}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-400">Folio de Verificación:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-amber-300 font-mono text-[11px] font-bold">
                          {cert.certificate_code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(cert.certificate_code)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === cert.certificate_code ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Share2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedCert(cert)}
                      className={`flex-1 py-2.5 rounded-xl text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${
                        is160Gold
                          ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-yellow-400 shadow-amber-400/30'
                          : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 shadow-amber-500/20'
                      }`}
                    >
                      {is160Gold ? <Crown size={14} /> : <Eye size={14} />}
                      <span>{is160Gold ? 'Ver Diploma Dorado Oficial (Imprimir/Descargar)' : 'Ver Diploma Horizontal (Imprimir/Descargar)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Horizontal Landscape Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#050A14] border border-amber-500/40 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
            {/* Modal Top Action Bar */}
            <div className="p-4 border-b border-white/10 bg-[#07111F] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={16} />
                  <span>Diploma Oficial Horizontal (Landscape)</span>
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  • Folio: {selectedCert.certificate_code}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
                >
                  <Printer size={15} />
                  <span>Imprimir Diploma (Horizontal)</span>
                </button>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Container with Landscape Certificate */}
            <div className="p-4 sm:p-8 overflow-y-auto flex justify-center bg-slate-950">
              {(() => {
                const is160Gold = selectedCert.hours_milestone >= 160;
                return (
                  /* Landscape Diploma Canvas: Aspect 1.45:1 for standard landscape letter/A4 presentation */
                  <div
                    className={`w-full max-w-4xl rounded-2xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[520px] ${
                      is160Gold
                        ? 'bg-gradient-to-br from-[#2B1D04] via-[#171002] to-[#3A2807] border-8 border-double border-amber-400 text-amber-50 shadow-[0_0_90px_rgba(245,158,11,0.35)]'
                        : 'bg-gradient-to-br from-[#0A1628] via-[#07111F] to-[#0D1E36] border-8 border-double border-amber-500/60 text-slate-100'
                    }`}
                  >
                    {/* Decorative Guilloche Corner Borders */}
                    <div className={`absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 pointer-events-none ${is160Gold ? 'border-yellow-300' : 'border-amber-400/80'}`} />
                    <div className={`absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 pointer-events-none ${is160Gold ? 'border-yellow-300' : 'border-amber-400/80'}`} />
                    <div className={`absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 pointer-events-none ${is160Gold ? 'border-yellow-300' : 'border-amber-400/80'}`} />
                    <div className={`absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 pointer-events-none ${is160Gold ? 'border-yellow-300' : 'border-amber-400/80'}`} />

                    {/* Inner Gold Thin Inset */}
                    <div className={`absolute inset-3 border pointer-events-none rounded-lg ${is160Gold ? 'border-amber-400/50' : 'border-amber-400/20'}`} />

                    {/* Watermark Logo */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                      <Logo size="lg" />
                    </div>

                    {/* 1. Header Section: District & Crest */}
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-center gap-3">
                        <Logo size="sm" />
                        <div className="text-left">
                          <h4 className="text-xs uppercase font-black tracking-[0.2em] text-amber-400">
                            DES MOINES PUBLIC SCHOOLS
                          </h4>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                            {is160Gold ? 'PROGRAMA DE HONOR SILVER CORD • MÁXIMA DISTINCIÓN' : 'PROGRAMA OFICIAL DE HONOR SILVER CORD'}
                          </p>
                        </div>
                      </div>

                      {is160Gold && (
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-[11px] uppercase tracking-widest shadow-md">
                          <Crown size={13} />
                          <span>DIPLOMA DORADO OFICIAL DE GRADUACIÓN SILVER CORD</span>
                          <Crown size={13} />
                        </div>
                      )}

                      <div className="py-1">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 tracking-wider">
                          {is160Gold ? 'GRAN DIPLOMA DORADO DE EXCELENCIA CÍVICA Y GRADUACIÓN' : 'CERTIFICADO DE EXCELENCIA CÍVICA Y SERVICIO COMUNITARIO'}
                        </h2>
                        <p className="text-xs text-slate-300 italic mt-1 font-serif">
                          El Distrito Escolar de Des Moines confiere con honor el presente diploma a:
                        </p>
                      </div>
                    </div>

                    {/* 2. Recipient Name & Details (Prominent Landscape Centerpiece) */}
                    <div className="relative z-10 my-4 space-y-2">
                      <div className="inline-block border-b-2 border-amber-400/60 pb-2 px-8 sm:px-14">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-amber-300 tracking-wide drop-shadow-md">
                          {selectedCert.volunteer_name}
                        </h1>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto leading-relaxed pt-2">
                        {is160Gold ? (
                          <>
                            Por haber alcanzado con honor la meta cumbre de{' '}
                            <span className="text-white font-extrabold underline decoration-amber-400 underline-offset-4">
                              160 Horas de Servicio Comunitario
                            </span>
                            , completando la totalidad del Programa Silver Cord y haciéndose acreedor oficial del Cordón de Plata Distrital para la Ceremonia de Graduación Escolar.
                          </>
                        ) : (
                          <>
                            Por haber demostrado un compromiso ejemplar al completar con satisfacción un total de{' '}
                            <span className="text-white font-extrabold underline decoration-amber-400 underline-offset-4">
                              {selectedCert.hours_milestone} Horas
                            </span>{' '}
                            de servicio voluntario cívico, enriqueciendo a las escuelas, familias y comunidad de Des Moines.
                          </>
                        )}
                      </p>
                    </div>

                    {/* 3. Footer Section: Horizontal Layout with Seal, Signature, and QR code */}
                    <div className="relative z-10 pt-4 border-t border-amber-500/20 grid grid-cols-3 items-end text-xs">
                      {/* Left Column: Authorized Coordinator Signature */}
                      <div className="text-left space-y-1">
                        <div className="font-serif italic text-base text-amber-200 tracking-wide">
                          Brenda Lucero
                        </div>
                        <div className="w-36 h-0.5 bg-amber-400/40" />
                        <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Brenda Lucero
                        </p>
                        <p className="text-[10px] text-slate-400">Coordinadora Silver Cord DMPS</p>
                        <p className="text-[9px] text-slate-500">Emitido: {selectedCert.issue_date || 'Fecha Oficial'}</p>
                      </div>

                      {/* Center Column: Golden Metallic Embossed Seal */}
                      <div className="flex flex-col items-center justify-center">
                        <div className={`w-20 h-20 rounded-full p-1 shadow-2xl flex items-center justify-center border-2 ${
                          is160Gold
                            ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-amber-400/50 border-yellow-100'
                            : 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 shadow-amber-500/30 border-amber-200'
                        }`}>
                          <div className="w-full h-full rounded-full border border-dashed border-amber-950 flex flex-col items-center justify-center text-slate-950 text-center p-1">
                            {is160Gold ? <Crown size={20} className="text-slate-950 mb-0.5" /> : <Award size={18} className="text-slate-950 mb-0.5" />}
                            <span className="text-[7px] font-black uppercase tracking-tighter leading-none">
                              {is160Gold ? 'DMPS GRADUATION' : 'DMPS SEAL'}
                            </span>
                            <span className="text-[8px] font-black leading-none mt-0.5">
                              {selectedCert.hours_milestone} HORAS
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-amber-300 mt-1 uppercase font-bold tracking-wider">
                          {is160Gold ? '★ SELLO DE ORO DISTRITAL ★' : '★ SELLO OFICIAL ★'}
                        </span>
                      </div>

                      {/* Right Column: QR Verification and Code */}
                      <div className="text-right flex flex-col items-end space-y-1">
                        <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg">
                          <QrCode size={54} className="text-slate-950" />
                        </div>
                        <div className="text-[9px] text-slate-400">Folio de Verificación:</div>
                        <code className="text-[10px] font-mono text-amber-300 font-bold">
                          {selectedCert.certificate_code}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
