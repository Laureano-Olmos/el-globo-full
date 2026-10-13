import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class PagarCuponDto {
  @ApiPropertyOptional({ description: 'Por defecto, hoy.' })
  @IsOptional()
  @IsDateString()
  fechaPago?: string;
}
