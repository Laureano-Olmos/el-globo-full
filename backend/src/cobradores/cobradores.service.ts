import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cobrador } from './entities/cobrador.entity';
import { CreateCobradorDto } from './dto/create-cobrador.dto';
import { UpdateCobradorDto } from './dto/update-cobrador.dto';
import { ZonaCobro } from '../common/enums/zona-cobro.enum';

@Injectable()
export class CobradoresService {
  constructor(@InjectRepository(Cobrador) private readonly repo: Repository<Cobrador>) {}

  /** Un cobrador por zona (Sr. Pérez=Zona 1, Sr. García=Zona 2, Sr. Rodríguez=Zona 3). */
  async create(dto: CreateCobradorDto): Promise<Cobrador> {
    if (dto.zona === ZonaCobro.ZONA_0) {
      throw new BadRequestException('La Zona 0 corresponde a pagos en el club y no tiene cobrador asignado.');
    }
    const existenteZona = await this.repo.findOne({ where: { zona: dto.zona } });
    if (existenteZona) {
      throw new ConflictException(`La zona ${dto.zona} ya tiene un cobrador asignado.`);
    }
    const existenteCorreo = await this.repo.findOne({ where: { correo: dto.correo } });
    if (existenteCorreo) {
      throw new ConflictException(`Ya existe un cobrador con el correo ${dto.correo}.`);
    }
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Cobrador[]> {
    return this.repo.find({ order: { zona: 'ASC' } });
  }

  async findOne(id: number): Promise<Cobrador> {
    const cobrador = await this.repo.findOne({ where: { id } });
    if (!cobrador) {
      throw new NotFoundException(`No existe un cobrador con id ${id}.`);
    }
    return cobrador;
  }

  async update(id: number, dto: UpdateCobradorDto): Promise<Cobrador> {
    const cobrador = await this.findOne(id);
    Object.assign(cobrador, dto);
    return this.repo.save(cobrador);
  }

  async remove(id: number): Promise<{ message: string }> {
    const cobrador = await this.findOne(id);
    await this.repo.remove(cobrador);
    return { message: `El cobrador ${cobrador.apellido}, ${cobrador.nombre} fue eliminado.` };
  }
}
