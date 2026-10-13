import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividad } from './entities/actividad.entity';
import { ActividadesService } from './actividades.service';
import { ActividadesController } from './actividades.controller';
import { ConfiguracionModule } from '../configuracion/configuracion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad]), ConfiguracionModule],
  controllers: [ActividadesController],
  providers: [ActividadesService],
  exports: [ActividadesService],
})
export class ActividadesModule {}
