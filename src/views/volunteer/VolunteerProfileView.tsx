import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api, formatMinutes } from '../../services/api';
import { Logo } from '../../components/Logo';
import { VolunteerRankShields } from '../../components/VolunteerRankShields';
import {
  Award,
  Phone,
  GraduationCap,
  Building,
  Globe,
  FileText,
  Mail,
  Calendar,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Shield,
  Clock,
  Sparkles,
  Crown,
  Medal,
} from 'lucide-react';

export const VolunteerProfileView: React.FC = () => {
  const { user, profile, stats, updateLocalProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [grade, setGrade] = useState(profile?.grade || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [languages, setLanguages] = useState<string[]>(
    profile?.languages && profile.languages.length > 0 ? profile.languages : ['Español']
  );
  const [newLang, setNewLang] = useState('');
  const [bio, setBio] = useState(profile?.bio || '');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()]);
      setNewLang('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !school.trim()) {
      setErrorMsg('El teléfono y la escuela son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.updateProfile({
        phone: phone.trim(),
        school: school.trim(),
        grade: grade.trim(),
        organization: organization.trim(),
        languages,
        bio: bio.trim(),
      });

      updateLocalProfile(res.profile);
      setIsEditing(false);
      setSuccessMsg('Perfil actualizado correctamente.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const initials = `${profile?.first_name?.[0] || 'V'}${profile?.last_name?.[0] || 'O'}`.toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
          <X size={16} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 160+ Hours Silver Cord Official Completion Banner */}
      {(stats?.approved_minutes || 0) >= 9600 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#171105] via-[#2A1E07] to-[#171105] border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] relative overflow-hidden animate-fadeIn">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
                  <Crown size={24} className="text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    Graduado Oficial Silver Cord
                  </span>
                  <span className="text-xs text-amber-400 font-bold hidden sm:inline">★ 160+ Horas Cumplidas</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                  Programa Silver Cord de Des Moines Public Schools Completado
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Has obtenido con honor el <strong>Cordón de Plata de Graduación</strong> y la máxima mención distrital. Sigue registrando horas para ampliar tu legado cívico.
                </p>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold text-center shrink-0">
              <div className="text-[10px] text-amber-400/80 uppercase font-semibold">Estado Oficial</div>
              <div>ACREDITADO PARA TOGA</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1677FF]/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1677FF] to-[#258BFF] flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-xl shadow-[#1677FF]/25 shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {profile?.first_name} {profile?.last_name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  ACTIVO
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-500" />
                <span>{profile?.email}</span>
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar size={13} className="text-slate-500" />
                <span>Miembro desde: {profile?.join_date ? new Date(profile.join_date).toLocaleDateString('es-ES') : '2026'}</span>
              </p>
            </div>
          </div>

          {/* Immutable ID Badge */}
          <div className="bg-[#0B192E] border border-[#1677FF]/40 rounded-2xl p-4 sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              ID Único de Voluntario
            </span>
            <div className="flex items-center sm:justify-end gap-1.5 text-lg font-mono font-extrabold text-[#258BFF] mt-0.5">
              <Award size={20} />
              <span>{profile?.volunteer_id}</span>
            </div>
            <span className="text-[9px] text-slate-500 block mt-0.5">
              Identificador Oficial Inmutable
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#16263D]">
          <div className="p-3 bg-[#0B192E]/60 rounded-xl border border-[#16263D]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Horas Aprobadas</span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
              {formatMinutes(stats?.approved_minutes || 0)}
            </span>
          </div>
          <div className="p-3 bg-[#0B192E]/60 rounded-xl border border-[#16263D]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Horas Pendientes</span>
            <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">
              {formatMinutes(stats?.pending_minutes || 0)}
            </span>
          </div>
          <div className="p-3 bg-[#0B192E]/60 rounded-xl border border-[#16263D]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Registros</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">
              {stats?.total_submissions || 0}
            </span>
          </div>
          <div className="p-3 bg-[#0B192E]/60 rounded-xl border border-[#16263D]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rol</span>
            <span className="text-sm font-bold text-[#258BFF] mt-0.5 block">
              VOLUNTARIO
            </span>
          </div>
        </div>
      </div>

      {/* Ranks, Tier Shields & Achievement Badges with Details */}
      <VolunteerRankShields
        approvedMinutes={stats?.approved_minutes || 0}
        totalSubmissions={stats?.total_submissions || 0}
        volunteerProfile={{
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          volunteer_id: profile?.volunteer_id,
          school: profile?.school,
          grade: profile?.grade,
          join_date: profile?.join_date,
          phone: profile?.phone,
          email: profile?.email,
        }}
      />

      {/* Information Form / Display */}
      <div className="bg-[#07111F] border border-[#16263D] rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#16263D] pb-4 mb-6">
          <h2 className="text-base font-bold text-white">Información Personal y Académica</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#0B192E] hover:bg-slate-800 border border-[#16263D] text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 size={14} className="text-[#258BFF]" />
              <span>Editar Información</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-[#0B192E]/50 border border-[#16263D]">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Phone size={14} className="text-[#258BFF]" />
                  Teléfono de Contacto
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  {profile?.phone || 'No especificado'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B192E]/50 border border-[#16263D]">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-[#258BFF]" />
                  Escuela / Colegio
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  {profile?.school || 'No especificada'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B192E]/50 border border-[#16263D]">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-[#258BFF]" />
                  Grado Escolar
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  {profile?.grade || 'No especificado'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B192E]/50 border border-[#16263D]">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <Building size={14} className="text-[#258BFF]" />
                  Organización o Club
                </span>
                <p className="text-sm font-semibold text-white mt-1">
                  {profile?.organization || 'Sin organización fija'}
                </p>
              </div>
            </div>

            {/* Languages */}
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                <Globe size={14} className="text-[#258BFF]" />
                Idiomas
              </span>
              <div className="flex flex-wrap gap-2">
                {profile?.languages && profile.languages.length > 0 ? (
                  profile.languages.map((l) => (
                    <span
                      key={l}
                      className="px-3 py-1 bg-[#1677FF]/15 border border-[#1677FF]/30 text-[#258BFF] rounded-full text-xs font-semibold"
                    >
                      {l}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Español</span>
                )}
              </div>
            </div>

            {/* Bio */}
            <div>
              <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                <FileText size={14} className="text-[#258BFF]" />
                Biografía / Intereses
              </span>
              <p className="text-xs sm:text-sm text-slate-300 bg-[#0B192E]/40 border border-[#16263D] rounded-2xl p-4 leading-relaxed">
                {profile?.bio || 'Sin biografía especificada.'}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Escuela *
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Grado Escolar
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Organización o Club
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Idiomas
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1677FF]/20 border border-[#1677FF]/40 text-[#258BFF] rounded-full text-xs font-semibold"
                  >
                    <span>{l}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(l)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  placeholder="Agregar idioma"
                  className="flex-1 px-4 py-2 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium"
                >
                  Agregar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Biografía
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-[#0B192E] border border-[#16263D] focus:border-[#258BFF] rounded-xl text-sm text-white outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#1677FF] hover:bg-[#258BFF] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#1677FF]/25 flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security and Privacy statement */}
      <div className="p-4 rounded-2xl bg-[#050A14] border border-[#16263D] flex items-center gap-3 text-xs text-slate-400">
        <Shield size={18} className="text-[#258BFF] shrink-0" />
        <span>
          <strong>Privacidad Protegida:</strong> Tu perfil y datos personales son privados y solo son visibles para ti y para los coordinadores de staff autorizados para la validación de horas.
        </span>
      </div>
    </div>
  );
};
