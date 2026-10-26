import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Actividad } from '../types';
import { Instructor, personalApi } from '../api/personal.api';

type Turno = 'MATUTINO' | 'VESPERTINO' | 'NOCTURNO';

interface ActividadPayload {
  nombre: string;
  descripcion?: string;
  arancel: number;
  turno: Turno;
  diasSemana?: string;
  horaInicio?: string;
  horaFin?: string;
  cupoMaximo?: number;
  instructorId?: number;
}

interface ActividadFormModalProps {
  actividad: Actividad | null;
  onClose: () => void;
  onSave: (payload: ActividadPayload) => Promise<boolean>;
}

const emptyForm: ActividadPayload = {
  nombre: '',
  descripcion: '',
  arancel: 0,
  turno: 'VESPERTINO',
  diasSemana: '',
  horaInicio: '18:00',
  horaFin: '19:00',
  cupoMaximo: 25,
};

export const ActividadFormModal: React.FC<ActividadFormModalProps> = ({ actividad, onClose, onSave }) => {
  const [form, setForm] = useState<ActividadPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [instructores, setInstructores] = useState<Instructor[]>([]);

  useEffect(() => {
    personalApi.instructores.getAll().then(setInstructores).catch(() => setInstructores([]));
  }, []);

  useEffect(() => {
    if (!actividad) {
      setForm(emptyForm);
      return;
    }
    const [horaInicio = '18:00', horaFin = '19:00'] = actividad.horario.split(' - ');
    const turno = ['MATUTINO', 'VESPERTINO', 'NOCTURNO'].includes(actividad.categoria)
      ? actividad.categoria as Turno
      : 'VESPERTINO';
    setForm({
      nombre: actividad.nombre,
      descripcion: actividad.descripcion,
      arancel: actividad.costoMensual,
      turno,
      diasSemana: actividad.dias.join(', '),
      horaInicio,
      horaFin,
      cupoMaximo: actividad.cupoMaximo,
      instructorId: actividad.instructorId ? Number(actividad.instructorId) : undefined,
    });
  }, [actividad]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (await onSave({
        ...form,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion?.trim() || undefined,
        arancel: Number(form.arancel),
        cupoMaximo: Number(form.cupoMaximo),
      })) onClose();
    } finally {
      setSaving(false);
    }
  };

  const change = <K extends keyof ActividadPayload>(key: K, value: ActividadPayload[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section className="w-full max-w-xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b-2 border-[#C53030] bg-[#1A365D] px-5 py-3 text-white">
          <h2 className="text-sm font-bold">{actividad ? 'Editar actividad' : 'Nueva actividad'}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1 text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 text-xs sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block font-semibold text-slate-700">Nombre</span>
            <input required maxLength={120} value={form.nombre} onChange={(event) => change('nombre', event.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block font-semibold text-slate-700">Descripción</span>
            <textarea value={form.descripcion} onChange={(event) => change('descripcion', event.target.value)} rows={3} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block font-semibold text-slate-700">Arancel mensual</span>
            <input required type="number" min="0" step="0.01" value={form.arancel} onChange={(event) => change('arancel', Number(event.target.value))} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block font-semibold text-slate-700">Turno</span>
            <select value={form.turno} onChange={(event) => change('turno', event.target.value as Turno)} className="w-full rounded border border-slate-300 bg-white px-3 py-2">
              <option value="MATUTINO">Matutino</option>
              <option value="VESPERTINO">Vespertino</option>
              <option value="NOCTURNO">Nocturno</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-1 block font-semibold text-slate-700">Días (separados por coma)</span>
            <input value={form.diasSemana} onChange={(event) => change('diasSemana', event.target.value)} placeholder="Lunes, Miércoles, Viernes" className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block font-semibold text-slate-700">Hora de inicio</span>
            <input type="time" value={form.horaInicio} onChange={(event) => change('horaInicio', event.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block font-semibold text-slate-700">Hora de fin</span>
            <input type="time" value={form.horaFin} onChange={(event) => change('horaFin', event.target.value)} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block font-semibold text-slate-700">Cupo máximo</span>
            <input required type="number" min="1" step="1" value={form.cupoMaximo} onChange={(event) => change('cupoMaximo', Number(event.target.value))} className="w-full rounded border border-slate-300 px-3 py-2" />
          </label>
          <label>
            <span className="mb-1 block font-semibold text-slate-700">Instructor</span>
            <select value={form.instructorId ?? ''} onChange={(event) => change('instructorId', event.target.value ? Number(event.target.value) : undefined)} className="w-full rounded border border-slate-300 bg-white px-3 py-2">
              <option value="">Sin asignar</option>
              {instructores.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.nombre} {instructor.apellido}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2 font-semibold text-slate-700">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded bg-[#1A365D] px-4 py-2 font-bold text-white disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar actividad'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};