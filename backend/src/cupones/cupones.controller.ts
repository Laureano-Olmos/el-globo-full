import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CuponesService } from './cupones.service';
import { QueryCuponDto } from './dto/query-cupon.dto';
import { PagarCuponDto } from './dto/pagar-cupon.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Cupones de cobranza')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('cupones')
export class CuponesController {
  constructor(private readonly service: CuponesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COBRADOR, Role.SOCIO)
  findAll(@Query() query: QueryCuponDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === Role.SOCIO) {
      query.socioId = user.socioId!;
    }
    if (user.role === Role.COBRADOR) {
      query.cobradorId = user.cobradorId!;
    }
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COBRADOR, Role.SOCIO)
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const cupon = await this.service.findOne(id);
    if (user.role === Role.SOCIO && cupon.socio.id !== user.socioId) {
      throw new ForbiddenException('Sólo puede consultar sus propios cupones.');
    }
    if (user.role === Role.COBRADOR && cupon.cobrador?.id !== user.cobradorId) {
      throw new ForbiddenException('Sólo puede consultar cupones de su propia zona.');
    }
    return cupon;
  }

  @Patch(':id/pagar')
  @Roles(Role.ADMIN, Role.COBRADOR)
  pagar(@Param('id', ParseIntPipe) id: number, @Body() dto: PagarCuponDto) {
    return this.service.pagar(id, dto);
  }

  @Patch(':id/devolver')
  @Roles(Role.ADMIN, Role.COBRADOR)
  devolver(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarComoDevuelto(id);
  }

  /** Disparo manual de la emisión mensual (además del cron automático). */
  @Post('generar-mensual')
  @Roles(Role.ADMIN)
  generarMensual(@Query('periodo') periodo?: string) {
    return this.service.generarCuponesMensuales(periodo);
  }
}
