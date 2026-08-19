import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import confetti from 'canvas-confetti';
import { ActivityPresetsAssistant } from '../../components/ActivityPresetsAssistant';
import {
  Clock,
  Building,
  Calendar,
  MapPin,
  FileText,
  User,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Info,
  X,
  FileCheck,
  Plus,
  Layers,
  Edit3,
} from 'lucide-react';

interface SubmitHoursViewProps {
  onNavigate: (view: string) => void;
  onOpenMyHours: () => void;
}

export const SubmitHoursView: React.FC<SubmitHoursViewProps> = ({
  onNavigate,
  onOpenMyHours,
}) => {
  const { profile, refreshUserData } = useAuth();

  // Mode: 'manual' (Direct Form), 'presets' (Interactive Presets Assistant)
  const [activeTab, setActiveTab] = useState<'manual' | 'presets'>('manual');

  const [activityName, setActivityName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:30');
  const [useDirectHours, setUseDirectHours] = useState(false);
  const [directHours, setDirectHours] = useState<number>(3);
  const [directMinutes, setDirectMinutes] = useState<number>(30);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorSelection, setSupervisorSelection] = useState<string>('Brenda Lucero');
  const [customSupervisorName, setCustomSupervisorName] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofFileName, setProofFileName] = useState<string>('');
  const [isDuplicateWarning, setIsDuplicateWarning] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [submittedMinutesResult, setSubmittedMinutesResult] = useState<number>(0);

  const effectiveSupervisorName = supervisorSelection === '__CUSTOM__' 
    ? customSupervisorName.trim() 
    : supervisorSelection;

  // Automatic duration calculation from Start/End time
  const calculateDuration = (): number => {
    if (useDirectHours) {
      return (Number(directHours) || 0) * 60 + (Number(directMinutes) || 0);
    }
    if (!startTime || !endTime) return 0;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (endTotal > startTotal) {
      return endTotal - startTotal;
    } else if (endTotal > 0 && endTotal <= startTotal) {
      return (1440 - startTotal) + endTotal;
    }
    return 0;
  };

  const calculatedMinutes = calculateDuration();

  // Check duplicate asynchronously as user types activity and date
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (activityName.trim().length > 3 && date) {
        try {
          const res = await api.checkDuplicate(date, activityName.trim(), startTime);
          if (res.is_duplicate) {
            setIsDuplicateWarning(res.message || 'Parece que ya enviaste horas para esta actividad en esta fecha.');
          } else {
            setIsDuplicateWarning(null);
          }
        } catch {
          setIsDuplicateWarning(null);
        }
      } else {
        setIsDuplicateWarning(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [activityName, date, startTime]);

  // Handle proof file upload as Data URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo comprobante no debe superar los 5MB.');
        return;
      }
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!activityName.trim() || !organizationName.trim() || !date || !description.trim() || !effectiveSupervisorName) {
      setError('Por favor completa todos los campos obligatorios marcados con asterisco (*), incluyendo el supervisor.');
      return;
    }

    if (calculatedMinutes <= 0) {
      setError('La duración de la actividad debe ser mayor a 0 minutos.');
      return;
    }

    try {
      setLoading(true);
      await api.submitHours({
        activity_name: activityName.trim(),
        organization_name: organizationName.trim(),
        date,
        start_time: !useDirectHours ? startTime : '',
        end_time: !useDirectHours ? endTime : '',
        manual_hours: useDirectHours ? directHours : undefined,
        manual_minutes: useDirectHours ? directMinutes : undefined,
        location: location.trim(),
        description: description.trim(),
        supervisor_name: effectiveSupervisorName,
        proof_file_url: proofUrl,
        proof_file_name: proofFileName,
      });

      setSubmittedMinutesResult(calculatedMinutes);
      setSubmittedSuccess(true);
      await refreshUserData();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  // Render Post-Submission Confirmation Screen (Manual form)
  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-10 shadow-2xl text-center backdrop-blur-xl animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={34} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Solicitud enviada
          </h1>
          <p className="text-slate-300 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Tus horas fueron enviadas al equipo de staff y coordinadores para su debida revisión y validación.
          </p>

          {/* Submission Details Card */}
          <div className="my-6 p-4 rounded-2xl bg-[#0B192E] border border-[#16263D] text-left space-y-3">
            <div className="flex items-center justify-between border-b border-[#16263D]/60 pb-2.5">
              <span className="text-xs text-slate-400">Estado de la Solicitud:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                <Clock size={13} />
                <span>PENDIENTE</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Actividad:</span>
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">{activityName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Organización:</span>
              <span className="text-xs text-slate-200">{organizationName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Tiempo Solicitado:</span>
              <span className="text-sm font-bold text-[#258BFF] font-mono">
                {formatMinutes(submittedMinutesResult)}
              </span>
            </div>
          </div>

          {/* Critical Policy Banner */}
          <div className="p-3.5 rounded-xl bg-[#050A14] border border-blue-500/20 text-xs text-slate-400 flex items-start gap-2.5 text-left mb-6">
            <Info size={16} className="text-[#258BFF] shrink-0 mt-0.5" />
            <span>
              <strong>Nota de Seguridad:</strong> El voluntario no puede auto-aprobar horas. Tu total de horas aprobadas se actualizará automáticamente tan pronto el staff valide este registro.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onOpenMyHours}
              className="px-6 py-3 bg-[#1677FF] hover:bg-[#258BFF] text-white rounded-xl text-xs font-semibold shadow-lg shadow-[#1677FF]/20 transition-colors"
            >
              Ver en Mi Historial
            </button>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setActivityName('');
                setOrganizationName('');
                setDescription('');
                setSupervisorSelection('Brenda Lucero');
                setCustomSupervisorName('');
                setLocation('');
                setProofUrl('');
                setProofFileName('');
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              Registrar Otra Actividad
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 rounded-xl bg-[#07111F] border border-[#16263D] text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            title="Volver al panel"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Registro de Horas de Voluntariado</span>
              <Sparkles size={20} className="text-sky-400" />
            </h1>
            <p className="text-xs text-slate-400">
              Registra tus actividades de servicio comunitario completando el formulario o usando las plantillas guiadas
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-[#07111F] p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-[#1677FF] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 size={14} />
            <span>Formulario Directo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-[#1677FF] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Plantillas Rápidas DMPS</span>
          </button>
        </div>
      </div>

      {/* 1. Activity Presets Assistant Mode */}
      {activeTab === 'presets' && (
        <div className="space-y-6 animate-fadeIn">
          <ActivityPresetsAssistant
            currentActivityName={activityName}
            currentOrganizationName={organizationName}
            currentDescription={description}
            onApplyPreset={(presetData) => {
              setActivityName(presetData.activityName);
              if (presetData.organizationName && (!organizationName || organizationName.trim().length === 0)) {
                setOrganizationName(presetData.organizationName);
              }
              setDescription(presetData.description);
              setActiveTab('manual'); // Switch to manual form with populated values
            }}
          />
        </div>
      )}

      {/* 2. Manual Form Mode */}
      {activeTab === 'manual' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Duplicate Warning Alert */}
          {isDuplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-amber-300">Posible Registro Duplicado</h4>
                <p className="mt-0.5 text-amber-200/90">{isDuplicateWarning}</p>
                <p className="mt-1 text-[11px] text-amber-300/70">
                  Por favor revisa tu historial para evitar enviar dos veces la misma actividad.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Basic Information */}
            <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#16263D]/60 pb-3 mb-2">
                <Building size={18} className="text-[#258BFF]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  1. Datos de la Actividad y Organización
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nombre del Evento o Actividad *
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Ej. Jornada de Reforestación o Tutoría Escolar"
                  required
                  className="w-full px-4 py-3 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] focus:ring-1 focus:ring-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Organización donde realizó el voluntariado *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Ej. Des Moines Public Schools"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Fecha del Servicio *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Time and Automatic Calculation */}
            <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#16263D]/60 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#258BFF]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    2. Horario y Cálculo de Duración
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setUseDirectHours(!useDirectHours)}
                  className="text-xs text-[#258BFF] hover:underline font-medium"
                >
                  {useDirectHours ? 'Usar hora de inicio y fin' : 'Ingresar horas directamente'}
                </button>
              </div>

              {!useDirectHours ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Hora de Inicio *
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Hora de Finalización *
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Horas
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={directHours}
                      onChange={(e) => setDirectHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Minutos
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="5"
                      value={directMinutes}
                      onChange={(e) => setDirectMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Real-time Automatic Calculation Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B192E] to-[#16263D]/60 border border-[#1677FF]/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total a solicitar:</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {formatMinutes(calculatedMinutes)}
                  </span>
                </div>
                <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={13} /> Cálculo verificado
                </span>
              </div>
            </div>

            {/* Section 3: Supervisor & Verification */}
            <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#16263D]/60 pb-3 mb-2">
                <User size={18} className="text-[#258BFF]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  3. Supervisor y Ubicación
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Supervisor / Evaluador *
                  </label>
                  <select
                    value={supervisorSelection}
                    onChange={(e) => setSupervisorSelection(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                  >
                    <option value="Brenda Lucero">Brenda Lucero (DMPS Silver Cord)</option>
                    <option value="Coordinador de Evento DMPS">Coordinador de Evento DMPS</option>
                    <option value="Director Escolar">Director Escolar</option>
                    <option value="__CUSTOM__">Otro Supervisor (Escribir nombre)</option>
                  </select>
                </div>

                {supervisorSelection === '__CUSTOM__' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                      Nombre y Apellido del Supervisor *
                    </label>
                    <input
                      type="text"
                      value={customSupervisorName}
                      onChange={(e) => setCustomSupervisorName(e.target.value)}
                      placeholder="Ej. Prof. María González"
                      required
                      className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Ubicación o Dirección (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej. Gimnasio Central Campus"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Description & Proof */}
            <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#16263D]/60 pb-3 mb-2">
                <FileText size={18} className="text-[#258BFF]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  4. Descripción y Comprobante
                </h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Descripción Detallada de Actividades *
                </label>

                {/* Quick action chips */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                    Frase rápida:
                  </span>
                  {[
                    { label: 'Guía a familias', text: 'Apoyé orientando y guiando a las familias asistentes durante el evento.' },
                    { label: 'Traducción bilingüe', text: 'Brindé apoyo de interpretación y traducción español-inglés para facilitar la comunicación.' },
                    { label: 'Cuidado de niños', text: 'Supervisé y coordiné actividades recreativas seguras para los niños.' },
                    { label: 'Soporte tecnológico', text: 'Brindé asistencia técnica y apoyo en herramientas digitales a los asistentes.' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDescription((prev) => {
                          if (!prev.trim()) return chip.text;
                          return `${prev.trim()} ${chip.text}`;
                        });
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0B192E] border border-[#16263D] text-slate-300 hover:text-white hover:border-[#258BFF]/60 hover:bg-[#1677FF]/10 transition-all flex items-center gap-1"
                    >
                      <Plus size={11} className="text-[#258BFF]" />
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe de forma concisa tus labores y aportes comunitarios..."
                  required
                  className="w-full px-4 py-3 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white placeholder:text-slate-500 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Proof Upload (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Subir Comprobante o Imagen (Opcional)
                </label>
                {proofUrl ? (
                  <div className="p-3 bg-[#0B192E] border border-[#1677FF]/40 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        <img src={proofUrl} alt="Comprobante" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-white block truncate max-w-[200px]">
                          {proofFileName || 'Comprobante adjunto'}
                        </span>
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Listo para revisión
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProofUrl('');
                        setProofFileName('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-[#16263D] hover:border-[#1677FF]/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-[#0B192E]/40 hover:bg-[#0B192E] transition-all">
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <span className="text-xs font-medium text-slate-300">
                      Haz clic o arrastra una foto de asistencia o comprobante firmado
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG o PDF hasta 5MB</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-slate-400">
                Al enviar, tu solicitud quedará registrada en estado <strong className="text-amber-400">PENDIENTE</strong>.
              </span>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-2xl text-sm font-bold shadow-xl shadow-[#1677FF]/30 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar Horas para Revisión</span>
                    <CheckCircle2 size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
