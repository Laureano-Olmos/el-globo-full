import { Body, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InscripcionesService } from './inscripciones.service';
import { CreateInscripcionDto } from './dto/create-inscripcion.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Inscripciones a actividades')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly service: InscripcionesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SOCIO)
  inscribir(@Body() dto: CreateInscripcionDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === Role.SOCIO && user.socioId !== dto.socioId) {
      throw new ForbiddenException('Sólo puede inscribirse a sí mismo.');
    }
    return this.service.inscribir(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SOCIO)
  darDeBaja(@Param('id', ParseIntPipe) id: number) {
    return this.service.darDeBaja(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  buscar(@Query('actividadId') actividadId?: string, @Query('socioId') socioId?: string) {
    if (actividadId) return this.service.findPorActividad(Number(actividadId));
    if (socioId) return this.service.findPorSocio(Number(socioId));
    return [];
  }
}
