import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cupon } from './entities/cupon.entity';
import { Socio } from '../socios/entities/socio.entity';
import { Cobrador } from '../cobradores/entities/cobrador.entity';
import { CuponesService } from './cupones.service';
import { CuponesController } from './cupones.controller';
import { CuponesScheduler } from './cupones.scheduler';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { SociosModule } from '../socios/socios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cupon, Socio, Cobrador]), ConfiguracionModule, SociosModule],
  controllers: [CuponesController],
  providers: [CuponesService, CuponesScheduler],
  exports: [CuponesService],
})
export class CuponesModule {}
