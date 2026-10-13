import { api } from './client';
import { RendicionLiquidacion } from '../types';

export interface BackendRendicion {
  id: number;
  semanaInicio: string;
  semanaFin: string;
  totalCobrado: number;
  comisionPorcentaje: number;
  montoComision: number;
  netoRendido: number;
  fechaRendicion: string;
  cobrador: {
    id: number;
    nombre: string;
    apellido: string;
    zona: number;
  };
  detalles?: Array<{
    id: number;
    cupon: {
      id: number;
    };
    importeCobrado: number;
    cobrado: boolean;
  }>;
}

export const mapBackendRendicionToFrontend = (r: BackendRendicion): RendicionLiquidacion => {
  const recibosCobradosIds = (r.detalles || [])
    .filter((d) => d.cobrado)
    .map((d) => String(d.cupon?.id || d.id));

  return {
    id: String(r.id),
    cobradorId: String(r.cobrador?.id || '1'),
    cobradorNombre: r.cobrador ? `${r.cobrador.nombre} ${r.cobrador.apellido}`.trim() : 'Cobrador',
    zonaCobro: r.cobrador?.zona || 1,
    semanaNumero: 1,
    periodoFecha: `${String(r.semanaInicio).split('T')[0]} al ${String(r.semanaFin).split('T')[0]}`,
    recibosCobradosIds,
    totalCobrado: Number(r.totalCobrado) || 0,
    porcentajeComision: Number(r.comisionPorcentaje) || 10,
    montoComisionCobrador: Number(r.montoComision) || 0,
    netoRendidoClub: Number(r.netoRendido) || 0,
    estado: 'PENDIENTE_SECRETARIA',
    fechaRendicion: r.fechaRendicion ? String(r.fechaRendicion).split('T')[0] : '',
  };
};

export const rendicionesApi = {
  async getAll(cobradorId?: number): Promise<RendicionLiquidacion[]> {
    const list = await api.get<BackendRendicion[]>('/rendiciones', { params: { cobradorId } });
    return (list || []).map(mapBackendRendicionToFrontend);
  },

  async create(data: {
    cobradorId: number;
    semanaInicio: string;
    semanaFin: string;
    detalles: Array<{ cuponId: number; importeCobrado: number; cobrado?: boolean }>;
    esUltimaSemanaDelMes?: boolean;
  }): Promise<RendicionLiquidacion> {
    const res = await api.post<BackendRendicion>('/rendiciones', data);
    return mapBackendRendicionToFrontend(res);
  },
};
