import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfiguracionService } from './configuracion.service';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Configuración')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly service: ConfiguracionService) {}

  @Get()
  @Roles(Role.ADMIN)
  get() {
    return this.service.getOrCreate();
  }

  @Patch()
  @Roles(Role.ADMIN)
  update(@Body() dto: UpdateConfiguracionDto) {
    return this.service.update(dto);
  }
}
