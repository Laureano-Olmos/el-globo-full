import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida credenciales (correo/clave) y redirige según el rol asociado
   * (R1: administrador -> gestión global, cobrador -> cupones, instructor
   * -> actividades, socio -> panel personal).
   */
  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email },
      relations: ['socio', 'instructor', 'cobrador'],
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        activo: true,
      },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo.');
    }

    const passwordValida = await bcrypt.compare(dto.password, user.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const payload: AuthenticatedUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      socioId: user.socio?.id ?? null,
      instructorId: user.instructor?.id ?? null,
      cobradorId: user.cobrador?.id ?? null,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const passwordValida = await bcrypt.compare(dto.passwordActual, user.password);
    if (!passwordValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    }

    user.password = await bcrypt.hash(dto.passwordNueva, 10);
    await this.usersRepo.save(user);
    return { message: 'Contraseña actualizada correctamente.' };
  }

  async me(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['socio', 'instructor', 'cobrador'],
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }
    return user;
  }
}
