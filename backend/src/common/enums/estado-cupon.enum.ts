export enum EstadoCupon {
  PENDIENTE = 'PENDIENTE',
  PAGADO = 'PAGADO',
  DEVUELTO = 'DEVUELTO', // no cobrado en la última semana del mes
  ANULADO = 'ANULADO',
}
