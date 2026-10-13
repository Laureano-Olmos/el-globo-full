import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { QuerySocioDto } from '../socios/dto/query-socio.dto';
import { QueryCasilleroDto } from '../casilleros/dto/query-casillero.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Reportes')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  /** Listado de socios con todos sus datos, en el orden solicitado. */
  @Get('socios')
  @Roles(Role.ADMIN, Role.COBRADOR)
  socios(@Query() query: QuerySocioDto) {
    return this.service.listadoSocios(query);
  }

  /** Listado ordenado por actividad y horario, para asistencia de instructores. */
  @Get('asistencia-actividades')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  asistencia() {
    return this.service.listadoAsistenciaPorActividad();
  }

  /** Listado de socios que ocupan casillero, alfabético o por número. */
  @Get('casilleros')
  @Roles(Role.ADMIN)
  casilleros(@Query() query: QueryCasilleroDto) {
    return this.service.listadoCasilleros(query);
  }
}
