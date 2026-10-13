import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { SociosModule } from '../socios/socios.module';
import { ActividadesModule } from '../actividades/actividades.module';
import { CasillerosModule } from '../casilleros/casilleros.module';

@Module({
  imports: [SociosModule, ActividadesModule, CasillerosModule],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
