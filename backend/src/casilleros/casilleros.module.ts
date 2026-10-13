import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Casillero } from './entities/casillero.entity';
import { Socio } from '../socios/entities/socio.entity';
import { CasillerosService } from './casilleros.service';
import { CasillerosController } from './casilleros.controller';
import { ConfiguracionModule } from '../configuracion/configuracion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Casillero, Socio]), ConfiguracionModule],
  controllers: [CasillerosController],
  providers: [CasillerosService],
  exports: [CasillerosService],
})
export class CasillerosModule {}
