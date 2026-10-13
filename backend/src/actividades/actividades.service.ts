import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Actividad } from './entities/actividad.entity';
import { CreateActividadDto } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(Actividad) private readonly repo: Repository<Actividad>,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  /** Registro de actividades (R5). El club ofrece un máximo configurable (20 por defecto). */
  async create(dto: CreateActividadDto): Promise<Actividad> {
    const config = await this.configuracionService.getOrCreate();
    const totalActuales = await this.repo.count();
    if (totalActuales >= config.totalActividades) {
      throw new BadRequestException(
        `El club tiene un máximo configurado de ${config.totalActividades} actividades deportivas.`,
      );
    }

    const actividad = this.repo.create({
      ...dto,
      instructor: dto.instructorId ? ({ id: dto.instructorId } as any) : null,
    });
    return this.repo.save(actividad);
  }

  /** Vitrina pública de actividades (Invitado / Usuario Externo, CUD-01). */
  findAll(soloActivas = false): Promise<Actividad[]> {
    return this.repo.find({
      where: soloActivas ? { activa: true } : {},
      relations: ['instructor'],
      order: { turno: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Actividad> {
    const actividad = await this.repo.findOne({
      where: { id },
      relations: ['instructor', 'inscripciones', 'inscripciones.socio'],
    });
    if (!actividad) {
      throw new NotFoundException(`No existe una actividad con id ${id}.`);
    }
    return actividad;
  }

  async update(id: number, dto: UpdateActividadDto): Promise<Actividad> {
    const actividad = await this.findOne(id);
    Object.assign(actividad, {
      ...dto,
      instructor: dto.instructorId ? ({ id: dto.instructorId } as any) : actividad.instructor,
    });
    return this.repo.save(actividad);
  }

  async remove(id: number): Promise<{ message: string }> {
    const actividad = await this.findOne(id);
    actividad.activa = false;
    await this.repo.save(actividad);
    return { message: `La actividad "${actividad.nombre}" fue dada de baja.` };
  }

  /**
   * Listado ordenado por actividad deportiva y horario con los socios que
   * la practican, usado como registro de asistencia por los instructores.
   */
  async listadoAsistencia(): Promise<Actividad[]> {
    return this.repo.find({
      relations: ['instructor', 'inscripciones', 'inscripciones.socio'],
      where: { activa: true },
      order: { turno: 'ASC', horaInicio: 'ASC', nombre: 'ASC' },
    });
  }
}
