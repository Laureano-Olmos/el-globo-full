import { api } from './client';
import { CuponRecibo } from '../types';

export interface BackendCupon {
  id: number;
  periodo: string;
  zona: number;
  montoCuotaSocial: number;
  montoActividades: number;
  montoCasillero: number;
  recargoPorcentaje: number;
  montoTotal: number;
  estado: 'PENDIENTE' | 'PAGADO' | 'DEVUELTO';
  esReemision: boolean;
  detalle: string | null;
  fechaPago: string | null;
  fechaEmision: string;
  socio: {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
  };
  cobrador?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
}

export const mapBackendCuponToFrontend = (c: BackendCupon): CuponRecibo => {
  const cuotaSocialBase = Number(c.montoCuotaSocial) || 0;
  const montoActividades = Number(c.montoActividades) || 0;
  const costoCasillero = Number(c.montoCasillero) || 0;
  const totalPagar = Number(c.montoTotal) || 0;
  const recargoMoraPorcentaje = Number(c.recargoPorcentaje) || 0;
  const subtotal = cuotaSocialBase + montoActividades + costoCasillero;
  const montoRecargoMora = Math.max(0, totalPagar - subtotal);

  let estadoPago: 'PENDIENTE' | 'PAGADO' | 'VENCIDO' = 'PENDIENTE';
  if (c.estado === 'PAGADO') estadoPago = 'PAGADO';
  else if (c.estado === 'DEVUELTO') estadoPago = 'VENCIDO';

  const fechaEmision = c.fechaEmision ? String(c.fechaEmision).split('T')[0] : '';

  return {
    id: String(c.id),
    numeroComprobante: `REC-${c.periodo || '2026'}-${String(c.id).padStart(4, '0')}`,
    socioId: c.socio ? String(c.socio.id) : '',
    socioNombre: c.socio ? `${c.socio.nombre} ${c.socio.apellido}`.trim() : 'Socio',
    socioDni: c.socio ? c.socio.dni : '',
    zonaCobro: c.zona,
    periodoMes: c.periodo,
    fechaEmision,
    fechaVencimiento: fechaEmision,
    cuotaSocialBase,
    detalleActividades:
      montoActividades > 0
        ? [{ nombre: 'Prácticas deportivas mensuales', monto: montoActividades }]
        : [],
    costoCasillero,
    recargoMoraPorcentaje,
    montoRecargoMora,
    descuentoFamiliar: 0,
    subtotal,
    totalPagar,
    estadoPago,
    fechaPago: c.fechaPago ? String(c.fechaPago).split('T')[0] : undefined,
    cobradorId: c.cobrador ? String(c.cobrador.id) : undefined,
  };
};

export const cuponesApi = {
  async getAll(query?: { socioId?: number; estado?: string; periodo?: string; zona?: number; cobradorId?: number }): Promise<CuponRecibo[]> {
    const list = await api.get<BackendCupon[]>('/cupones', { params: query as any });
    return (list || []).map(mapBackendCuponToFrontend);
  },

  async pagar(id: number | string, fechaPago?: string): Promise<CuponRecibo> {
    const res = await api.patch<BackendCupon>(`/cupones/${id}/pagar`, { fechaPago });
    return mapBackendCuponToFrontend(res);
  },

  async devolver(id: number | string): Promise<CuponRecibo> {
    const res = await api.patch<BackendCupon>(`/cupones/${id}/devolver`);
    return mapBackendCuponToFrontend(res);
  },

  async generarMensual(periodo?: string): Promise<{ generados: number; reemitidos: number; sociosSuspendidos: number }> {
    return api.post('/cupones/generar-mensual', null, { params: { periodo } });
  },
};
