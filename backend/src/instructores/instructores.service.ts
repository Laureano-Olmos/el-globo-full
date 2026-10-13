import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Injectable()
export class InstructoresService {
  constructor(@InjectRepository(Instructor) private readonly repo: Repository<Instructor>) {}

  async create(dto: CreateInstructorDto): Promise<Instructor> {
    const existente = await this.repo.findOne({ where: { email: dto.email } });
    if (existente) {
      throw new ConflictException(`Ya existe un instructor con el correo ${dto.email}.`);
    }
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<Instructor[]> {
    return this.repo.find({ relations: ['actividades'], order: { apellido: 'ASC' } });
  }

  async findOne(id: number): Promise<Instructor> {
    const instructor = await this.repo.findOne({ where: { id }, relations: ['actividades'] });
    if (!instructor) {
      throw new NotFoundException(`No existe un instructor con id ${id}.`);
    }
    return instructor;
  }

  async update(id: number, dto: UpdateInstructorDto): Promise<Instructor> {
    const instructor = await this.findOne(id);
    Object.assign(instructor, dto);
    return this.repo.save(instructor);
  }

  async remove(id: number): Promise<{ message: string }> {
    const instructor = await this.findOne(id);
    await this.repo.remove(instructor);
    return { message: `El instructor ${instructor.apellido}, ${instructor.nombre} fue eliminado.` };
  }
}
