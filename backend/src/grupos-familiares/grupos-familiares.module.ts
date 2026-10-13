import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrupoFamiliar } from './entities/grupo-familiar.entity';
import { Socio } from '../socios/entities/socio.entity';
import { GruposFamiliaresService } from './grupos-familiares.service';
import { GruposFamiliaresController } from './grupos-familiares.controller';
import { ConfiguracionModule } from '../configuracion/configuracion.module';

@Module({
  imports: [TypeOrmModule.forFeature([GrupoFamiliar, Socio]), ConfiguracionModule],
  controllers: [GruposFamiliaresController],
  providers: [GruposFamiliaresService],
  exports: [GruposFamiliaresService],
})
export class GruposFamiliaresModule {}
