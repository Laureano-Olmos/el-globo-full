import React, { useEffect, useState } from 'react';
import { Settings, X } from 'lucide-react';
import { configuracionApi, BackendConfiguracion } from '../api/configuracion.api';
import { useApp } from '../context/AppContext';

type EditableKey =
  | 'cuotaCadete'
  | 'cuotaActivo'
  | 'cuotaVitalicio'
  | 'cuotaGrupoFamiliar'
  | 'costoCasillero'
  | 'recargoMorosidad'
  | 'comisionCobrador'
  | 'edadMinimaActivo'
  | 'edadMinimaVitalicio'
  | 'antiguedadMinimaVitalicio'
  | 'mesesConsecutivosParaMorosidad'
  | 'totalCasilleros';

const fields: Array<{ key: EditableKey; label: string; min: number; step: number }> = [
  { key: 'cuotaCadete', label: 'Cuota cadete', min: 0, step: 1 },
  { key: 'cuotaActivo', label: 'Cuota activo', min: 0, step: 1 },
  { key: 'cuotaVitalicio', label: 'Cuota vitalicio', min: 0, step: 1 },
  { key: 'cuotaGrupoFamiliar', label: 'Cuota grupo familiar', min: 0, step: 1 },
  { key: 'costoCasillero', label: 'Costo mensual de casillero', min: 0, step: 1 },
  { key: 'recargoMorosidad', label: 'Recargo por morosidad (%)', min: 0, step: 0.01 },
  { key: 'comisionCobrador', label: 'Comisión del cobrador (%)', min: 0, step: 0.01 },
  { key: 'edadMinimaActivo', label: 'Edad mínima categoría activo', min: 0, step: 1 },
  { key: 'edadMinimaVitalicio', label: 'Edad mínima categoría vitalicio', min: 0, step: 1 },
  { key: 'antiguedadMinimaVitalicio', label: 'Antigüedad mínima vitalicio (años)', min: 0, step: 1 },
  { key: 'mesesConsecutivosParaMorosidad', label: 'Meses impagos para suspensión', min: 1, step: 1 },
  { key: 'totalCasilleros', label: 'Casilleros habilitados', min: 1, step: 1 },
];

interface ConfiguracionModalProps {
  onClose: () => void;
}

export const ConfiguracionModal: React.FC<ConfiguracionModalProps> = ({ onClose }) => {
  const { showToast } = useApp();
  const [values, setValues] = useState<Partial<BackendConfiguracion>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    configuracionApi.get()
      .then((config) => { if (active) setValues(config); })
      .catch((error: unknown) => showToast('error', 'No se pudo cargar la configuración', error instanceof Error ? error.message : 'Error de conexión con el backend.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = Object.fromEntries(fields.map(({ key }) => [key, Number(values[key])])) as Partial<BackendConfiguracion>;
      const updated = await configuracionApi.update(payload);
      setValues(updated);
      showToast('success', 'Configuración actualizada', 'Los parámetros del club se guardaron en el backend.');
      onClose();
    } catch (error) {
      showToast('error', 'No se pudo guardar la configuración', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-2xl">
        <header className="sticky top-0 flex items-center justify-between border-b-2 border-[#C53030] bg-[#1A365D] px-5 py-3 text-white">
          <h2 className="flex items-center gap-2 text-sm font-bold"><Settings className="h-4 w-4" /> Parámetros del club</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1 text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-5">
          {loading ? (
            <p className="py-8 text-center text-xs text-slate-500">Cargando configuración…</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(({ key, label, min, step }) => (
                <label key={key} className="text-xs">
                  <span className="mb-1 block font-semibold text-slate-700">{label}</span>
                  <input
                    type="number"
                    required
                    min={min}
                    step={step}
                    value={values[key] ?? ''}
                    onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))}
                    className="w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
              ))}
            </div>
          )}
          <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="rounded border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700">Cancelar</button>
            <button type="submit" disabled={loading || saving} className="rounded bg-[#1A365D] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};