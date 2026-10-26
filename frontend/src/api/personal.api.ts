import { api } from './client';

export interface Cobrador {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  zona: number;
  comisionPorcentaje: number;
  user?: { id: number; activo: boolean } | null;
}

export interface Instructor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  sueldo: number | null;
  user?: { id: number; activo: boolean } | null;
}

export interface CobradorPayload {
  nombre: string;
  apellido: string;
  correo: string;
  zona: number;
  comisionPorcentaje?: number;
  passwordInicial?: string;
}

export interface InstructorPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  sueldo?: number;
  passwordInicial?: string;
}

export const personalApi = {
  cobradores: {
    getAll: () => api.get<Cobrador[]>('/cobradores'),
    create: (data: CobradorPayload) => api.post<Cobrador>('/cobradores', data),
    update: (id: number, data: Partial<CobradorPayload>) => api.patch<Cobrador>(`/cobradores/${id}`, data),
    delete: (id: number) => api.delete(`/cobradores/${id}`),
  },
  instructores: {
    getAll: () => api.get<Instructor[]>('/instructores'),
    create: (data: InstructorPayload) => api.post<Instructor>('/instructores', data),
    update: (id: number, data: Partial<InstructorPayload>) => api.patch<Instructor>(`/instructores/${id}`, data),
    delete: (id: number) => api.delete(`/instructores/${id}`),
  },
};
