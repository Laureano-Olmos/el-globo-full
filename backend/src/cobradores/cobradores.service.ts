import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cobrador } from './entities/cobrador.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/role.enum';
import { CreateCobradorDto } from './dto/create-cobrador.dto';
import { UpdateCobradorDto } from './dto/update-cobrador.dto';
import { ZonaCobro } from '../common/enums/zona-cobro.enum';

@Injectable()
export class CobradoresService {
  constructor(
    @InjectRepository(Cobrador) private readonly repo: Repository<Cobrador>,
    private readonly dataSource: DataSource,
  ) {}

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
    const { passwordInicial, ...datos } = dto;
    return this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      if (await users.findOne({ where: { email: dto.correo } })) {
        throw new ConflictException(`Ya existe un usuario con el correo ${dto.correo}.`);
      }
      const cobradores = manager.getRepository(Cobrador);
      const cobrador = await cobradores.save(cobradores.create(datos));
      await users.save(users.create({
        email: cobrador.correo,
        password: await bcrypt.hash(passwordInicial, 10),
        role: Role.COBRADOR,
        cobrador,
      }));
      return cobrador;
    });
  }

  findAll(): Promise<Cobrador[]> {
    return this.repo.find({ relations: ['user'], order: { zona: 'ASC' } });
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
    return this.dataSource.transaction(async (manager) => {
      const { passwordInicial, ...datos } = dto;
      Object.assign(cobrador, datos);
      const saved = await manager.getRepository(Cobrador).save(cobrador);
      const users = manager.getRepository(User);
      let user = await users.findOne({ where: { cobrador: { id } } });
      const conflict = await users.findOne({ where: { email: saved.correo } });
      if (conflict && conflict.id !== user?.id) {
        throw new ConflictException(`Ya existe un usuario con el correo ${saved.correo}.`);
      }
      if (user) {
        user.email = saved.correo;
        if (passwordInicial) user.password = await bcrypt.hash(passwordInicial, 10);
        await users.save(user);
      } else if (passwordInicial) {
        user = users.create({
          email: saved.correo,
          password: await bcrypt.hash(passwordInicial, 10),
          role: Role.COBRADOR,
          cobrador: saved,
        });
        await users.save(user);
      }
      return saved;
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const cobrador = await this.findOne(id);
    await this.repo.remove(cobrador);
    return { message: `El cobrador ${cobrador.apellido}, ${cobrador.nombre} fue eliminado.` };
  }
}
