import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inscripcion } from './entities/inscripcion.entity';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { Socio } from '../socios/entities/socio.entity';
import { Actividad } from '../actividades/entities/actividad.entity';
import { EstadoSocio } from '../common/enums/estado-socio.enum';

@Injectable()
export class InscripcionesService {
  constructor(
    @InjectRepository(Inscripcion) private readonly repo: Repository<Inscripcion>,
    @InjectRepository(Socio) private readonly sociosRepo: Repository<Socio>,
    @InjectRepository(Actividad) private readonly actividadesRepo: Repository<Actividad>,
  ) {}

  /** Inscribirse en una actividad deportiva (CUD-06). Algunos socios están anotados en diversas actividades. */
  async inscribir(dto: CreateInscripcionDto): Promise<Inscripcion> {
    const socio = await this.sociosRepo.findOne({ where: { id: dto.socioId } });
    if (!socio) throw new NotFoundException(`No existe un socio con id ${dto.socioId}.`);
    if (socio.estado === EstadoSocio.SUSPENDIDO || socio.estado === EstadoSocio.BAJA) {
      throw new BadRequestException('El socio no puede inscribirse en actividades: está suspendido o dado de baja.');
    }

    const actividad = await this.actividadesRepo.findOne({
      where: { id: dto.actividadId },
      relations: ['inscripciones'],
    });
    if (!actividad) throw new NotFoundException(`No existe una actividad con id ${dto.actividadId}.`);
    if (!actividad.activa) throw new BadRequestException('La actividad no se encuentra disponible.');

    const existente = await this.repo.findOne({
      where: { socio: { id: dto.socioId }, actividad: { id: dto.actividadId } },
    });
    if (existente) {
      throw new ConflictException('El socio ya está inscripto en esa actividad.');
    }

    if (actividad.cupoMaximo) {
      const inscriptosActivos = actividad.inscripciones.filter((i) => i.activa).length;
      if (inscriptosActivos >= actividad.cupoMaximo) {
        throw new BadRequestException('La actividad alcanzó su cupo máximo de inscriptos.');
      }
    }

    const inscripcion = this.repo.create({ socio, actividad });
    return this.repo.save(inscripcion);
  }

  /** Darse de baja de una actividad deportiva (CUD-07). */
  async darDeBaja(id: number): Promise<{ message: string }> {
    const inscripcion = await this.repo.findOne({
      where: { id },
      relations: ['socio', 'actividad'],
    });
    if (!inscripcion) {
      throw new NotFoundException(`No existe una inscripción con id ${id}.`);
    }
    await this.repo.remove(inscripcion);
    return {
      message: `${inscripcion.socio.apellido}, ${inscripcion.socio.nombre} fue dado de baja de "${inscripcion.actividad.nombre}".`,
    };
  }

  findPorActividad(actividadId: number): Promise<Inscripcion[]> {
    return this.repo.find({
      where: { actividad: { id: actividadId }, activa: true },
      relations: ['socio'],
      order: { socio: { apellido: 'ASC' } },
    });
  }

  findPorSocio(socioId: number): Promise<Inscripcion[]> {
    return this.repo.find({
      where: { socio: { id: socioId } },
      relations: ['actividad'],
    });
  }
}
