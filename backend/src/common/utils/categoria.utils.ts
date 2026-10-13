import { CategoriaSocial } from '../enums/categoria-social.enum';
import { DateUtils } from './date.utils';

export interface ParametrosCategoria {
  edadMinimaActivo: number;
  edadMinimaVitalicio: number;
  antiguedadMinimaVitalicio: number;
}

/**
 * Calcula automáticamente la categoría social de un socio (R2), en base a
 * su fecha de nacimiento (edad) y su fecha de alta (antigüedad como socio
 * activo), siguiendo los parámetros configurables del club.
 *
 *  - CADETE: edad < edadMinimaActivo (18).
 *  - VITALICIO: edad > edadMinimaVitalicio (60) Y antigüedad >=
 *    antiguedadMinimaVitalicio (30).
 *  - ACTIVO: cualquier otro caso (edad >= 18).
 */
export function calcularCategoriaSocial(
  fechaNacimiento: Date,
  fechaAlta: Date,
  parametros: ParametrosCategoria,
): CategoriaSocial {
  const edad = DateUtils.edadEnAnios(fechaNacimiento);

  if (edad < parametros.edadMinimaActivo) {
    return CategoriaSocial.CADETE;
  }

  const antiguedad = DateUtils.aniosTranscurridos(fechaAlta);
  if (edad > parametros.edadMinimaVitalicio && antiguedad >= parametros.antiguedadMinimaVitalicio) {
    return CategoriaSocial.VITALICIO;
  }

  return CategoriaSocial.ACTIVO;
}
