import { api } from './client';
import { Locker } from '../types';

export interface BackendCasillero {
  id: number;
  numero: number;
  costoMensual: number;
  fechaAlquiler: string | null;
  socio: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
  } | null;
}

export const mapBackendCasilleroToFrontend = (c: BackendCasillero): Locker => {
  return {
    numero: c.numero,
    estado: c.socio ? 'OCUPADO' : 'DISPONIBLE',
    socioId: c.socio ? String(c.socio.id) : undefined,
    socioNombre: c.socio ? `${c.socio.nombre} ${c.socio.apellido}`.trim() : undefined,
    socioDni: c.socio?.dni,
    fechaAsignacion: c.fechaAlquiler ? String(c.fechaAlquiler).split('T')[0] : undefined,
    costoMensual: Number(c.costoMensual) || 2500,
  };
};

export const casillerosApi = {
  async getAll(): Promise<Locker[]> {
    const list = await api.get<BackendCasillero[]>('/casilleros');
    return (list || []).map(mapBackendCasilleroToFrontend);
  },

  async alquilar(numero: number, socioId: number | string): Promise<Locker> {
    const res = await api.patch<BackendCasillero>(`/casilleros/${numero}/alquilar/${socioId}`);
    return mapBackendCasilleroToFrontend(res);
  },

  async liberar(numero: number): Promise<Locker> {
    const res = await api.patch<BackendCasillero>(`/casilleros/${numero}/liberar`);
    return mapBackendCasilleroToFrontend(res);
  },
};
