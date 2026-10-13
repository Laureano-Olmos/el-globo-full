import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrdenSocio } from '../../common/enums/orden-socio.enum';
import { CategoriaSocial } from '../../common/enums/categoria-social.enum';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';
import { EstadoSocio } from '../../common/enums/estado-socio.enum';

export class QuerySocioDto {
  @ApiPropertyOptional({ enum: OrdenSocio, default: OrdenSocio.ALFABETICO })
  @IsOptional()
  @IsEnum(OrdenSocio)
  orden?: OrdenSocio;

  @ApiPropertyOptional({ enum: CategoriaSocial })
  @IsOptional()
  @IsEnum(CategoriaSocial)
  categoria?: CategoriaSocial;

  @ApiPropertyOptional({ enum: ZonaCobro })
  @IsOptional()
  @IsEnum(ZonaCobro)
  zonaCobro?: ZonaCobro;

  @ApiPropertyOptional({ enum: EstadoSocio })
  @IsOptional()
  @IsEnum(EstadoSocio)
  estado?: EstadoSocio;

  @ApiPropertyOptional({ description: 'Búsqueda libre por nombre, apellido o DNI' })
  @IsOptional()
  @IsString()
  buscar?: string;
}
