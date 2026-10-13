/**
 * Utilidades de fecha reutilizadas por las reglas de negocio del club
 * (cálculo de edad, antigüedad y períodos de cobranza).
 */
export class DateUtils {
  /** Edad en años completos a la fecha indicada (por defecto, hoy). */
  static edadEnAnios(fechaNacimiento: Date, aFecha: Date = new Date()): number {
    let edad = aFecha.getFullYear() - fechaNacimiento.getFullYear();
    const mes = aFecha.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && aFecha.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  /** Años completos transcurridos desde una fecha (antigüedad como socio). */
  static aniosTranscurridos(desde: Date, aFecha: Date = new Date()): number {
    return DateUtils.edadEnAnios(desde, aFecha);
  }

  /** Formatea un período de cobranza como 'YYYY-MM'. */
  static periodo(fecha: Date = new Date()): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${anio}-${mes}`;
  }

  /** Período anterior a uno dado, en formato 'YYYY-MM'. */
  static periodoAnterior(periodo: string): string {
    const [anio, mes] = periodo.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, 1);
    fecha.setMonth(fecha.getMonth() - 1);
    return DateUtils.periodo(fecha);
  }

  /** Devuelve el lunes (inicio) y domingo (fin) de la semana de una fecha. */
  static semanaDe(fecha: Date = new Date()): { inicio: Date; fin: Date } {
    const dia = fecha.getDay(); // 0 = domingo
    const diff = dia === 0 ? -6 : 1 - dia;
    const inicio = new Date(fecha);
    inicio.setDate(fecha.getDate() + diff);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);
    return { inicio, fin };
  }

  /** Verifica si una fecha cae dentro de la última semana calendario del mes. */
  static esUltimaSemanaDelMes(fecha: Date = new Date()): boolean {
    const ultimoDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
    return fecha.getDate() > ultimoDiaDelMes - 7;
  }
}
