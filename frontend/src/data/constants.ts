import {
  Socio,
  Locker,
  Actividad,
  CuponRecibo,
  RendicionLiquidacion,
  AppUser,
} from '../types';

/**
 * Parámetros y valores base del Club Social y Deportivo El Globo.
 * (Alineados con la tabla `configuracion` del backend y el enunciado oficial).
 */
export const CUOTA_VALORES = {
  CADETE: 35000,
  ACTIVO: 50000,
  VITALICIO: 0, // Exento por estatuto
  CASILLERO_MENSUAL: 2500,
  RECARGO_MORA_PORCENTAJE: 0.05, // 5%
  COMISION_COBRADOR_PORCENTAJE: 0.10, // 10%
  DESCUENTO_FAMILIAR_POR_HIJO: 0,
};

/**
 * Catálogo oficial de Zonas de Cobranza (R7/R9).
 */
export const ZONAS_NOMBRES: Record<number, { nombre: string; descripcion: string; cobradorDefault: string }> = {
  0: {
    nombre: 'Zona 0 - Sede Central',
    descripcion: 'Cobro directo por ventanilla en Secretaría del Club',
    cobradorDefault: 'Secretaría de Cobranzas',
  },
  1: {
    nombre: 'Zona 1 - Centro & Barrio Norte',
    descripcion: 'Radio delimitado por Av. San Martín y Costanera Norte',
    cobradorDefault: 'Sr. Pérez (Cobrador Zona 1)',
  },
  2: {
    nombre: 'Zona 2 - Sur & Estación',
    descripcion: 'Sector Ferrocarril, Av. Pellegrini y Bulevares Sur',
    cobradorDefault: 'Sr. García (Cobrador Zona 2)',
  },
  3: {
    nombre: 'Zona 3 - Este & Costanera',
    descripcion: 'Ribera del Río, Parque Municipal y B° Obrero',
    cobradorDefault: 'Sr. Rodríguez (Cobrador Zona 3)',
  },
};

/**
 * Usuario visitante por defecto (sin autenticar).
 */
export const DEFAULT_GUEST_USER: AppUser = {
  id: 'guest',
  username: 'visitante',
  nombreCompleto: 'Visitante Invitado',
  email: 'visitante@clubelglobo.com.ar',
  role: 'PUBLICO',
};

/**
 * Credenciales de prueba oficiales (precargadas en la base de datos MySQL `el_globo.sql`).
 */
export const TEST_CREDENTIALS = [
  {
    role: 'ADMIN' as const,
    label: 'Administrador General',
    email: 'admin@elglobo.com.ar',
    password: 'Admin123!',
    descripcion: 'Acceso total: Socios, casilleros, actividades, cupones y configuración',
  },
  {
    role: 'COBRADOR' as const,
    label: 'Cobrador Zona 1 (Pérez)',
    email: 'perez.cobrador@elglobo.com.ar',
    password: 'Cobrador123!',
    descripcion: 'Gestión de cupones de Zona 1 y rendición semanal del 10%',
  },
];

/**
 * Arreglos iniciales vacíos (sin datos de ejemplo fake).
 * Los datos se consumen dinámicamente desde el backend NestJS y la base de datos MySQL.
 */
export const INITIAL_SOCIOS: Socio[] = [];
export const INITIAL_ACTIVIDADES: Actividad[] = [];
export const INITIAL_CUPONES: CuponRecibo[] = [];
export const INITIAL_RENDICIONES: RendicionLiquidacion[] = [];
export const MOCK_USERS: AppUser[] = [DEFAULT_GUEST_USER];

/**
 * Generador de los 100 casilleros del club en estado disponible inicial.
 */
export const generateInitialLockers = (): Locker[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    numero: i + 1,
    estado: 'DISPONIBLE',
    costoMensual: CUOTA_VALORES.CASILLERO_MENSUAL,
  }));
};
