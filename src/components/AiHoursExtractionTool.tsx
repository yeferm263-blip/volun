import React, { useState } from 'react';
import { api, formatMinutes } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  Clock,
  Calendar,
  Building,
  User,
  MapPin,
  FileText,
  Trash2,
  Plus,
  Send,
  AlertTriangle,
  RotateCcw,
  Edit3,
  Check,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export interface ExtractedHourItem {
  id: string;
  activity_name: string;
  category: string;
  organization_name: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  minutes: number;
  submitted_minutes: number;
  supervisor_name: string;
  supervisor_email?: string;
  location?: string;
  description: string;
  confidence_score: number;
  reasoning?: string;
}

interface AiHoursExtractionToolProps {
  onBatchSubmittedSuccess?: (count: number, totalMinutes: number) => void;
  onNavigateToMyHours?: () => void;
}

const CATEGORY_OPTIONS = [
  'Guía y Orientación a Familias',
  'Traducción e Interpretación Bilingüe',
  'Cuidado y Recreación de Niños',
  'Soporte Tecnológico',
];

const EXAMPLE_PROMPTS = [
  {
    title: 'Semana Variada en Escuela',
    text: 'La semana pasada el martes ayudé 3 horas en Central Campus guiando a familias en el registro escolar con la supervisora Brenda Lucero. El jueves hice 2 horas y media en la biblioteca de East High traduciendo documentos del inglés al español con el profesor Gómez, y el sábado 4 horas en el banco de alimentos empacando despensas para la comunidad escolar.',
  },
  {
    title: 'Jornada de Feria Escolar y Cuidado Infantil',
    text: 'Ayer estuve en Lincoln High School desde las 9:00 AM hasta la 1:30 PM apoyando en la feria familiar: cuidé a niños con actividades de pintura y lectura por 3 horas, y la última hora y media ayudé con el equipo de sonido y computadoras del auditorio bajo la supervisión de Brenda Lucero.',
  },
  {
    title: 'Tutoría y Soporte Digital',
    text: 'El lunes 15 de marzo dediqué 2 horas en Roosevelt High School configurando tabletas y plataformas digitales para estudiantes de primer ingreso con la coordinadora Brenda Lucero.',
  },
];

export const AiHoursExtractionTool: React.FC<AiHoursExtractionToolProps> = ({
  onBatchSubmittedSuccess,
  onNavigateToMyHours,
}) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedEntries, setExtractedEntries] = useState<ExtractedHourItem[]>([]);
  const [aiSource, setAiSource] = useState<string>('');
  const [submittedResult, setSubmittedResult] = useState<{
    count: number;
    total_minutes: number;
  } | null>(null);

  const handleExtract = async () => {
    if (!rawText.trim() || rawText.trim().length < 10) {
      setError('Por favor escribe un texto con al menos 10 caracteres describiendo tus actividades y horas.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setSubmittedResult(null);

    try {
      const res = await api.extractHoursAI(rawText.trim());
      if (res.success && Array.isArray(res.entries) && res.entries.length > 0) {
        setExtractedEntries(res.entries);
        setAiSource(res.source || 'gemini-3.7-flash');
      } else {
        setError(res.message || 'No se pudieron identificar horas en el texto. Intenta ser más específico.');
      }
    } catch (err: any) {
      console.error('Error in AI extraction:', err);
      setError(err.message || 'Ocurrió un error al procesar el texto con la IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateEntry = (id: string, field: keyof ExtractedHourItem, value: any) => {
    setExtractedEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updated = { ...entry, [field]: value };

        // Recalculate submitted_minutes if hours or minutes change
        if (field === 'hours' || field === 'minutes') {
          const h = field === 'hours' ? Math.max(0, parseInt(value, 10) || 0) : entry.hours;
          const m = field === 'minutes' ? Math.max(0, parseInt(value, 10) || 0) : entry.minutes;
          updated.hours = h;
          updated.minutes = m;
          updated.submitted_minutes = h * 60 + m;
        }

        return updated;
      })
    );
  };

  const handleDeleteEntry = (id: string) => {
    setExtractedEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddBlankEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: ExtractedHourItem = {
      id: `manual_entry_${Date.now()}`,
      activity_name: 'Nueva Actividad de Voluntariado',
      category: 'Guía y Orientación a Familias',
      organization_name: 'Des Moines Public Schools',
      date: today,
      start_time: '09:00',
      end_time: '11:00',
      hours: 2,
      minutes: 0,
      submitted_minutes: 120,
      supervisor_name: 'Brenda Lucero (DMPS Silver Cord)',
      location: 'Des Moines, IA',
      description: 'Apoyo en actividades escolares de servicio voluntario.',
      confidence_score: 100,
      reasoning: 'Comprobante añadido manualmente.',
    };
    setExtractedEntries((prev) => [...prev, newEntry]);
  };

  const handleBatchSubmit = async () => {
    if (extractedEntries.length === 0) {
      setError('No hay comprobantes para enviar.');
      return;
    }

    // Validate that required fields are present
    for (let i = 0; i < extractedEntries.length; i++) {
      const e = extractedEntries[i];
      if (!e.activity_name.trim() || !e.organization_name.trim() || !e.date || !e.supervisor_name.trim()) {
        setError(`El comprobante #${i + 1} tiene campos obligatorios vacíos (actividad, escuela, fecha o supervisor).`);
        return;
      }
      if (e.submitted_minutes <= 0) {
        setError(`El comprobante #${i + 1} (${e.activity_name}) debe tener una duración mayor a 0 minutos.`);
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await api.submitBatchHours(extractedEntries);
      if (res.success) {
        setSubmittedResult({
          count: res.count,
          total_minutes: res.total_minutes,
        });
        setExtractedEntries([]);
        setRawText('');

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (onBatchSubmittedSuccess) {
          onBatchSubmittedSuccess(res.count, res.total_minutes);
        }
      } else {
        setError(res.message || 'Error al enviar los comprobantes al administrador.');
      }
    } catch (err: any) {
      console.error('Batch submit error:', err);
      setError(err.message || 'Error al enviar los comprobantes al administrador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAccumulatedMinutes = extractedEntries.reduce((acc, curr) => acc + (curr.submitted_minutes || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Identity */}
      <div className="bg-gradient-to-r from-blue-950/60 via-[#07111F] to-indigo-950/60 border border-sky-500/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Generador de Horas & Comprobantes con Inteligencia Artificial</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Escribe tu texto libre y la IA generará tus comprobantes
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Redacta o pega tus notas, diario semanal o apuntes en lenguaje natural. Nuestro motor de IA (Gemini 3.7 Flash)
            analizará tu relato, separará cada actividad por día y horario, asignará la categoría oficial y generará los
            comprobantes listos para que los verifiques, edites si es necesario y los mandes al administrador para su
            aprobación oficial.
          </p>
        </div>
      </div>

      {/* Success Notification if Batch was Submitted */}
      {submittedResult && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={28} />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 block">
                ¡Envío Exitoso al Administrador!
              </span>
              <h3 className="text-lg font-bold text-white">
                Se enviaron {submittedResult.count} {submittedResult.count === 1 ? 'comprobante' : 'comprobantes'} (
                {formatMinutes(submittedResult.total_minutes)}) para aprobación
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                El coordinador de staff de DMPS Silver Cord revisará cada actividad y acreditará tus horas en tu bitácora
                oficial. Puedes seguir el estado en tiempo real en tu historial de horas.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onNavigateToMyHours && (
              <button
                onClick={onNavigateToMyHours}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <span>Ver en Mi Historial de Horas</span>
                <ArrowRight size={14} />
              </button>
            )}
            <button
              onClick={() => setSubmittedResult(null)}
              className="px-4 py-2.5 rounded-xl bg-[#0B192E] hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10 transition-colors"
            >
              Procesar más texto libre
            </button>
          </div>
        </div>
      )}

      {/* Free Text Input Studio */}
      <div className="bg-[#07111F] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-sky-400" />
            <span>Pega o escribe tu relato de actividades</span>
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {rawText.length} caracteres
          </span>
        </div>

        <div className="relative">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isProcessing}
            rows={6}
            placeholder="Ejemplo: 'La semana pasada apoyé 3 horas el martes en East High ayudando en el registro de familias con Brenda Lucero, y el jueves 2 horas en Central Campus traduciendo folletos del inglés al español...'"
            className="w-full px-4 py-3.5 bg-[#0B192E] border border-white/10 focus:border-sky-500/60 rounded-2xl text-sm text-white placeholder-slate-500 outline-none transition-colors resize-y leading-relaxed font-sans"
          />
        </div>

        {/* Quick Example Presets */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <HelpCircle size={13} className="text-sky-400" />
            <span>¿No sabes cómo empezar? Prueba con uno de estos ejemplos:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawText(prompt.text)}
                className="px-3 py-1.5 rounded-xl bg-[#0B192E] hover:bg-sky-950/40 text-slate-300 hover:text-sky-300 border border-white/10 hover:border-sky-500/30 text-xs transition-all text-left truncate max-w-xs"
                title={prompt.text}
              >
                ✨ {prompt.title}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
            <AlertTriangle size={18} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            💡 Puedes escribir actividades de varios días o semanas en un solo texto.
          </div>

          <button
            type="button"
            onClick={handleExtract}
            disabled={isProcessing || !rawText.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>La IA está analizando y separando tus horas...</span>
              </>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Generar y Separar Comprobantes con IA</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Comprobantes Review Studio */}
      {extractedEntries.length > 0 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Bar */}
          <div className="bg-[#07111F] border border-sky-500/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1">
                  <Check size={12} /> {extractedEntries.length} {extractedEntries.length === 1 ? 'Comprobante' : 'Comprobantes'} Generados
                </span>
                <span className="text-xs text-slate-400">
                  Total: <strong className="text-white font-bold">{formatMinutes(totalAccumulatedMinutes)}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Revisa y edita tus comprobantes antes de enviarlos
              </h3>
              <p className="text-xs text-slate-400">
                Puedes ajustar cualquier campo, corregir horas, cambiar la categoría o agregar nuevas actividades antes de mandarlas al administrador.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleAddBlankEntry}
                className="px-3.5 py-2 rounded-xl bg-[#0B192E] hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} className="text-sky-400" />
                <span>Agregar Otra Ficha</span>
              </button>

              <button
                type="button"
                onClick={handleBatchSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Enviando al Admin...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Mandar Todos al Admin para Aprobación</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {extractedEntries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-[#07111F] border border-white/10 hover:border-sky-500/40 rounded-3xl p-5 sm:p-7 space-y-5 transition-all shadow-xl relative overflow-hidden group"
              >
                {/* Number Badge & Delete Action */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-white">Comprobante de Actividad</span>
                    {entry.confidence_score && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                        IA Confianza: {entry.confidence_score}%
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Eliminar este comprobante"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Editable Form Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Activity Name */}
                  <div className="lg:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Título de la Actividad *
                    </label>
                    <input
                      type="text"
                      value={entry.activity_name}
                      onChange={(e) => handleUpdateEntry(entry.id, 'activity_name', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Categoría Oficial *
                    </label>
                    <select
                      value={entry.category}
                      onChange={(e) => handleUpdateEntry(entry.id, 'category', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* School / Org */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Escuela u Organización *
                    </label>
                    <input
                      type="text"
                      value={entry.organization_name}
                      onChange={(e) => handleUpdateEntry(entry.id, 'organization_name', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Fecha de la Actividad *
                    </label>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => handleUpdateEntry(entry.id, 'date', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none"
                    />
                  </div>

                  {/* Duration (Hours & Minutes) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Duración ({formatMinutes(entry.submitted_minutes)}) *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1 bg-[#0B192E] border border-white/10 rounded-xl px-2.5 py-2">
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={entry.hours}
                          onChange={(e) => handleUpdateEntry(entry.id, 'hours', e.target.value)}
                          className="w-full bg-transparent text-white text-xs sm:text-sm outline-none text-center font-bold"
                        />
                        <span className="text-slate-400 text-xs font-semibold">hrs</span>
                      </div>
                      <div className="flex-1 flex items-center gap-1 bg-[#0B192E] border border-white/10 rounded-xl px-2.5 py-2">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          step="5"
                          value={entry.minutes}
                          onChange={(e) => handleUpdateEntry(entry.id, 'minutes', e.target.value)}
                          className="w-full bg-transparent text-white text-xs sm:text-sm outline-none text-center font-bold"
                        />
                        <span className="text-slate-400 text-xs font-semibold">min</span>
                      </div>
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Supervisor / Evaluador *
                    </label>
                    <input
                      type="text"
                      value={entry.supervisor_name}
                      onChange={(e) => handleUpdateEntry(entry.id, 'supervisor_name', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Ubicación / Sede
                    </label>
                    <input
                      type="text"
                      value={entry.location || ''}
                      onChange={(e) => handleUpdateEntry(entry.id, 'location', e.target.value)}
                      placeholder="Ej: Auditorio Central, Cafetería"
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Descripción del Trabajo y Tareas Realizadas *
                    </label>
                    <textarea
                      rows={2}
                      value={entry.description}
                      onChange={(e) => handleUpdateEntry(entry.id, 'description', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B192E] border border-white/10 focus:border-sky-500 rounded-xl text-xs sm:text-sm text-white outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* AI Reasoning note */}
                {entry.reasoning && (
                  <div className="pt-2 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                    <Sparkles size={12} className="text-sky-400 shrink-0" />
                    <span>IA: {entry.reasoning}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Send CTA bar */}
          <div className="p-6 bg-gradient-to-r from-blue-950/80 via-[#07111F] to-emerald-950/80 border border-emerald-500/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  ¿Todo listo con tus {extractedEntries.length} comprobantes?
                </p>
                <p className="text-xs text-slate-300">
                  Al enviarlos se registrarán con estado PENDIENTE para que los apruebe el administrador del distrito.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBatchSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Enviando al Administrador...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Enviar Todos al Administrador</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
