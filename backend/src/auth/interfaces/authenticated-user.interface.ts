import { Role } from '../../common/enums/role.enum';

/**
 * Forma del payload decodificado del JWT, disponible en `request.user`
 * luego de pasar el JwtAuthGuard.
 */
export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: Role;
  socioId?: number | null;
  instructorId?: number | null;
  cobradorId?: number | null;
}
