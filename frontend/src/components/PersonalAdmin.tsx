import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Cobrador, Instructor, personalApi } from '../api/personal.api';

type PersonalTab = 'cobradores' | 'instructores';
type PersonalRecord = Cobrador | Instructor;

export const PersonalAdmin: React.FC = () => {
  const { showToast, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<PersonalTab>('cobradores');
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [instructores, setInstructores] = useState<Instructor[]>([]);
  const [editing, setEditing] = useState<PersonalRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', zona: 1, comisionPorcentaje: 10, sueldo: '', passwordInicial: '' });

  const load = async () => {
    try {
      const [loadedCobradores, loadedInstructores] = await Promise.all([
        personalApi.cobradores.getAll(),
        personalApi.instructores.getAll(),
      ]);
      setCobradores(loadedCobradores);
      setInstructores(loadedInstructores);
    } catch (error) {
      showToast('error', 'No se pudo cargar el personal', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', apellido: '', email: '', telefono: '', zona: 1, comisionPorcentaje: 10, sueldo: '', passwordInicial: '' });
    setModalOpen(true);
  };

  const openEdit = (person: PersonalRecord) => {
    setEditing(person);
    setForm({
      nombre: person.nombre,
      apellido: person.apellido,
      email: 'correo' in person ? person.correo : person.email,
      telefono: 'telefono' in person ? person.telefono || '' : '',
      zona: 'zona' in person ? person.zona : 1,
      comisionPorcentaje: 'comisionPorcentaje' in person ? Number(person.comisionPorcentaje) : 10,
      sueldo: 'sueldo' in person && person.sueldo !== null ? String(person.sueldo) : '',
      passwordInicial: '',
    });
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentUser.role !== 'ADMIN') return;
    if (!editing && form.passwordInicial.length < 8) {
      showToast('error', 'Contraseña insuficiente', 'La contraseña inicial debe tener al menos 8 caracteres.');
      return;
    }
    if (editing && !editing.user && form.passwordInicial.length < 8) {
      showToast('error', 'Falta crear el acceso', 'Definí una contraseña inicial de al menos 8 caracteres para este perfil.');
      return;
    }
    setSaving(true);
    try {
      if (activeTab === 'cobradores') {
        const payload = {
          nombre: form.nombre.trim(), apellido: form.apellido.trim(), correo: form.email.trim(), zona: Number(form.zona),
          comisionPorcentaje: Number(form.comisionPorcentaje), ...(form.passwordInicial ? { passwordInicial: form.passwordInicial } : {}),
        };
        if (editing) await personalApi.cobradores.update(editing.id, payload);
        else await personalApi.cobradores.create(payload);
      } else {
        const payload = {
          nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim(), telefono: form.telefono.trim() || undefined,
          sueldo: form.sueldo === '' ? undefined : Number(form.sueldo), ...(form.passwordInicial ? { passwordInicial: form.passwordInicial } : {}),
        };
        if (editing) await personalApi.instructores.update(editing.id, payload);
        else await personalApi.instructores.create(payload);
      }
      showToast('success', editing ? 'Perfil actualizado' : 'Personal creado', form.passwordInicial ? 'Perfil y cuenta de acceso guardados.' : 'Perfil guardado.');
      setModalOpen(false);
      await load();
    } catch (error) {
      showToast('error', 'No se pudo guardar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (person: PersonalRecord) => {
    if (!window.confirm(`¿Eliminar el perfil de ${person.nombre} ${person.apellido}? La cuenta de acceso vinculada también será eliminada.`)) return;
    try {
      if ('zona' in person) await personalApi.cobradores.delete(person.id);
      else await personalApi.instructores.delete(person.id);
      showToast('info', 'Perfil eliminado', 'Se eliminó el perfil y su cuenta asociada.');
      await load();
    } catch (error) {
      showToast('error', 'No se pudo eliminar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  const records: PersonalRecord[] = activeTab === 'cobradores' ? cobradores : instructores;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-300 pb-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-[#C53030]"><BriefcaseBusiness className="h-4 w-4" /> Administración</div>
          <h1 className="text-2xl font-black text-[#1A365D]">Personal del club</h1>
          <p className="mt-1 text-xs text-slate-600">Perfiles y cuentas de acceso vinculadas.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded bg-[#1A365D] px-3 py-2 text-xs font-bold text-white hover:bg-[#2B6CB0]"><Plus className="h-4 w-4" /> Agregar {activeTab === 'cobradores' ? 'cobrador' : 'instructor'}</button>
      </header>

      <div className="flex gap-2 border-b border-slate-200">
        <button onClick={() => setActiveTab('cobradores')} className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold ${activeTab === 'cobradores' ? 'border-[#C53030] text-[#1A365D]' : 'border-transparent text-slate-500'}`}><Users className="h-4 w-4" /> Cobradores ({cobradores.length})</button>
        <button onClick={() => setActiveTab('instructores')} className={`inline-flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-bold ${activeTab === 'instructores' ? 'border-[#C53030] text-[#1A365D]' : 'border-transparent text-slate-500'}`}><BriefcaseBusiness className="h-4 w-4" /> Instructores ({instructores.length})</button>
      </div>

      <div className="overflow-x-auto bg-white">
        {loading ? <p className="p-8 text-center text-xs text-slate-500">Cargando personal…</p> : (
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">
              <tr><th className="p-3">Nombre</th><th className="p-3">Correo</th><th className="p-3">{activeTab === 'cobradores' ? 'Zona' : 'Teléfono'}</th><th className="p-3">{activeTab === 'cobradores' ? 'Comisión' : 'Sueldo'}</th><th className="p-3 text-right">Acciones</th></tr>
            </thead>
            <tbody>
              {records.map((person) => (
                <tr key={person.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-800">{person.nombre} {person.apellido}</td>
                  <td className="p-3 text-slate-600">{'correo' in person ? person.correo : person.email}<span className={`ml-2 text-[10px] font-semibold ${person.user?.activo ? 'text-emerald-700' : 'text-amber-700'}`}>{person.user?.activo ? 'Acceso activo' : 'Sin acceso'}</span></td>
                  <td className="p-3 text-slate-600">{'zona' in person ? `Zona ${person.zona}` : person.telefono || '—'}</td>
                  <td className="p-3 text-slate-600">{'zona' in person ? `${person.comisionPorcentaje}%` : person.sueldo == null ? '—' : `$${Number(person.sueldo).toLocaleString('es-AR')}`}</td>
                  <td className="p-3"><div className="flex justify-end gap-2"><button onClick={() => openEdit(person)} title="Editar" className="rounded border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => void remove(person)} title="Eliminar" className="rounded border border-red-200 p-1.5 text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay perfiles registrados.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-300 bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b-2 border-[#C53030] bg-[#1A365D] px-5 py-3 text-sm font-bold text-white"><span>{editing ? 'Editar' : 'Nuevo'} {activeTab === 'cobradores' ? 'cobrador' : 'instructor'}</span><button onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button></header>
            <form onSubmit={save} className="grid grid-cols-1 gap-3 p-5 text-xs sm:grid-cols-2">
              <label><span className="mb-1 block font-semibold">Nombre</span><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label><span className="mb-1 block font-semibold">Apellido</span><input required value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="sm:col-span-2"><span className="mb-1 block font-semibold">Correo de acceso</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>
              {(!editing || !editing.user) && <label className="sm:col-span-2"><span className="mb-1 block font-semibold">Contraseña inicial (mínimo 8 caracteres)</span><input required={!editing || !editing.user} type="password" minLength={8} autoComplete="new-password" value={form.passwordInicial} onChange={(e) => setForm({ ...form, passwordInicial: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>}
              {editing?.user && <label className="sm:col-span-2"><span className="mb-1 block font-semibold">Restablecer contraseña (opcional)</span><input type="password" minLength={8} autoComplete="new-password" value={form.passwordInicial} onChange={(e) => setForm({ ...form, passwordInicial: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>}
              {activeTab === 'cobradores' ? <>
                <label><span className="mb-1 block font-semibold">Zona</span><select value={form.zona} onChange={(e) => setForm({ ...form, zona: Number(e.target.value) })} className="w-full rounded border border-slate-300 bg-white px-3 py-2"><option value={1}>Zona 1</option><option value={2}>Zona 2</option><option value={3}>Zona 3</option></select></label>
                <label><span className="mb-1 block font-semibold">Comisión (%)</span><input type="number" min="0" max="100" step="0.01" value={form.comisionPorcentaje} onChange={(e) => setForm({ ...form, comisionPorcentaje: Number(e.target.value) })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>
              </> : <>
                <label><span className="mb-1 block font-semibold">Teléfono</span><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>
                <label><span className="mb-1 block font-semibold">Sueldo</span><input type="number" min="0" step="0.01" value={form.sueldo} onChange={(e) => setForm({ ...form, sueldo: e.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" /></label>
              </>}
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 sm:col-span-2"><button type="button" onClick={() => setModalOpen(false)} className="rounded border border-slate-300 px-4 py-2 font-semibold">Cancelar</button><button disabled={saving} type="submit" className="rounded bg-[#1A365D] px-4 py-2 font-bold text-white disabled:opacity-60">{saving ? 'Guardando…' : 'Guardar'}</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
};
