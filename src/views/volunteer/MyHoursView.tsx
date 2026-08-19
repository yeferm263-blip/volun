import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import { HourSubmission } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  History,
  Search,
  Filter,
  PlusCircle,
  Clock,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  FileDown,
  ArrowUpDown,
  Trash2,
  GraduationCap,
} from 'lucide-react';

interface MyHoursViewProps {
  onNavigate: (view: string) => void;
  onOpenSubmissionDetails: (id: string) => void;
  onOpenCorrection: (id: string) => void;
}

export const MyHoursView: React.FC<MyHoursViewProps> = ({
  onNavigate,
  onOpenSubmissionDetails,
  onOpenCorrection,
}) => {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<HourSubmission[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getMySubmissions(activeFilter, searchQuery);
      setSubmissions(data.submissions);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('¿Deseas eliminar este registro de tu bitácora?')) return;
    try {
      await api.deleteSubmission(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el registro.');
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeFilter, searchQuery]);

  const filterTabs = [
    { id: 'ALL', label: 'Todas' },
    { id: 'PENDING', label: 'Pendientes' },
    { id: 'APPROVED', label: 'Aprobadas' },
    { id: 'NEEDS_CORRECTION', label: 'Necesitan Corrección' },
    { id: 'REJECTED', label: 'Rechazadas' },
  ];

  // Export summary report as text/html printable
  const handleExportReport = () => {
    const approved = submissions.filter((s) => s.status === 'APPROVED');
    const totalMinutes = approved.reduce(
      (acc, s) => acc + (s.approved_minutes ?? s.submitted_minutes ?? 0),
      0
    );

    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;

    reportWindow.document.write(`
      <html>
        <head>
          <title>Constancia de Horas de Voluntariado - ${profile?.first_name} ${profile?.last_name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #0f172a; margin-bottom: 4px; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; }
            .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0284c7; border-radius: 9999px; font-weight: bold; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #cbd5e1; font-size: 13px; }
            th { background: #f8fafc; font-weight: bold; }
            .total-box { margin-top: 30px; padding: 16px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; font-size: 16px; font-weight: bold; color: #166534; }
            .footer { margin-top: 40px; font-size: 11px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte Oficial de Horas Comunitarias</h1>
            <p><strong>Voluntario:</strong> ${profile?.first_name} ${profile?.last_name} | <strong>ID:</strong> ${profile?.volunteer_id} | <strong>Escuela:</strong> ${profile?.school || 'N/A'}</p>
            <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>

          <h3>Detalle de Actividades Aprobadas</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Actividad</th>
                <th>Organización</th>
                <th>Supervisor</th>
                <th>Aprobado Por</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              ${approved
                .map(
                  (a) => `
                <tr>
                  <td>${a.date}</td>
                  <td><strong>${a.activity_name}</strong></td>
                  <td>${a.organization_name}</td>
                  <td>${a.supervisor_name}</td>
                  <td>${a.reviewed_by || 'Staff'}</td>
                  <td><strong>${formatMinutes(a.approved_minutes ?? a.submitted_minutes)}</strong></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="total-box">
            Total de Horas Oficialmente Aprobadas: ${formatMinutes(totalMinutes)} (${totalMinutes} minutos)
          </div>

          <div class="footer">
            Documento emitido por el Portal de Horas de Voluntariado. Válido para constancias comunitarias y escolares.
          </div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Mi Historial de Horas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1677FF]/20 text-[#258BFF] text-xs font-bold font-mono">
              {submissions.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Consulta el estado detallado de todas tus actividades registradas
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-[#0B192E] border border-[#16263D] hover:border-[#1677FF]/50 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <FileDown size={16} className="text-[#258BFF]" />
            <span className="hidden sm:inline">Exportar Reporte</span>
            <span className="sm:hidden">Exportar</span>
          </button>

          <button
            onClick={() => onNavigate('submit-hours')}
            className="px-4 py-2.5 bg-gradient-to-r from-[#1677FF] to-[#258BFF] hover:from-[#1366dc] hover:to-[#1e78e0] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#1677FF]/20 flex items-center gap-2 transition-all"
          >
            <PlusCircle size={16} />
            <span>Registrar Horas</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por actividad, organización o descripción..."
            className="w-full pl-10 pr-4 py-2 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-xs text-white placeholder:text-slate-500 outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#1677FF] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-12 text-center text-slate-400 shadow-xl">
          <History size={48} className="mx-auto mb-3 opacity-25 text-slate-500" />
          <h3 className="text-base font-bold text-slate-200">
            No se encontraron registros de horas
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || activeFilter !== 'ALL'
              ? 'Prueba modificando tus filtros o términos de búsqueda.'
              : 'Empieza registrando tu primera actividad comunitaria.'}
          </p>
          <button
            onClick={() => onNavigate('submit-hours')}
            className="mt-4 px-5 py-2.5 bg-[#1677FF] hover:bg-[#258BFF] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-lg"
          >
            <PlusCircle size={16} />
            <span>Registrar Nuevas Horas</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const isApproved = sub.status === 'APPROVED';
            const durationMin = isApproved && sub.approved_minutes ? sub.approved_minutes : sub.submitted_minutes;

            return (
              <div
                key={sub.id}
                className="bg-[#07111F] border border-[#16263D] hover:border-[#1677FF]/40 rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                      {sub.activity_name}
                    </h3>
                    <StatusBadge status={sub.status} size="sm" />
                    {sub.source === 'INFINITE_CAMPUS' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        <GraduationCap size={12} />
                        <span>Silver Cord • Infinite Campus</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Building size={13} className="text-slate-500" />
                      <strong className="text-slate-300 font-medium">{sub.organization_name}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-500" />
                      <span>{sub.date}</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[#258BFF] font-semibold">
                      <Clock size={13} />
                      <span>{formatMinutes(durationMin)}</span>
                    </span>
                  </div>

                  {/* Staff feedback previews */}
                  {sub.status === 'NEEDS_CORRECTION' && sub.staff_message && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-orange-400" />
                      <div>
                        <strong>Mensaje del Staff:</strong> {sub.staff_message}
                      </div>
                    </div>
                  )}

                  {sub.status === 'REJECTED' && sub.rejection_reason && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                      <strong>Motivo de rechazo:</strong> {sub.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#16263D]">
                  {sub.status === 'NEEDS_CORRECTION' ? (
                    <button
                      onClick={() => onOpenCorrection(sub.id)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
                    >
                      <span>Corregir Registro</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenSubmissionDetails(sub.id)}
                        className="px-4 py-2 bg-[#0B192E] hover:bg-slate-800 border border-[#16263D] text-slate-200 hover:text-white rounded-xl text-xs font-medium transition-colors"
                      >
                        Ver Detalles
                      </button>
                      {(sub.status === 'REJECTED' || sub.status === 'CANCELLED') && (
                        <button
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                          title="Eliminar de la bitácora"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
