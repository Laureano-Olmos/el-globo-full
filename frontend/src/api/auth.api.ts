import { api, setStoredToken } from './client';
import { AppUser, UserRole } from '../types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    userId: number;
    email: string;
    role: UserRole;
    socioId: number | null;
    instructorId: number | null;
    cobradorId: number | null;
  };
}

export const authApi = {
  async login(credentials: LoginDto): Promise<{ token: string; user: AppUser }> {
    const res = await api.post<LoginResponse>('/auth/login', credentials);
    setStoredToken(res.accessToken);

    const appUser: AppUser = {
      id: String(res.user.userId),
      username: res.user.email.split('@')[0],
      nombreCompleto: res.user.email.split('@')[0].toUpperCase(),
      email: res.user.email,
      role: res.user.role,
      socioId: res.user.socioId ? String(res.user.socioId) : undefined,
      actividadId: res.user.instructorId ? String(res.user.instructorId) : undefined,
      cobradorId: res.user.cobradorId ? String(res.user.cobradorId) : undefined,
    };

    return { token: res.accessToken, user: appUser };
  },

  async getMe(): Promise<AppUser | null> {
    try {
      const res = await api.get<any>('/auth/me');
      if (!res) return null;

      let nombre = res.email.split('@')[0];
      if (res.socio) {
        nombre = `${res.socio.nombre} ${res.socio.apellido}`;
      } else if (res.instructor) {
        nombre = `Prof. ${res.instructor.nombre} ${res.instructor.apellido}`;
      } else if (res.cobrador) {
        nombre = `Cobrador ${res.cobrador.nombre} ${res.cobrador.apellido}`;
      } else if (res.role === 'ADMIN') {
        nombre = 'Administrador General';
      }

      return {
        id: String(res.id),
        username: res.email.split('@')[0],
        nombreCompleto: nombre,
        email: res.email,
        role: res.role,
        socioId: res.socio?.id ? String(res.socio.id) : undefined,
        actividadId: res.instructor?.id ? String(res.instructor.id) : undefined,
        zonaAsignada: res.cobrador?.zona ?? undefined,
        cobradorId: res.cobrador?.id ? String(res.cobrador.id) : undefined,
      };
    } catch {
      setStoredToken(null);
      return null;
    }
  },

  logout(): void {
    setStoredToken(null);
  },

  async changePassword(passwordActual: string, passwordNueva: string): Promise<void> {
    await api.patch('/auth/change-password', { passwordActual, passwordNueva });
  },
};
