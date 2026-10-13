import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GruposFamiliaresService } from './grupos-familiares.service';
import { CreateGrupoFamiliarDto } from './dto/create-grupo-familiar.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Grupos familiares')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('grupos-familiares')
export class GruposFamiliaresController {
  constructor(private readonly service: GruposFamiliaresService) {}

  @Post()
  create(@Body() dto: CreateGrupoFamiliarDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Delete(':id/integrantes/:socioId')
  quitarIntegrante(
    @Param('id', ParseIntPipe) id: number,
    @Param('socioId', ParseIntPipe) socioId: number,
  ) {
    return this.service.quitarIntegrante(id, socioId);
  }
}
