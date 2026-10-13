import { api } from './client';

export interface BackendCobrador {
  id: number;
  nombre: string;
  apellido: string;
  zona: number;
}

export const cobradoresApi = {
  getAll(): Promise<BackendCobrador[]> {
    return api.get<BackendCobrador[]>('/cobradores');
  },
};