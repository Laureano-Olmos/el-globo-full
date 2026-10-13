import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rendicion } from './entities/rendicion.entity';
import { RendicionDetalle } from './entities/rendicion-detalle.entity';
import { Cobrador } from '../cobradores/entities/cobrador.entity';
import { Cupon } from '../cupones/entities/cupon.entity';
import { RendicionesService } from './rendiciones.service';
import { RendicionesController } from './rendiciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rendicion, RendicionDetalle, Cobrador, Cupon])],
  controllers: [RendicionesController],
  providers: [RendicionesService],
  exports: [RendicionesService],
})
export class RendicionesModule {}
