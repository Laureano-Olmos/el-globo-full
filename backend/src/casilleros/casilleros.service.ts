import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Casillero } from './entities/casillero.entity';
import { CreateCasilleroDto } from './dto/create-casillero.dto';
import { QueryCasilleroDto } from './dto/query-casillero.dto';
import { OrdenCasillero } from '../common/enums/orden-casillero.enum';
import { Socio } from '../socios/entities/socio.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Injectable()
export class CasillerosService {
  constructor(
    @InjectRepository(Casillero) private readonly repo: Repository<Casillero>,
    @InjectRepository(Socio) private readonly sociosRepo: Repository<Socio>,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  /** Alta manual de un casillero individual (uso administrativo puntual). */
  async create(dto: CreateCasilleroDto): Promise<Casillero> {
    const config = await this.configuracionService.getOrCreate();
    const total = await this.repo.count();
    if (total >= config.totalCasilleros) {
      throw new BadRequestException(`El club dispone de un total de ${config.totalCasilleros} casilleros.`);
    }
    const existente = await this.repo.findOne({ where: { numero: dto.numero } });
    if (existente) {
      throw new ConflictException(`Ya existe el casillero número ${dto.numero}.`);
    }
    return this.repo.save(
      this.repo.create({ numero: dto.numero, costoMensual: dto.costoMensual ?? config.costoCasillero }),
    );
  }

  /** Listado de socios que ocupan casillero (alfabético o por número, según el enunciado). */
  async findAll(query: QueryCasilleroDto): Promise<Casillero[]> {
    const qb = this.repo.createQueryBuilder('casillero').leftJoinAndSelect('casillero.socio', 'socio');

    if (query.orden === OrdenCasillero.ALFABETICO) {
      qb.orderBy('socio.apellido', 'ASC', 'NULLS LAST').addOrderBy('socio.nombre', 'ASC');
    } else {
      qb.orderBy('casillero.numero', 'ASC');
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Casillero> {
    const casillero = await this.repo.findOne({ where: { id }, relations: ['socio'] });
    if (!casillero) {
      throw new NotFoundException(`No existe un casillero con id ${id}.`);
    }
    return casillero;
  }

  /** Alquilar un casillero disponible a un socio (relación 1:1). */
  async alquilar(casilleroId: number, socioId: number): Promise<Casillero> {
    const casillero = await this.findOne(casilleroId);
    if (casillero.socio) {
      throw new ConflictException(`El casillero ${casillero.numero} ya está alquilado.`);
    }

    const socioConCasillero = await this.repo.findOne({ where: { socio: { id: socioId } } });
    if (socioConCasillero) {
      throw new ConflictException('El socio ya tiene un casillero alquilado.');
    }

    const socio = await this.sociosRepo.findOne({ where: { id: socioId } });
    if (!socio) {
      throw new NotFoundException(`No existe un socio con id ${socioId}.`);
    }

    casillero.socio = socio;
    casillero.fechaAlquiler = new Date();
    return this.repo.save(casillero);
  }

  /** Libera el casillero (el socio deja de pagarlo en el próximo cupón). */
  async liberar(casilleroId: number): Promise<Casillero> {
    const casillero = await this.findOne(casilleroId);
    casillero.socio = null;
    casillero.fechaAlquiler = null;
    return this.repo.save(casillero);
  }
}
