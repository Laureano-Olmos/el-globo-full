import { api } from './client';
import { Socio, SocioCategoria, SocioEstado, Familiar } from '../types';

export interface BackendSocio {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  fechaAlta: string;
  direccion: string | null;
  localidad: string | null;
  telefono: string | null;
  email: string;
  categoria: SocioCategoria;
  zonaCobro: number;
  estado: 'ACTIVO' | 'MOROSO' | 'SUSPENDIDO' | 'BAJA';
  mesesImpagosConsecutivos: number;
  grupoFamiliar?: {
    id: number;
    cuotaGrupal: number;
    integrantes?: any[];
  } | null;
  rolGrupoFamiliar?: string | null;
  casillero?: {
    id: number;
    numero: number;
  } | null;
  inscripciones?: Array<{
    id: number;
    actividad: {
      id: number;
      nombre: string;
    };
  }>;
  cupones?: any[];
}

export interface CreateSocioPayload {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  fechaAlta?: string;
  direccion?: string;
  localidad?: string;
  telefono?: string;
  email: string;
  zonaCobro: number;
}

export const mapBackendSocioToFrontend = (s: BackendSocio): Socio => {
  const hoy = new Date();
  const nac = new Date(s.fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  if (isNaN(edad) || edad < 0) edad = 0;

  const alta = new Date(s.fechaAlta);
  let antiguedad = hoy.getFullYear() - alta.getFullYear();
  const mAlta = hoy.getMonth() - alta.getMonth();
  if (mAlta < 0 || (mAlta === 0 && hoy.getDate() < alta.getDate())) antiguedad--;
  if (isNaN(antiguedad) || antiguedad < 0) antiguedad = 0;

  let frontendEstado: SocioEstado = 'AL_DIA';
  if (s.estado === 'SUSPENDIDO' || s.mesesImpagosConsecutivos >= 2) {
    frontendEstado = 'SUSPENDIDO_MOROSIDAD';
  } else if (s.estado === 'MOROSO' || s.mesesImpagosConsecutivos === 1) {
    frontendEstado = 'DEUDOR_1_MES';
  }

  const familiares: Familiar[] = [];
  if (s.grupoFamiliar && Array.isArray(s.grupoFamiliar.integrantes)) {
    s.grupoFamiliar.integrantes
      .filter((integ) => integ.id !== s.id)
      .forEach((integ) => {
        familiares.push({
          id: String(integ.id),
          nombreCompleto: `${integ.nombre} ${integ.apellido}`,
          dni: integ.dni,
          parentesco: integ.rolGrupoFamiliar || 'HIJO',
          fechaNacimiento: integ.fechaNacimiento ? String(integ.fechaNacimiento).split('T')[0] : '',
          edad: 0,
        });
      });
  }

  const actividadesIds = (s.inscripciones || []).map((ins) => String(ins.actividad?.id)).filter(Boolean);
  const inscripcionIdsPorActividad = Object.fromEntries(
    (s.inscripciones || []).map((ins) => [String(ins.actividad?.id), String(ins.id)]),
  );

  return {
    id: String(s.id),
    numeroSocio: s.id,
    nombreCompleto: `${s.nombre} ${s.apellido}`.trim(),
    dni: s.dni,
    email: s.email,
    telefono: s.telefono || '',
    direccion: s.direccion || '',
    zonaCobro: s.zonaCobro,
    fechaNacimiento: s.fechaNacimiento ? String(s.fechaNacimiento).split('T')[0] : '',
    fechaIngreso: s.fechaAlta ? String(s.fechaAlta).split('T')[0] : '',
    edad,
    antiguedadAnios: antiguedad,
    categoria: s.categoria,
    estado: frontendEstado,
    cuotasAdeudadas: s.mesesImpagosConsecutivos || 0,
    esTitularFamilia: s.rolGrupoFamiliar === 'TITULAR' || (!s.rolGrupoFamiliar && !!s.grupoFamiliar),
    familiares,
    actividadesIds,
    inscripcionIdsPorActividad,
    casilleroAsignadoId: s.casillero?.numero,
  };
};

export const sociosApi = {
  async getAll(query?: { orden?: string; zona?: number; categoria?: string; estado?: string; buscar?: string }): Promise<Socio[]> {
    const list = await api.get<BackendSocio[]>('/socios', { params: query as any });
    return (list || []).map(mapBackendSocioToFrontend);
  },

  async getOne(id: number | string): Promise<Socio> {
    const s = await api.get<BackendSocio>(`/socios/${id}`);
    return mapBackendSocioToFrontend(s);
  },

  async create(data: {
    nombreCompleto: string;
    dni: string;
    email: string;
    telefono: string;
    direccion: string;
    zonaCobro: number;
    fechaNacimiento: string;
    fechaIngreso?: string;
  }): Promise<Socio> {
    const parts = data.nombreCompleto.trim().split(' ');
    const nombre = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
    const apellido = parts.length > 1 ? parts[parts.length - 1] : parts[0];

    const payload: CreateSocioPayload = {
      nombre,
      apellido,
      dni: data.dni.trim(),
      email: data.email.trim() || `${data.dni.trim()}@elglobo.com.ar`,
      telefono: data.telefono.trim() || undefined,
      direccion: data.direccion.trim() || undefined,
      zonaCobro: Number(data.zonaCobro),
      fechaNacimiento: data.fechaNacimiento,
      fechaAlta: data.fechaIngreso || new Date().toISOString().split('T')[0],
    };

    const s = await api.post<BackendSocio>('/socios', payload);
    return mapBackendSocioToFrontend(s);
  },

  async update(id: number | string, data: Partial<Socio>): Promise<Socio> {
    const payload: any = {};
    if (data.nombreCompleto) {
      const parts = data.nombreCompleto.trim().split(' ');
      payload.nombre = parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0];
      payload.apellido = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    }
    if (data.dni) payload.dni = data.dni;
    if (data.email) payload.email = data.email;
    if (data.telefono !== undefined) payload.telefono = data.telefono;
    if (data.direccion !== undefined) payload.direccion = data.direccion;
    if (data.zonaCobro !== undefined) payload.zonaCobro = Number(data.zonaCobro);
    if (data.fechaNacimiento) payload.fechaNacimiento = data.fechaNacimiento;
    if (data.fechaIngreso) payload.fechaAlta = data.fechaIngreso;

    const s = await api.patch<BackendSocio>(`/socios/${id}`, payload);
    return mapBackendSocioToFrontend(s);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/socios/${id}`);
  },

  async reactivar(id: number | string): Promise<Socio> {
    const s = await api.patch<BackendSocio>(`/socios/${id}/reactivar`);
    return mapBackendSocioToFrontend(s);
  },
};
