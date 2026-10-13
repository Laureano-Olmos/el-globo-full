import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './entities/configuracion.entity';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';

/**
 * Administra la fila única de parámetros del sistema, creándola con los
 * valores por defecto del enunciado si todavía no existe.
 */
@Injectable()
export class ConfiguracionService implements OnModuleInit {
  constructor(
    @InjectRepository(Configuracion)
    private readonly repo: Repository<Configuracion>,
  ) {}

  async onModuleInit() {
    await this.getOrCreate();
  }

  async getOrCreate(): Promise<Configuracion> {
    let config = await this.repo.findOne({ where: {} });
    if (!config) {
      config = this.repo.create();
      config = await this.repo.save(config);
    }
    return config;
  }

  async update(dto: UpdateConfiguracionDto): Promise<Configuracion> {
    const config = await this.getOrCreate();
    Object.assign(config, dto);
    return this.repo.save(config);
  }
}
