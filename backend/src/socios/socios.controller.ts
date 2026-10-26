import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SociosService } from './socios.service';
import { CreateSocioDto } from './dto/create-socio.dto';
import { UpdateSocioDto } from './dto/update-socio.dto';
import { QuerySocioDto } from './dto/query-socio.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Public } from '../common/decorators/public.decorator';

/**
 * Gestión de socios (R3). El administrador tiene acceso total (CUD-26 a
 * CUD-29); el propio socio puede consultar y modificar sus datos
 * (CUD-03/04/05); instructores y cobradores acceden en modo lectura
 * limitado a lo que necesitan (asistencia / cupones de su zona).
 */
@ApiTags('Socios')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('socios')
export class SociosController {
  constructor(private readonly sociosService: SociosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSocioDto) {
    return this.sociosService.create(dto);
  }

  @Public()
  @Post('registro')
  register(@Body() dto: CreateSocioDto) {
    return this.sociosService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COBRADOR, Role.INSTRUCTOR)
  findAll(@Query() query: QuerySocioDto) {
    return this.sociosService.findAll(query);
  }

  /** Panel personal del propio socio (CUD-05, "Consultar datos"). */
  @Get('me')
  @Roles(Role.SOCIO)
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.sociosService.findOne(user.socioId!);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COBRADOR, Role.INSTRUCTOR, Role.SOCIO)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    this.assertPropioSocioOAdmin(id, user);
    return this.sociosService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SOCIO)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocioDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    this.assertPropioSocioOAdmin(id, user);
    return this.sociosService.update(id, dto);
  }

  /** Baja de socio (CUD-27 por Administrador, CUD-04 autogestionada por el socio). */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.SOCIO)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    this.assertPropioSocioOAdmin(id, user);
    return this.sociosService.remove(id);
  }

  @Patch(':id/reactivar')
  @Roles(Role.ADMIN)
  reactivar(@Param('id', ParseIntPipe) id: number) {
    return this.sociosService.reactivar(id);
  }

  private assertPropioSocioOAdmin(id: number, user: AuthenticatedUser) {
    if (user.role === Role.SOCIO && user.socioId !== id) {
      throw new ForbiddenException('Sólo puede operar sobre sus propios datos.');
    }
  }
}
