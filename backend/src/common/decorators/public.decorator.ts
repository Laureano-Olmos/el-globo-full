import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca un endpoint como público (accesible por "Usuario Externo" / Invitado
 * sin necesidad de autenticación), por ejemplo la vitrina de actividades.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
