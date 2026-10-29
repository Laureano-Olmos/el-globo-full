import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cupon } from './entities/cupon.entity';
import { QueryCuponDto } from './dto/query-cupon.dto';
import { PagarCuponDto } from './dto/pagar-cupon.dto';
import { Socio } from '../socios/entities/socio.entity';
import { Cobrador } from '../cobradores/entities/cobrador.entity';
import { EstadoCupon } from '../common/enums/estado-cupon.enum';
import { EstadoSocio } from '../common/enums/estado-socio.enum';
import { CategoriaSocial } from '../common/enums/categoria-social.enum';
import { ZonaCobro } from '../common/enums/zona-cobro.enum';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { DateUtils } from '../common/utils/date.utils';

@Injectable()
export class CuponesService {
  private readonly logger = new Logger(CuponesService.name);

  constructor(
    @InjectRepository(Cupon) private readonly repo: Repository<Cupon>,
    @InjectRepository(Socio) private readonly sociosRepo: Repository<Socio>,
    @InjectRepository(Cobrador) private readonly cobradoresRepo: Repository<Cobrador>,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  async findAll(query: QueryCuponDto): Promise<Cupon[]> {
    const qb = this.repo
      .createQueryBuilder('cupon')
      .leftJoinAndSelect('cupon.socio', 'socio')
      .leftJoinAndSelect('cupon.cobrador', 'cobrador')
      .leftJoinAndSelect('cupon.grupoFamiliar', 'grupoFamiliar')
      .orderBy('cupon.fechaEmision', 'DESC');

    if (query.socioId) qb.andWhere('socio.id = :socioId', { socioId: query.socioId });
    if (query.cobradorId) qb.andWhere('cobrador.id = :cobradorId', { cobradorId: query.cobradorId });
    if (query.zona !== undefined) qb.andWhere('cupon.zona = :zona', { zona: query.zona });
    if (query.estado) qb.andWhere('cupon.estado = :estado', { estado: query.estado });
    if (query.periodo) qb.andWhere('cupon.periodo = :periodo', { periodo: query.periodo });

    return qb.getMany();
  }

  async findOne(id: number): Promise<Cupon> {
    const cupon = await this.repo.findOne({
      where: { id },
      relations: ['socio', 'cobrador', 'grupoFamiliar'],
    });
    if (!cupon) {
      throw new NotFoundException(`No existe un cupón con id ${id}.`);
    }
    return cupon;
  }

  /**
   * Marca un cupón como pagado. Resetea el contador de meses impagos
   * consecutivos del socio y, si estaba moroso/suspendido, lo reactiva.
   */
  async pagar(id: number, dto: PagarCuponDto): Promise<Cupon> {
    const cupon = await this.findOne(id);
    if (cupon.estado === EstadoCupon.PAGADO) {
      throw new BadRequestException('El cupón ya se encuentra pagado.');
    }
    cupon.estado = EstadoCupon.PAGADO;
    cupon.fechaPago = dto.fechaPago ? new Date(dto.fechaPago) : new Date();
    await this.repo.save(cupon);

    const socio = await this.sociosRepo.findOne({ where: { id: cupon.socio.id } });
    if (socio) {
      socio.mesesImpagosConsecutivos = 0;
      if (socio.estado === EstadoSocio.MOROSO || socio.estado === EstadoSocio.SUSPENDIDO) {
        socio.estado = EstadoSocio.ACTIVO;
      }
      await this.sociosRepo.save(socio);
    }

    return cupon;
  }

  /**
   * Emisión mensual de cupones (R8). Por cada socio activo (o cada grupo
   * familiar) calcula: cuota social/grupal + suma de aranceles de
   * actividades activas + costo de casillero si corresponde. Además,
   * reemite con un 5% de recargo los cupones del período anterior que
   * quedaron impagos (R11), y aplica el control de morosidad (R10) antes
   * de emitir nada nuevo.
   */
  async generarCuponesMensuales(periodo: string = DateUtils.periodo()): Promise<{
    generados: number;
    reemitidos: number;
    sociosSuspendidos: number;
  }> {
    const cuponesExistentes = await this.repo.count({ where: { periodo } });
    if (cuponesExistentes > 0) {
      return { generados: 0, reemitidos: 0, sociosSuspendidos: 0 };
    }

    await this.aplicarControlDeMorosidad(periodo);

    const config = await this.configuracionService.getOrCreate();
    const socios = await this.sociosRepo.find({
      where: { estado: EstadoSocio.ACTIVO },
      relations: ['grupoFamiliar', 'inscripciones', 'inscripciones.actividad', 'casillero'],
    });

    let generados = 0;
    const gruposYaFacturados = new Set<number>();

    for (const socio of socios) {
      // Plan grupo familiar: un solo recibo por grupo (se emite una vez, sobre el titular).
      if (socio.grupoFamiliar) {
        if (gruposYaFacturados.has(socio.grupoFamiliar.id)) continue;
        gruposYaFacturados.add(socio.grupoFamiliar.id);

        const montoActividades = await this.sumarActividadesDelGrupo(socio.grupoFamiliar.id);
        const montoCasillero = await this.sumarCasillerosDelGrupo(socio.grupoFamiliar.id);
        const montoTotal = Number(socio.grupoFamiliar.cuotaGrupal) + montoActividades + montoCasillero;

        await this.repo.save(
          this.repo.create({
            socio, // socio titular como referencia de contacto del recibo grupal
            grupoFamiliar: socio.grupoFamiliar,
            periodo,
            zona: socio.zonaCobro,
            cobrador: await this.cobradorDeZona(socio.zonaCobro),
            montoCuotaSocial: socio.grupoFamiliar.cuotaGrupal,
            montoActividades,
            montoCasillero,
            montoTotal,
            detalle: 'Recibo único de Plan Grupo Familiar.',
          }),
        );
        generados++;
        continue;
      }

      const montoCuotaSocial = this.montoCuotaPorCategoria(socio.categoria, config);
      const montoActividades = socio.inscripciones
        .filter((i) => i.activa)
        .reduce((acc, i) => acc + Number(i.actividad.arancel), 0);
      const montoCasillero = socio.casillero ? Number(socio.casillero.costoMensual) : 0;
      const montoTotal = montoCuotaSocial + montoActividades + montoCasillero;

      await this.repo.save(
        this.repo.create({
          socio,
          periodo,
          zona: socio.zonaCobro,
          cobrador: await this.cobradorDeZona(socio.zonaCobro),
          montoCuotaSocial,
          montoActividades,
          montoCasillero,
          montoTotal,
        }),
      );
      generados++;
    }

    const reemitidos = await this.reemitirCuponesImpagosConRecargo(periodo, config.recargoMorosidad);

    return { generados, reemitidos, sociosSuspendidos: 0 };
  }

  /**
   * Al iniciar el nuevo mes se vuelven a emitir los cupones del mes
   * anterior que no se cobraron, con un recargo del 5% (R11). No se
   * reemiten los cupones de socios que ya pasaron a estado MOROSO (a
   * ellos se les deja de emitir cupón, según el enunciado).
   */
  private async reemitirCuponesImpagosConRecargo(periodoActual: string, recargoPorcentaje: number): Promise<number> {
    const periodoAnterior = DateUtils.periodoAnterior(periodoActual);
    const impagos = await this.repo.find({
      where: [
        { periodo: periodoAnterior, estado: EstadoCupon.PENDIENTE },
        { periodo: periodoAnterior, estado: EstadoCupon.DEVUELTO },
      ],
      relations: ['socio', 'cobrador', 'grupoFamiliar'],
    });

    let reemitidos = 0;
    for (const original of impagos) {
      if (original.socio.estado === EstadoSocio.MOROSO || original.socio.estado === EstadoSocio.SUSPENDIDO) {
        continue; // ya no se le emite cupón (regla de morosidad)
      }

      // Evita reemitir dos veces si el proceso se corre más de una vez.
      const yaReemitido = await this.repo.findOne({
        where: { socio: { id: original.socio.id }, periodo: periodoActual, esReemision: true },
      });
      if (yaReemitido) continue;

      const montoConRecargo = Number(original.montoTotal) * (1 + recargoPorcentaje / 100);

      await this.repo.save(
        this.repo.create({
          socio: original.socio,
          grupoFamiliar: original.grupoFamiliar,
          periodo: periodoActual,
          zona: original.zona,
          cobrador: original.cobrador,
          montoCuotaSocial: original.montoCuotaSocial,
          montoActividades: original.montoActividades,
          montoCasillero: original.montoCasillero,
          recargoPorcentaje: recargoPorcentaje,
          montoTotal: montoConRecargo,
          esReemision: true,
          detalle: `Reemisión del período ${periodoAnterior} impago, con recargo del ${recargoPorcentaje}%.`,
        }),
      );
      reemitidos++;
    }
    return reemitidos;
  }

  /**
   * Control de morosidad (R10): si un socio acumula 2 meses consecutivos
   * sin pagar, se lo marca MOROSO, se lo SUSPENDE en el uso de los
   * servicios del club y se deja de emitirle cupón de cobranza.
   */
  private async aplicarControlDeMorosidad(periodoNuevo: string): Promise<void> {
    const config = await this.configuracionService.getOrCreate();
    const periodoAnterior = DateUtils.periodoAnterior(periodoNuevo);

    const cuponesAnteriores = await this.repo.find({
      where: { periodo: periodoAnterior },
      relations: ['socio'],
    });

    for (const cupon of cuponesAnteriores) {
      const socio = await this.sociosRepo.findOne({ where: { id: cupon.socio.id } });
      if (!socio || socio.estado === EstadoSocio.BAJA) continue;

      const impago = cupon.estado === EstadoCupon.PENDIENTE || cupon.estado === EstadoCupon.DEVUELTO;

      if (impago) {
        socio.mesesImpagosConsecutivos += 1;
      } else {
        socio.mesesImpagosConsecutivos = 0;
      }

      if (socio.mesesImpagosConsecutivos >= config.mesesConsecutivosParaMorosidad) {
        socio.estado = EstadoSocio.SUSPENDIDO;
        this.logger.warn(
          `Socio #${socio.id} (${socio.apellido}, ${socio.nombre}) declarado moroso y suspendido ` +
            `por ${socio.mesesImpagosConsecutivos} meses consecutivos impagos.`,
        );
      }

      await this.sociosRepo.save(socio);
    }
  }

  private montoCuotaPorCategoria(categoria: CategoriaSocial, config: { cuotaCadete: number; cuotaActivo: number; cuotaVitalicio: number }): number {
    switch (categoria) {
      case CategoriaSocial.CADETE:
        return Number(config.cuotaCadete);
      case CategoriaSocial.VITALICIO:
        return Number(config.cuotaVitalicio);
      case CategoriaSocial.ACTIVO:
      default:
        return Number(config.cuotaActivo);
    }
  }

  private async cobradorDeZona(zona: ZonaCobro): Promise<Cobrador | null> {
    if (zona === ZonaCobro.ZONA_0) return null;
    return this.cobradoresRepo.findOne({ where: { zona } });
  }

  private async sumarActividadesDelGrupo(grupoId: number): Promise<number> {
    const integrantes = await this.sociosRepo.find({
      where: { grupoFamiliar: { id: grupoId } },
      relations: ['inscripciones', 'inscripciones.actividad'],
    });
    return integrantes.reduce(
      (acc, s) => acc + s.inscripciones.filter((i) => i.activa).reduce((a, i) => a + Number(i.actividad.arancel), 0),
      0,
    );
  }

  private async sumarCasillerosDelGrupo(grupoId: number): Promise<number> {
    const integrantes = await this.sociosRepo.find({
      where: { grupoFamiliar: { id: grupoId } },
      relations: ['casillero'],
    });
    return integrantes.reduce((acc, s) => acc + (s.casillero ? Number(s.casillero.costoMensual) : 0), 0);
  }

  /** Cupones pendientes de una zona, usados por RendicionesService al armar la planilla semanal. */
  async findPendientesPorCobrador(cobradorId: number): Promise<Cupon[]> {
    return this.repo.find({
      where: { cobrador: { id: cobradorId }, estado: EstadoCupon.PENDIENTE },
      relations: ['socio'],
    });
  }

  async marcarComoDevuelto(id: number): Promise<Cupon> {
    const cupon = await this.findOne(id);
    cupon.estado = EstadoCupon.DEVUELTO;
    return this.repo.save(cupon);
  }
}
