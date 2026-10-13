import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EstadoCupon } from '../../common/enums/estado-cupon.enum';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';

export class QueryCuponDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() socioId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() cobradorId?: number;
  @ApiPropertyOptional({ enum: ZonaCobro }) @IsOptional() @IsEnum(ZonaCobro) zona?: ZonaCobro;
  @ApiPropertyOptional({ enum: EstadoCupon }) @IsOptional() @IsEnum(EstadoCupon) estado?: EstadoCupon;
  @ApiPropertyOptional({ example: '2026-08' }) @IsOptional() @IsString() periodo?: string;
}
