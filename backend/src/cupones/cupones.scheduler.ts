import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CuponesService } from './cupones.service';
import { SociosService } from '../socios/socios.service';

/**
 * Tareas automáticas del club:
 *  - El día 1 de cada mes: recalcula categorías, aplica control de
 *    morosidad y emite/reemite los cupones del período (R2, R8, R10, R11).
 */
@Injectable()
export class CuponesScheduler {
  private readonly logger = new Logger(CuponesScheduler.name);

  constructor(
    private readonly cuponesService: CuponesService,
    private readonly sociosService: SociosService,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async emisionMensual() {
    this.logger.log('Iniciando proceso mensual de categorización y emisión de cupones...');
    await this.sociosService.recalcularCategoriasDeTodos();
    const resultado = await this.cuponesService.generarCuponesMensuales();
    this.logger.log(
      `Proceso mensual finalizado. Cupones nuevos: ${resultado.generados}, reemitidos con recargo: ${resultado.reemitidos}.`,
    );
  }
}
