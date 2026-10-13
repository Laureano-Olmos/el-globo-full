import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existente = await this.repo.findOne({ where: { email: dto.email } });
    if (existente) {
      throw new BadRequestException('Ya existe un usuario con ese correo electrónico.');
    }

    if (dto.role === Role.SOCIO && !dto.socioId) {
      throw new BadRequestException('Un usuario SOCIO debe estar vinculado a un socioId.');
    }
    if (dto.role === Role.INSTRUCTOR && !dto.instructorId) {
      throw new BadRequestException('Un usuario INSTRUCTOR debe estar vinculado a un instructorId.');
    }
    if (dto.role === Role.COBRADOR && !dto.cobradorId) {
      throw new BadRequestException('Un usuario COBRADOR debe estar vinculado a un cobradorId.');
    }

    const user = this.repo.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      role: dto.role,
      socio: dto.socioId ? ({ id: dto.socioId } as any) : null,
      instructor: dto.instructorId ? ({ id: dto.instructorId } as any) : null,
      cobrador: dto.cobradorId ? ({ id: dto.cobradorId } as any) : null,
    });

    return this.repo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.repo.find({ relations: ['socio', 'instructor', 'cobrador'] });
  }

  async deactivate(id: number): Promise<User> {
    const user = await this.repo.findOneByOrFail({ id });
    user.activo = false;
    return this.repo.save(user);
  }
}
