import { api } from './client';
import { Actividad } from '../types';

export interface BackendActividad {
  id: number;
  nombre: string;
  descripcion: string | null;
  arancel: number;
  turno: 'MATUTINO' | 'VESPERTINO' | 'NOCTURNO';
  diasSemana: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  cupoMaximo: number | null;
  activa: boolean;
  instructor?: {
    id: number;
    nombre: string;
    apellido: string;
  } | null;
  inscripciones?: Array<{
    id: number;
    socio: {
      id: number;
      nombre: string;
      apellido: string;
      dni: string;
    };
  }>;
}

export const mapBackendActividadToFrontend = (a: BackendActividad): Actividad => {
  const dias = a.diasSemana
    ? a.diasSemana.split(',').map((d) => d.trim())
    : ['Lunes', 'Miércoles', 'Viernes'];

  const horaInicio = a.horaInicio ? a.horaInicio.slice(0, 5) : '18:00';
  const horaFin = a.horaFin ? a.horaFin.slice(0, 5) : '19:30';

  const instructorNombre = a.instructor
    ? `Prof. ${a.instructor.nombre} ${a.instructor.apellido}`.trim()
    : 'Profesor a designar';

  return {
    id: String(a.id),
    nombre: a.nombre,
    categoria: a.turno || 'Polideportivo',
    dias,
    horario: `${horaInicio} - ${horaFin}`,
    instructorId: a.instructor ? String(a.instructor.id) : '',
    instructorNombre,
    cupoMaximo: a.cupoMaximo || 25,
    cupoOcupado: a.inscripciones ? a.inscripciones.length : 0,
    costoMensual: Number(a.arancel) || 7500,
    lugar: 'Sede Social y Polideportivo',
    edadMinima: 6,
    descripcion: a.descripcion || 'Actividad deportiva del Club Social y Deportivo El Globo.',
  };
};

export const actividadesApi = {
  async getAll(): Promise<Actividad[]> {
    const list = await api.get<BackendActividad[]>('/actividades');
    return (list || []).map(mapBackendActividadToFrontend);
  },

  async create(data: {
    nombre: string;
    descripcion?: string;
    arancel: number;
    turno?: 'MATUTINO' | 'VESPERTINO' | 'NOCTURNO';
    diasSemana?: string;
    cupoMaximo?: number;
    instructorId?: number;
  }): Promise<Actividad> {
    const payload = {
      ...data,
      turno: data.turno || 'VESPERTINO',
    };
    const res = await api.post<BackendActividad>('/actividades', payload);
    return mapBackendActividadToFrontend(res);
  },

  async update(id: number | string, data: {
    nombre?: string;
    descripcion?: string;
    arancel?: number;
    turno?: 'MATUTINO' | 'VESPERTINO' | 'NOCTURNO';
    diasSemana?: string;
    horaInicio?: string;
    horaFin?: string;
    cupoMaximo?: number;
    instructorId?: number;
  }): Promise<Actividad> {
    const res = await api.patch<BackendActividad>(`/actividades/${id}`, data);
    return mapBackendActividadToFrontend(res);
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/actividades/${id}`);
  },

  async inscribir(socioId: number | string, actividadId: number | string): Promise<any> {
    return api.post('/inscripciones', {
      socioId: Number(socioId),
      actividadId: Number(actividadId),
    });
  },

  async darDeBajaInscripcion(inscripcionId: number | string): Promise<void> {
    await api.delete(`/inscripciones/${inscripcionId}`);
  },

  async getAsistencia(): Promise<any[]> {
    return api.get('/actividades/asistencia');
  },
};
