import { api } from './client';

export interface BackendConfiguracion {
  id: number;
  cuotaCadete: number;
  cuotaActivo: number;
  cuotaVitalicio: number;
  cuotaGrupoFamiliar: number;
  costoCasillero: number;
  recargoMorosidad: number;
  comisionCobrador: number;
  edadMinimaActivo: number;
  edadMinimaVitalicio: number;
  antiguedadMinimaVitalicio: number;
  mesesConsecutivosParaMorosidad: number;
  totalCasilleros: number;
  totalActividades: number;
}

export const configuracionApi = {
  async get(): Promise<BackendConfiguracion> {
    return api.get<BackendConfiguracion>('/configuracion');
  },

  async update(dto: Partial<BackendConfiguracion>): Promise<BackendConfiguracion> {
    return api.patch<BackendConfiguracion>('/configuracion', dto);
  },
};
