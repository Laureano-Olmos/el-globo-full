import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Instructor } from './entities/instructor.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Injectable()
export class InstructoresService {
  constructor(
    @InjectRepository(Instructor) private readonly repo: Repository<Instructor>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateInstructorDto): Promise<Instructor> {
    const existente = await this.repo.findOne({ where: { email: dto.email } });
    if (existente) {
      throw new ConflictException(`Ya existe un instructor con el correo ${dto.email}.`);
    }
    const { passwordInicial, ...datos } = dto;
    return this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      if (await users.findOne({ where: { email: dto.email } })) {
        throw new ConflictException(`Ya existe un usuario con el correo ${dto.email}.`);
      }
      const instructores = manager.getRepository(Instructor);
      const instructor = await instructores.save(instructores.create(datos));
      await users.save(users.create({
        email: instructor.email,
        password: await bcrypt.hash(passwordInicial, 10),
        role: Role.INSTRUCTOR,
        instructor,
      }));
      return instructor;
    });
  }

  findAll(): Promise<Instructor[]> {
    return this.repo.find({ relations: ['actividades', 'user'], order: { apellido: 'ASC' } });
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
    return this.dataSource.transaction(async (manager) => {
      const { passwordInicial, ...datos } = dto;
      Object.assign(instructor, datos);
      const saved = await manager.getRepository(Instructor).save(instructor);
      const users = manager.getRepository(User);
      let user = await users.findOne({ where: { instructor: { id } } });
      const conflict = await users.findOne({ where: { email: saved.email } });
      if (conflict && conflict.id !== user?.id) {
        throw new ConflictException(`Ya existe un usuario con el correo ${saved.email}.`);
      }
      if (user) {
        user.email = saved.email;
        if (passwordInicial) user.password = await bcrypt.hash(passwordInicial, 10);
        await users.save(user);
      } else if (passwordInicial) {
        user = users.create({
          email: saved.email,
          password: await bcrypt.hash(passwordInicial, 10),
          role: Role.INSTRUCTOR,
          instructor: saved,
        });
        await users.save(user);
      }
      return saved;
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const instructor = await this.findOne(id);
    await this.repo.remove(instructor);
    return { message: `El instructor ${instructor.apellido}, ${instructor.nombre} fue eliminado.` };
  }
}
