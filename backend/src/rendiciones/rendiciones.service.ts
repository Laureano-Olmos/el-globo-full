import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rendicion } from './entities/rendicion.entity';
import { RendicionDetalle } from './entities/rendicion-detalle.entity';
import { CreateRendicionDto } from './dto/create-rendicion.dto';
import { Cobrador } from '../cobradores/entities/cobrador.entity';
import { Cupon } from '../cupones/entities/cupon.entity';
import { EstadoCupon } from '../common/enums/estado-cupon.enum';

@Injectable()
export class RendicionesService {
  constructor(
    @InjectRepository(Rendicion) private readonly repo: Repository<Rendicion>,
    @InjectRepository(Cobrador) private readonly cobradoresRepo: Repository<Cobrador>,
    @InjectRepository(Cupon) private readonly cuponesRepo: Repository<Cupon>,
  ) {}

  /**
   * Rendición semanal del cobrador (R9). Calcula automáticamente el 10%
   * (configurable) de comisión sobre lo efectivamente recaudado. Si es la
   * última semana del mes, los cupones no cobrados se marcan como
   * DEVUELTO (el cobrador devuelve esos cupones de los socios que no
   * pagaron, según el enunciado).
   */
  async create(dto: CreateRendicionDto): Promise<Rendicion> {
    const cobrador = await this.cobradoresRepo.findOne({ where: { id: dto.cobradorId } });
    if (!cobrador) {
      throw new NotFoundException(`No existe un cobrador con id ${dto.cobradorId}.`);
    }

    const detalles: RendicionDetalle[] = [];
    let montoRecaudado = 0;

    for (const item of dto.detalles) {
      const cupon = await this.cuponesRepo.findOne({ where: { id: item.cuponId }, relations: ['cobrador'] });
      if (!cupon) {
        throw new NotFoundException(`No existe un cupón con id ${item.cuponId}.`);
      }
      if (cupon.cobrador?.id !== dto.cobradorId) {
        throw new BadRequestException(`El cupón ${cupon.id} no pertenece a la zona de este cobrador.`);
      }

      const cobrado = item.cobrado ?? item.importeCobrado > 0;
      if (cobrado) {
        cupon.estado = EstadoCupon.PAGADO;
        cupon.fechaPago = new Date();
        montoRecaudado += item.importeCobrado;
      } else if (dto.esUltimaSemanaDelMes) {
        cupon.estado = EstadoCupon.DEVUELTO;
      }
      await this.cuponesRepo.save(cupon);

      const detalle = new RendicionDetalle();
      detalle.cupon = cupon;
      detalle.importeCobrado = item.importeCobrado;
      detalle.cobrado = cobrado;
      detalles.push(detalle);
    }

    const comisionCalculada = montoRecaudado * (Number(cobrador.comisionPorcentaje) / 100);
    const montoNeto = montoRecaudado - comisionCalculada;

    const rendicion = this.repo.create({
      cobrador,
      semanaInicio: new Date(dto.semanaInicio),
      semanaFin: new Date(dto.semanaFin),
      montoRecaudado,
      comisionCalculada,
      montoNeto,
      esUltimaSemanaDelMes: dto.esUltimaSemanaDelMes ?? false,
      detalles,
    });

    return this.repo.save(rendicion);
  }

  findAll(cobradorId?: number): Promise<Rendicion[]> {
    return this.repo.find({
      where: cobradorId ? { cobrador: { id: cobradorId } } : {},
      relations: ['cobrador', 'detalles', 'detalles.cupon', 'detalles.cupon.socio'],
      order: { fechaRendicion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Rendicion> {
    const rendicion = await this.repo.findOne({
      where: { id },
      relations: ['cobrador', 'detalles', 'detalles.cupon', 'detalles.cupon.socio'],
    });
    if (!rendicion) {
      throw new NotFoundException(`No existe una rendición con id ${id}.`);
    }
    return rendicion;
  }
}
