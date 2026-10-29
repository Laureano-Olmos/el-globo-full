import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Socio,
  Locker,
  Actividad,
  AsistenciaRegistro,
  CuponRecibo,
  RendicionLiquidacion,
  AppUser,
  Familiar,
  UserRole,
  SocioCategoria,
} from '../types';
import { authApi } from '../api/auth.api';
import { actividadesApi } from '../api/actividades.api';
import { casillerosApi } from '../api/casilleros.api';
import { cuponesApi } from '../api/cupones.api';
import { rendicionesApi } from '../api/rendiciones.api';
import { cobradoresApi } from '../api/cobradores.api';
import { sociosApi } from '../api/socios.api';
import { configuracionApi, BackendConfiguracion } from '../api/configuracion.api';

export type ActiveTab =
  | 'inicio'
  | 'dashboard'
  | 'socios'
  | 'casilleros'
  | 'actividades'
  | 'asistencia'
  | 'cobranza'
  | 'rendicion'
  | 'morosidad'
  | 'personal'
  | 'portal_socio'

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

interface AppContextType {
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  toast: ToastMessage | null;
  configuracion: BackendConfiguracion | null;
  configuracionCargada: boolean;
  refreshConfiguracion: () => Promise<BackendConfiguracion | null>;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, description?: string) => void;
  closeToast: () => void;
  
  // Socios
  socios: Socio[];
  addSocio: (data: Omit<Socio, 'id' | 'numeroSocio' | 'edad' | 'antiguedadAnios' | 'categoria' | 'estado' | 'cuotasAdeudadas'> & { passwordInicial: string }) => Promise<boolean>;
  updateSocio: (id: string, data: Partial<Socio>) => Promise<boolean>;
  deleteSocio: (id: string) => Promise<void>;
  reactivarSocio: (id: string) => Promise<void>;
  addFamiliar: (socioId: string, familiar: Omit<Familiar, 'id' | 'edad'>) => void;
  removeFamiliar: (socioId: string, familiarId: string) => void;
  regularizarDeudaSocio: (socioId: string) => Promise<void>;

  // Casilleros
  lockers: Locker[];
  assignLocker: (lockerNumber: number, socioId: string) => Promise<boolean>;
  releaseLocker: (lockerNumber: number) => Promise<void>;
  reserveLocker: (lockerNumber: number) => void;

  // Actividades
  actividades: Actividad[];
  createActividad: (data: Parameters<typeof actividadesApi.create>[0]) => Promise<boolean>;
  updateActividad: (id: string, data: Parameters<typeof actividadesApi.update>[1]) => Promise<boolean>;
  deleteActividad: (id: string) => Promise<void>;
  enrollSocioInActividad: (socioId: string, actividadId: string) => Promise<boolean>;
  unenrollSocioFromActividad: (socioId: string, actividadId: string) => Promise<void>;

  // Asistencias
  asistencias: AsistenciaRegistro[];
  saveAsistencia: (registro: AsistenciaRegistro) => void;

  // Cupones y Cobranza
  cupones: CuponRecibo[];
  generarCuponesMensuales: () => Promise<void>;
  marcarCuponPagado: (cuponId: string, metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'SEDE_CENTRAL', cobradorId?: string) => Promise<void>;
  reemitirCuponConMora: (cuponId: string) => Promise<void>;

  // Rendiciones
  rendiciones: RendicionLiquidacion[];
  crearRendicionSemanal: (zonaCobro: number, cobradorNombre: string, cuponesIds: string[]) => Promise<boolean>;
  aprobarRendicion: (rendicionId: string) => void;

  // Helpers
  calcularCategoria: (fechaNacimiento: string, fechaIngreso: string) => { categoria: SocioCategoria; edad: number; antiguedadAnios: number };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current User
  const [currentUser, setCurrentUser] = useState<AppUser>({
    id: 'public',
    username: 'publico',
    nombreCompleto: 'Invitado',
    email: '',
    role: 'PUBLICO',
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [configuracion, setConfiguracion] = useState<BackendConfiguracion | null>(null);
  const [configuracionCargada, setConfiguracionCargada] = useState(false);

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, description?: string) => {
    const id = Date.now().toString();
    setToast({ id, type, title, description });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const closeToast = () => setToast(null);

  const refreshConfiguracion = async (): Promise<BackendConfiguracion | null> => {
    try {
      const current = await configuracionApi.get();
      setConfiguracion(current);
      setConfiguracionCargada(true);
      return current;
    } catch {
      setConfiguracionCargada(true);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authApi.login({ email, password });
    const user = await authApi.getMe() || result.user;
    setCurrentUser(user);
    if (user.role === 'ADMIN') setActiveTab('dashboard');
    else if (user.role === 'COBRADOR') setActiveTab('cobranza');
    else if (user.role === 'INSTRUCTOR') setActiveTab('asistencia');
    else if (user.role === 'SOCIO') setActiveTab('portal_socio');
    showToast('success', 'Sesión iniciada', `Conectado como ${user.nombreCompleto}.`);
    return true;
  };

  const logout = () => {
    authApi.logout();
    setCurrentUser({
      id: 'public',
      username: 'publico',
      nombreCompleto: 'Invitado',
      email: '',
      role: 'PUBLICO',
    });
    setActiveTab('inicio');
  };

  useEffect(() => {
    let active = true;
    authApi.getMe().then((user) => {
      if (active && user) setCurrentUser(user);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const tasks: Array<Promise<void>> = [
        actividadesApi.getAll().then((data) => { if (active) setActividades(data); }),
        configuracionApi.get()
          .then((data) => { if (active) setConfiguracion(data); })
          .finally(() => { if (active) setConfiguracionCargada(true); }),
      ];

      if (['ADMIN', 'COBRADOR', 'INSTRUCTOR'].includes(currentUser.role)) {
        tasks.push(sociosApi.getAll().then((data) => { if (active) setSocios(data); }));
      } else if (currentUser.role === 'SOCIO' && currentUser.socioId) {
        tasks.push(sociosApi.getOne(currentUser.socioId).then((data) => { if (active) setSocios([data]); }));
      }
      if (currentUser.role === 'ADMIN') {
        tasks.push(casillerosApi.getAll().then((data) => { if (active) setLockers(data); }));
      }
      if (['ADMIN', 'COBRADOR', 'SOCIO'].includes(currentUser.role)) {
        tasks.push(cuponesApi.getAll().then((data) => { if (active) setCupones(data); }));
      }
      if (['ADMIN', 'COBRADOR'].includes(currentUser.role)) {
        tasks.push(rendicionesApi.getAll().then((data) => { if (active) setRendiciones(data); }));
      }

      const results = await Promise.allSettled(tasks);
      if (active && results.some((result) => result.status === 'rejected')) {
        showToast('warning', 'Conexión parcial', 'No se pudieron cargar algunos datos desde el backend. Verificá la API y los permisos de esta cuenta.');
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [currentUser.id, currentUser.role]);

  // Helper de cálculo automático de categoría según fecha de nacimiento y fecha de ingreso
  const calcularCategoria = (fechaNacimiento: string, fechaIngreso: string) => {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    const ing = new Date(fechaIngreso);

    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
      edad--;
    }
    if (isNaN(edad) || edad < 0) edad = 0;

    let antiguedadAnios = hoy.getFullYear() - ing.getFullYear();
    const mIng = hoy.getMonth() - ing.getMonth();
    if (mIng < 0 || (mIng === 0 && hoy.getDate() < ing.getDate())) {
      antiguedadAnios--;
    }
    if (isNaN(antiguedadAnios) || antiguedadAnios < 0) antiguedadAnios = 0;

    // Reglas estatutarias del Club:
    // 1. Vitalicio: > 30 años ininterrumpidos
    // 2. Cadete: < 18 años
    // 3. Activo: >= 18 años
    let categoria: SocioCategoria = 'ACTIVO';
    if (antiguedadAnios > 30) {
      categoria = 'VITALICIO';
    } else if (edad < 18) {
      categoria = 'CADETE';
    } else {
      categoria = 'ACTIVO';
    }

    return { categoria, edad, antiguedadAnios };
  };

  const [socios, setSocios] = useState<Socio[]>([]);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cupones, setCupones] = useState<CuponRecibo[]>([]);
  const [rendiciones, setRendiciones] = useState<RendicionLiquidacion[]>([]);

  // State Asistencia
  const [asistencias, setAsistencias] = useState<AsistenciaRegistro[]>(() => {
    const saved = localStorage.getItem('el_globo_asistencias');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'asis-1',
        actividadId: 'act-1',
        fecha: '2026-09-15',
        instructorId: 'user-instructor',
        asistencias: [
          { socioId: 'soc-1', socioNombre: 'Martín Rossi', presente: true },
          { socioId: 'soc-4', socioNombre: 'Lucía Lapenta Olmos', presente: true },
          { socioId: 'soc-6', socioNombre: 'Claudio Domínguez', presente: false },
        ],
      },
    ];
  });

  // Persistencias de funciones locales aún no respaldadas por endpoints
  useEffect(() => {
    localStorage.setItem('el_globo_asistencias', JSON.stringify(asistencias));
  }, [asistencias]);

  // SOCIOS CRUD
  const addSocio = async (data: Omit<Socio, 'id' | 'numeroSocio' | 'edad' | 'antiguedadAnios' | 'categoria' | 'estado' | 'cuotasAdeudadas'> & { passwordInicial: string }): Promise<boolean> => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'PUBLICO') {
      showToast('error', 'Acceso denegado', 'Solo un administrador puede registrar socios desde el sistema.');
      return false;
    }

    // Validar DNI único
    const existeDni = socios.some((s) => s.dni.trim() === data.dni.trim());
    if (existeDni) {
      showToast('error', 'Error al registrar', `Ya existe un socio registrado con el DNI ${data.dni}.`);
      return false;
    }

    try {
      const newSocio = await sociosApi.create(data, currentUser.role === 'PUBLICO');
      setSocios((prev) => [newSocio, ...prev]);
      showToast('success', 'Socio registrado', `N° ${newSocio.numeroSocio} - ${newSocio.nombreCompleto} registrado con éxito.`);
      return true;
    } catch (error) {
      showToast('error', 'Error al registrar', error instanceof Error ? error.message : 'No se pudo registrar el socio.');
      return false;
    }
  };

  const updateSocio = async (id: string, data: Partial<Socio>): Promise<boolean> => {
    try {
      const updated = await sociosApi.update(id, data);
      setSocios((prev) => prev.map((s) => s.id === id ? updated : s));
      showToast('success', 'Padrón actualizado', 'Los datos del socio fueron actualizados correctamente.');
      return true;
    } catch (error) {
      showToast('error', 'No se pudo actualizar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
      return false;
    }
  };

  const deleteSocio = async (id: string): Promise<void> => {
    const socio = socios.find((s) => s.id === id);
    if (!socio) return;

    try {
      await sociosApi.delete(id);
      setSocios((prev) => prev.filter((s) => s.id !== id));
      if (socio.casilleroAsignadoId) {
        setLockers((prev) => prev.map((locker) => locker.numero === socio.casilleroAsignadoId
          ? { ...locker, estado: 'DISPONIBLE', socioId: undefined, socioNombre: undefined, socioDni: undefined, fechaAsignacion: undefined }
          : locker));
      }
      showToast('info', 'Socio dado de baja', `El socio ${socio.nombreCompleto} ha sido removido del padrón.`);
    } catch (error) {
      showToast('error', 'No se pudo dar de baja', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  const reactivarSocio = async (id: string): Promise<void> => {
    try {
      const updated = await sociosApi.reactivar(id);
      setSocios((prev) => prev.map((socio) => socio.id === id ? updated : socio));
      showToast('success', 'Socio reactivado', 'El estado fue actualizado por el backend.');
    } catch (error) {
      showToast('error', 'No se pudo reactivar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  const addFamiliar = (socioId: string, familiarData: Omit<Familiar, 'id' | 'edad'>) => {
    const hoy = new Date();
    const nac = new Date(familiarData.fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    if (isNaN(edad) || edad < 0) edad = 0;

    // Los hijos adheridos al plan familiar deben ser menores de 18 años.
    if ((familiarData.parentesco === 'HIJO' || familiarData.parentesco === 'HIJA') && edad >= 18) {
      showToast('warning', 'Validación Plan Familiar', 'Los hijos mayores de 18 años deben asociarse individualmente como categoría Activo.');
      return;
    }

    const newFam: Familiar = {
      ...familiarData,
      id: `fam-${Date.now()}`,
      edad,
    };

    setSocios((prev) =>
      prev.map((s) => {
        if (s.id !== socioId) return s;
        return {
          ...s,
          esTitularFamilia: true,
          familiares: [...s.familiares, newFam],
        };
      })
    );

    showToast('success', 'Familiar vinculado', `${familiarData.nombreCompleto} vinculado al grupo familiar del socio.`);
  };

  const removeFamiliar = (socioId: string, familiarId: string) => {
    setSocios((prev) =>
      prev.map((s) => {
        if (s.id !== socioId) return s;
        const newFamList = s.familiares.filter((f) => f.id !== familiarId);
        return {
          ...s,
          familiares: newFamList,
          esTitularFamilia: newFamList.length > 0,
        };
      })
    );
    showToast('info', 'Familiar desvinculado', 'El miembro fue quitado del grupo familiar.');
  };

  // CASILLEROS (1 a 100)
  const assignLocker = async (lockerNumber: number, socioId: string): Promise<boolean> => {
    const socio = socios.find((s) => s.id === socioId);
    if (!socio) {
      showToast('error', 'Error', 'Socio no encontrado.');
      return false;
    }

    // La morosidad bloquea el alquiler de casilleros.
    if (socio.estado === 'SUSPENDIDO_MOROSIDAD') {
      showToast('error', 'Acción denegada por morosidad', `El socio ${socio.nombreCompleto} debe regularizar su deuda en secretaría.`);
      return false;
    }

    // Cada socio puede tener un único casillero.
    if (socio.casilleroAsignadoId && socio.casilleroAsignadoId !== lockerNumber) {
      showToast('error', 'Límite de casillero alcanzado', `El socio ya cuenta con el casillero N° ${socio.casilleroAsignadoId} asignado.`);
      return false;
    }

    try {
      const locker = await casillerosApi.alquilar(lockerNumber, socioId);
      setLockers((prev) => prev.map((item) => item.numero === lockerNumber ? locker : item));
      setSocios((prev) => prev.map((item) => item.id === socioId ? { ...item, casilleroAsignadoId: lockerNumber } : item));
      showToast('success', 'Casillero asignado', `Casillero N° ${lockerNumber} asignado exitosamente a ${socio.nombreCompleto}.`);
      return true;
    } catch (error) {
      showToast('error', 'No se pudo asignar el casillero', error instanceof Error ? error.message : 'Error de conexión con el backend.');
      return false;
    }
  };

  const releaseLocker = async (lockerNumber: number): Promise<void> => {
    const locker = lockers.find((l) => l.numero === lockerNumber);
    if (!locker) return;

    try {
      const released = await casillerosApi.liberar(lockerNumber);
      if (locker.socioId) {
        setSocios((prev) => prev.map((s) => s.id === locker.socioId ? { ...s, casilleroAsignadoId: undefined } : s));
      }
      setLockers((prev) => prev.map((item) => item.numero === lockerNumber ? released : item));
      showToast('info', 'Casillero liberado', `El casillero N° ${lockerNumber} quedó disponible.`);
    } catch (error) {
      showToast('error', 'No se pudo liberar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  const reserveLocker = (lockerNumber: number) => {
    setLockers((prev) =>
      prev.map((l) => {
        if (l.numero !== lockerNumber) return l;
        const nuevoEstado = l.estado === 'RESERVADO' ? 'DISPONIBLE' : 'RESERVADO';
        return {
          ...l,
          estado: nuevoEstado,
        };
      })
    );
  };

  // ACTIVIDADES
  const createActividad = async (data: Parameters<typeof actividadesApi.create>[0]): Promise<boolean> => {
    if (currentUser.role !== 'ADMIN') return false;
    try {
      const activity = await actividadesApi.create(data);
      setActividades((prev) => [...prev, activity]);
      showToast('success', 'Actividad creada', `${activity.nombre} quedó disponible en la vitrina.`);
      return true;
    } catch (error) {
      showToast('error', 'No se pudo crear la actividad', error instanceof Error ? error.message : 'Error de conexión con el backend.');
      return false;
    }
  };

  const updateActividad = async (id: string, data: Parameters<typeof actividadesApi.update>[1]): Promise<boolean> => {
    if (currentUser.role !== 'ADMIN') return false;
    try {
      const activity = await actividadesApi.update(id, data);
      setActividades((prev) => prev.map((item) => item.id === id ? activity : item));
      showToast('success', 'Actividad actualizada', `${activity.nombre} fue actualizada.`);
      return true;
    } catch (error) {
      showToast('error', 'No se pudo actualizar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
      return false;
    }
  };

  const deleteActividad = async (id: string): Promise<void> => {
    if (currentUser.role !== 'ADMIN') return;
    try {
      await actividadesApi.delete(id);
      setActividades((prev) => prev.filter((item) => item.id !== id));
      showToast('info', 'Actividad dada de baja', 'Se quitó de la vitrina activa.');
    } catch (error) {
      showToast('error', 'No se pudo dar de baja', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  const enrollSocioInActividad = async (socioId: string, actividadId: string): Promise<boolean> => {
    // Regla de Permisos RBAC:
    // 1. El invitado NO tiene que poder inscribir socios a actividades
    if (currentUser.role === 'PUBLICO') {
      showToast('error', 'Acceso denegado', 'Los invitados no tienen permitido inscribir socios a las actividades.');
      return false;
    }

    // 2. El socio SOLO debe de poder inscribirse a sí mismo en las actividades
    if (currentUser.role === 'SOCIO') {
      if (currentUser.socioId && socioId !== currentUser.socioId) {
        showToast('error', 'Permiso denegado', 'Como socio, únicamente tienes permitido inscribirte a ti mismo en las actividades.');
        return false;
      }
    }

    const socio = socios.find((s) => s.id === socioId);
    const actividad = actividades.find((a) => a.id === actividadId);

    if (!socio || !actividad) return false;

    // La morosidad bloquea nuevas inscripciones.
    if (socio.estado === 'SUSPENDIDO_MOROSIDAD') {
      showToast('error', 'Bloqueo por morosidad', `El socio ${socio.nombreCompleto} debe regularizar su estado contable para inscribirse a deportes.`);
      return false;
    }

    if (socio.actividadesIds.includes(actividadId)) {
      showToast('info', 'Ya inscripto', `El socio ya está inscripto en ${actividad.nombre}.`);
      return false;
    }

    if (actividad.cupoOcupado >= actividad.cupoMaximo) {
      showToast('warning', 'Cupo agotado', `La actividad ${actividad.nombre} no posee cupos disponibles.`);
      return false;
    }

    try {
      const enrollment = await actividadesApi.inscribir(socioId, actividadId);
      setSocios((prev) => prev.map((s) => s.id === socioId ? {
        ...s,
        actividadesIds: [...s.actividadesIds, actividadId],
        inscripcionIdsPorActividad: { ...s.inscripcionIdsPorActividad, [actividadId]: String(enrollment.id) },
      } : s));
      setActividades((prev) => prev.map((a) => a.id === actividadId ? { ...a, cupoOcupado: a.cupoOcupado + 1 } : a));
      showToast('success', 'Inscripción confirmada', `Inscripto a ${actividad.nombre} exitosamente.`);
      return true;
    } catch (error) {
      showToast('error', 'No se pudo inscribir', error instanceof Error ? error.message : 'Error de conexión con el backend.');
      return false;
    }
  };

  const unenrollSocioFromActividad = async (socioId: string, actividadId: string): Promise<void> => {
    // Regla de Permisos RBAC:
    // 1. El invitado no puede gestionar inscripciones
    if (currentUser.role === 'PUBLICO') {
      showToast('error', 'Acceso denegado', 'Los invitados no pueden gestionar actividades.');
      return;
    }

    // 2. El socio solo puede gestionar sus propias actividades
    if (currentUser.role === 'SOCIO') {
      if (currentUser.socioId && socioId !== currentUser.socioId) {
        showToast('error', 'Permiso denegado', 'Como socio, únicamente puedes desinscribirte de tus propias actividades.');
        return;
      }
    }

    const socio = socios.find((item) => item.id === socioId);
    const enrollmentId = socio?.inscripcionIdsPorActividad?.[actividadId];
    if (!enrollmentId) {
      showToast('error', 'No se pudo dar de baja', 'No se encontró el identificador de inscripción en los datos del backend.');
      return;
    }

    try {
      await actividadesApi.darDeBajaInscripcion(enrollmentId);
      const actividad = actividades.find((a) => a.id === actividadId);
      setSocios((prev) => prev.map((item) => {
        if (item.id !== socioId) return item;
        const { [actividadId]: removedEnrollment, ...remainingEnrollments } = item.inscripcionIdsPorActividad || {};
        return {
          ...item,
          actividadesIds: item.actividadesIds.filter((id) => id !== actividadId),
          inscripcionIdsPorActividad: remainingEnrollments,
        };
      }));
      setActividades((prev) => prev.map((a) => a.id === actividadId ? { ...a, cupoOcupado: Math.max(0, a.cupoOcupado - 1) } : a));
      showToast('info', 'Baja de actividad', `Se dio de baja la inscripción a ${actividad?.nombre || 'la actividad'}.`);
    } catch (error) {
      showToast('error', 'No se pudo dar de baja', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  // ASISTENCIAS
  const saveAsistencia = (registro: AsistenciaRegistro) => {
    setAsistencias((prev) => {
      const idx = prev.findIndex((r) => r.actividadId === registro.actividadId && r.fecha === registro.fecha);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = registro;
        return copy;
      }
      return [registro, ...prev];
    });
    showToast('success', 'Asistencia registrada', `Planilla de asistencia del ${registro.fecha} guardada correctamente.`);
  };

  // CUPONES & RECIBOS
  const generarCuponesMensuales = async (): Promise<void> => {
    if (currentUser.role !== 'ADMIN') {
      showToast('error', 'Acceso denegado', 'Solo un administrador puede emitir los cupones mensuales.');
      return;
    }

    const today = new Date();
    const periodo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    try {
      const resultado = await cuponesApi.generarMensual(periodo);
      const [cuponesActualizados, sociosActualizados] = await Promise.all([
        cuponesApi.getAll(),
        sociosApi.getAll(),
      ]);
      setCupones(cuponesActualizados);
      setSocios(sociosActualizados);
      const resumen = `${resultado.generados} nuevos, ${resultado.reemitidos} reemitidos y ${resultado.sociosSuspendidos} suspendidos.`;
      showToast(
        resultado.generados || resultado.reemitidos ? 'success' : 'info',
        resultado.generados || resultado.reemitidos ? 'Emisión mensual finalizada' : 'No había cupones nuevos para emitir',
        resultado.generados || resultado.reemitidos
          ? resumen
          : `Puede que ya estén emitidos para este período o que no haya socios activos. ${resumen}`,
      );
    } catch (error) {
      showToast('error', 'No se pudieron emitir los cupones', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  const marcarCuponPagado = async (cuponId: string, metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'SEDE_CENTRAL', cobradorId?: string): Promise<void> => {
    const fechaPago = new Date().toISOString().split('T')[0];
    try {
      const paid = await cuponesApi.pagar(cuponId, fechaPago);
      setCupones((prev) => prev.map((coupon) => coupon.id === cuponId
        ? { ...paid, metodoPago, cobradorId: cobradorId || (currentUser.role === 'COBRADOR' ? currentUser.id : 'sede-central') }
        : coupon));
      showToast('success', 'Pago Registrado', `El recibo fue cancelado mediante ${metodoPago.replace('_', ' ')}.`);
    } catch (error) {
      showToast('error', 'No se pudo registrar el pago', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  // La API marca el cupón devuelto; la reemisión con recargo ocurre en el lote mensual.
  const reemitirCuponConMora = async (cuponId: string): Promise<void> => {
    try {
      const returned = await cuponesApi.devolver(cuponId);
      setCupones((prev) => prev.map((coupon) => coupon.id === cuponId ? returned : coupon));
      showToast('info', 'Cupón devuelto', 'El backend lo considerará para la reemisión mensual con recargo.');
    } catch (error) {
      showToast('error', 'No se pudo devolver el cupón', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  // Regularizar deuda total de un socio en secretaría
  const regularizarDeudaSocio = async (socioId: string): Promise<void> => {
    const fechaPago = new Date().toISOString().split('T')[0];
    const unpaidCoupons = cupones.filter((coupon) => coupon.socioId === socioId && coupon.estadoPago !== 'PAGADO');
    let paidCount = 0;
    try {
      for (const coupon of unpaidCoupons) {
        const paid = await cuponesApi.pagar(coupon.id, fechaPago);
        setCupones((prev) => prev.map((item) => item.id === coupon.id
          ? { ...paid, metodoPago: 'SEDE_CENTRAL', cobradorId: 'sede-central' }
          : item));
        paidCount++;
      }
      setSocios(await sociosApi.getAll());
      showToast('success', 'Deuda regularizada', `${paidCount} cupones pagados y estado actualizado por el backend.`);
    } catch (error) {
      showToast('error', paidCount ? 'Regularización parcial' : 'No se pudo regularizar', error instanceof Error ? error.message : 'Error de conexión con el backend.');
    }
  };

  // Rendiciones semanales de cobradores.
  const crearRendicionSemanal = async (zonaCobro: number, cobradorNombre: string, cuponesIds: string[]): Promise<boolean> => {
    const selectedCupones = cupones.filter((coupon) => cuponesIds.includes(coupon.id));
    try {
      const realCobradorId = currentUser.role === 'COBRADOR'
        ? currentUser.cobradorId
        : (await cobradoresApi.getAll()).find((cobrador) => cobrador.zona === zonaCobro)?.id.toString();
      if (!realCobradorId) {
        showToast('error', 'Cobrador no encontrado', 'No existe un cobrador asociado a la zona seleccionada.');
        return false;
      }

      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      await rendicionesApi.create({
        cobradorId: Number(realCobradorId),
        semanaInicio: formatDate(monday),
        semanaFin: formatDate(sunday),
        detalles: selectedCupones.map((coupon) => ({
          cuponId: Number(coupon.id),
          importeCobrado: coupon.totalPagar,
          cobrado: true,
        })),
      });
      const refreshed = await rendicionesApi.getAll();
      setRendiciones(refreshed);
      showToast('success', 'Rendición semanal enviada', `La rendición de ${cobradorNombre} quedó pendiente de aprobación.`);
      return true;
    } catch (error) {
      showToast('error', 'No se pudo crear la rendición', error instanceof Error ? error.message : 'Error de conexión con el backend.');
      return false;
    }
  };

  const aprobarRendicion = () => {
    showToast('warning', 'Aprobación no disponible', 'El backend todavía no expone un endpoint para aprobar rendiciones.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        activeTab,
        setActiveTab,
        toast,
        configuracion,
        configuracionCargada,
        refreshConfiguracion,
        showToast,
        closeToast,
        socios,
        addSocio,
        updateSocio,
        deleteSocio,
        reactivarSocio,
        addFamiliar,
        removeFamiliar,
        regularizarDeudaSocio,
        lockers,
        assignLocker,
        releaseLocker,
        reserveLocker,
        actividades,
        createActividad,
        updateActividad,
        deleteActividad,
        enrollSocioInActividad,
        unenrollSocioFromActividad,
        asistencias,
        saveAsistencia,
        cupones,
        generarCuponesMensuales,
        marcarCuponPagado,
        reemitirCuponConMora,
        rendiciones,
        crearRendicionSemanal,
        aprobarRendicion,
        calcularCategoria,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
