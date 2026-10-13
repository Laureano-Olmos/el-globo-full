import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CobradoresService } from './cobradores.service';
import { CreateCobradorDto } from './dto/create-cobrador.dto';
import { UpdateCobradorDto } from './dto/update-cobrador.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Cobradores')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('cobradores')
export class CobradoresController {
  constructor(private readonly service: CobradoresService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCobradorDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COBRADOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCobradorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
