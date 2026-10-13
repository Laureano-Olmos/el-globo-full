import { Injectable } from '@nestjs/common';
import { SociosService } from '../socios/socios.service';
import { ActividadesService } from '../actividades/actividades.service';
import { CasillerosService } from '../casilleros/casilleros.service';
import { QuerySocioDto } from '../socios/dto/query-socio.dto';
import { QueryCasilleroDto } from '../casilleros/dto/query-casillero.dto';

/**
 * Concentra los 3 listados de salida pedidos explícitamente por el
 * enunciado del club:
 *  1) Listado de socios (alfabético, número, zona, categoría, antigüedad).
 *  2) Listado por actividad y horario, como registro de asistencia.
 *  3) Listado de socios que ocupan casillero (alfabético o por número).
 */
@Injectable()
export class ReportesService {
  constructor(
    private readonly sociosService: SociosService,
    private readonly actividadesService: ActividadesService,
    private readonly casillerosService: CasillerosService,
  ) {}

  listadoSocios(query: QuerySocioDto) {
    return this.sociosService.findAll(query);
  }

  listadoAsistenciaPorActividad() {
    return this.actividadesService.listadoAsistencia();
  }

  listadoCasilleros(query: QueryCasilleroDto) {
    return this.casillerosService.findAll(query);
  }
}
