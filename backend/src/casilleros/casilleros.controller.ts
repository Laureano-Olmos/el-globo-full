import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CasillerosService } from './casilleros.service';
import { CreateCasilleroDto } from './dto/create-casillero.dto';
import { QueryCasilleroDto } from './dto/query-casillero.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Casilleros')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('casilleros')
export class CasillerosController {
  constructor(private readonly service: CasillerosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCasilleroDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: QueryCasilleroDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id/alquilar/:socioId')
  @Roles(Role.ADMIN)
  alquilar(@Param('id', ParseIntPipe) id: number, @Param('socioId', ParseIntPipe) socioId: number) {
    return this.service.alquilar(id, socioId);
  }

  @Patch(':id/liberar')
  @Roles(Role.ADMIN)
  liberar(@Param('id', ParseIntPipe) id: number) {
    return this.service.liberar(id);
  }
}
