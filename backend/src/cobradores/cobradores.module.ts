import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cobrador } from './entities/cobrador.entity';
import { CobradoresService } from './cobradores.service';
import { CobradoresController } from './cobradores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cobrador])],
  controllers: [CobradoresController],
  providers: [CobradoresService],
  exports: [CobradoresService],
})
export class CobradoresModule {}
