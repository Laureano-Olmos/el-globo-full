import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RendicionesService } from './rendiciones.service';
import { CreateRendicionDto } from './dto/create-rendicion.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@ApiTags('Rendiciones de cobradores')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('rendiciones')
export class RendicionesController {
  constructor(private readonly service: RendicionesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COBRADOR)
  create(@Body() dto: CreateRendicionDto, @CurrentUser() user: AuthenticatedUser) {
    if (user.role === Role.COBRADOR && user.cobradorId !== dto.cobradorId) {
      throw new ForbiddenException('Sólo puede presentar rendiciones de su propia zona.');
    }
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COBRADOR)
  findAll(@Query('cobradorId') cobradorId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    const id = user.role === Role.COBRADOR ? user.cobradorId! : cobradorId ? Number(cobradorId) : undefined;
    return this.service.findAll(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COBRADOR)
  async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    const rendicion = await this.service.findOne(id);
    if (user.role === Role.COBRADOR && rendicion.cobrador.id !== user.cobradorId) {
      throw new ForbiddenException('Sólo puede consultar sus propias rendiciones.');
    }
    return rendicion;
  }
}
