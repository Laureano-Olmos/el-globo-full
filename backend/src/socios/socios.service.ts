import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Socio } from './entities/socio.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { CreateSocioDto } from './dto/create-socio.dto';
import { UpdateSocioDto } from './dto/update-socio.dto';
import { QuerySocioDto } from './dto/query-socio.dto';
import { OrdenSocio } from '../common/enums/orden-socio.enum';
import { EstadoSocio } from '../common/enums/estado-socio.enum';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { calcularCategoriaSocial } from '../common/utils/categoria.utils';

@Injectable()
export class SociosService {
  constructor(
    @InjectRepository(Socio) private readonly repo: Repository<Socio>,
    private readonly configuracionService: ConfiguracionService,
    private readonly dataSource: DataSource,
  ) {}

  /** ABMC de socios (R3), validando unicidad de DNI y correo. */
  async create(dto: CreateSocioDto): Promise<Socio> {
    await this.assertDniYEmailDisponibles(dto.dni, dto.email);

    const fechaNacimiento = new Date(dto.fechaNacimiento);
    const fechaAlta = dto.fechaAlta ? new Date(dto.fechaAlta) : new Date();
    const categoria = await this.calcularCategoria(fechaNacimiento, fechaAlta);

    const { passwordInicial, ...datosSocio } = dto;
    return this.dataSource.transaction(async (manager) => {
      const usuarios = manager.getRepository(User);
      if (await usuarios.findOne({ where: { email: dto.email } })) {
        throw new ConflictException(`Ya existe un usuario con el correo ${dto.email}.`);
      }

      const socios = manager.getRepository(Socio);
      const socio = await socios.save(socios.create({
        ...datosSocio,
        fechaNacimiento,
        fechaAlta,
        categoria,
        estado: EstadoSocio.ACTIVO,
      }));

      const usuario = usuarios.create({
        email: socio.email,
        password: await bcrypt.hash(passwordInicial, 10),
        role: Role.SOCIO,
        socio,
      });
      await usuarios.save(usuario);
      return socio;
    });
  }

  async findAll(query: QuerySocioDto): Promise<Socio[]> {
    const qb = this.repo
      .createQueryBuilder('socio')
      .leftJoinAndSelect('socio.casillero', 'casillero')
      .leftJoinAndSelect('socio.grupoFamiliar', 'grupoFamiliar')
      .leftJoinAndSelect('socio.inscripciones', 'inscripciones')
      .leftJoinAndSelect('inscripciones.actividad', 'actividad');

    if (query.categoria) qb.andWhere('socio.categoria = :categoria', { categoria: query.categoria });
    if (query.zonaCobro !== undefined) qb.andWhere('socio.zonaCobro = :zona', { zona: query.zonaCobro });
    if (query.estado) qb.andWhere('socio.estado = :estado', { estado: query.estado });
    if (query.buscar) {
      qb.andWhere(
        '(socio.nombre ILIKE :buscar OR socio.apellido ILIKE :buscar OR socio.dni ILIKE :buscar)',
        { buscar: `%${query.buscar}%` },
      );
    }

    this.aplicarOrden(qb, query.orden);

    return qb.getMany();
  }

  private aplicarOrden(qb: SelectQueryBuilder<Socio>, orden?: OrdenSocio) {
    switch (orden) {
      case OrdenSocio.NUMERO:
        qb.orderBy('socio.id', 'ASC');
        break;
      case OrdenSocio.ZONA:
        qb.orderBy('socio.zonaCobro', 'ASC').addOrderBy('socio.apellido', 'ASC');
        break;
      case OrdenSocio.CATEGORIA:
        qb.orderBy('socio.categoria', 'ASC').addOrderBy('socio.apellido', 'ASC');
        break;
      case OrdenSocio.ANTIGUEDAD:
        qb.orderBy('socio.fechaAlta', 'ASC');
        break;
      case OrdenSocio.ALFABETICO:
      default:
        qb.orderBy('socio.apellido', 'ASC').addOrderBy('socio.nombre', 'ASC');
        break;
    }
  }

  async findOne(id: number): Promise<Socio> {
    const socio = await this.repo.findOne({
      where: { id },
      relations: [
        'casillero',
        'grupoFamiliar',
        'grupoFamiliar.integrantes',
        'inscripciones',
        'inscripciones.actividad',
        'cupones',
      ],
    });
    if (!socio) {
      throw new NotFoundException(`No existe un socio con id ${id}.`);
    }
    return socio;
  }

  async update(id: number, dto: UpdateSocioDto): Promise<Socio> {
    const socio = await this.findOne(id);

    if (dto.dni || dto.email) {
      await this.assertDniYEmailDisponibles(dto.dni ?? socio.dni, dto.email ?? socio.email, id);
    }

    Object.assign(socio, {
      ...dto,
      fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : socio.fechaNacimiento,
      fechaAlta: dto.fechaAlta ? new Date(dto.fechaAlta) : socio.fechaAlta,
    });

    // Recalcula la categoría automáticamente si cambió edad/antigüedad relevante.
    socio.categoria = await this.calcularCategoria(socio.fechaNacimiento, socio.fechaAlta);

    return this.repo.save(socio);
  }

  /** Baja de socio (CUD-27): baja lógica para preservar el historial de cupones. */
  async remove(id: number): Promise<{ message: string }> {
    const socio = await this.findOne(id);
    socio.estado = EstadoSocio.BAJA;
    await this.repo.save(socio);
    return { message: `El socio ${socio.apellido}, ${socio.nombre} fue dado de baja.` };
  }

  /** Recalcula la categoría de todos los socios activos (usado por el scheduler mensual). */
  async recalcularCategoriasDeTodos(): Promise<void> {
    const socios = await this.repo.find({ where: { estado: EstadoSocio.ACTIVO } });
    const config = await this.configuracionService.getOrCreate();
    for (const socio of socios) {
      socio.categoria = calcularCategoriaSocial(socio.fechaNacimiento, socio.fechaAlta, config);
    }
    await this.repo.save(socios);
  }

  private async calcularCategoria(fechaNacimiento: Date, fechaAlta: Date) {
    const config = await this.configuracionService.getOrCreate();
    return calcularCategoriaSocial(fechaNacimiento, fechaAlta, config);
  }

  private async assertDniYEmailDisponibles(dni: string, email: string, ignorarId?: number) {
    const existente = await this.repo
      .createQueryBuilder('socio')
      .where('(socio.dni = :dni OR socio.email = :email)', { dni, email })
      .andWhere(ignorarId ? 'socio.id != :ignorarId' : '1=1', { ignorarId })
      .getOne();

    if (existente) {
      if (existente.dni === dni) {
        throw new ConflictException(`Ya existe un socio con el DNI ${dni}.`);
      }
      throw new ConflictException(`Ya existe un socio con el correo ${email}.`);
    }
  }

  /** Usado internamente por otros módulos (cupones, casilleros, grupos familiares). */
  async findByIdOrFail(id: number): Promise<Socio> {
    return this.findOne(id);
  }

  async marcarMoroso(socio: Socio): Promise<Socio> {
    if (socio.estado !== EstadoSocio.BAJA) {
      socio.estado = EstadoSocio.MOROSO;
    }
    return this.repo.save(socio);
  }

  async suspender(socio: Socio): Promise<Socio> {
    socio.estado = EstadoSocio.SUSPENDIDO;
    return this.repo.save(socio);
  }

  async reactivar(id: number): Promise<Socio> {
    const socio = await this.findOne(id);
    if (socio.estado === EstadoSocio.BAJA) {
      throw new BadRequestException('No se puede reactivar a un socio dado de baja; debe darse de alta nuevamente.');
    }
    socio.estado = EstadoSocio.ACTIVO;
    socio.mesesImpagosConsecutivos = 0;
    return this.repo.save(socio);
  }

  async save(socio: Socio): Promise<Socio> {
    return this.repo.save(socio);
  }
}
