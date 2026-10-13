import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { OrdenCasillero } from '../../common/enums/orden-casillero.enum';

export class QueryCasilleroDto {
  @ApiPropertyOptional({ enum: OrdenCasillero, default: OrdenCasillero.NUMERO })
  @IsOptional()
  @IsEnum(OrdenCasillero)
  orden?: OrdenCasillero;
}
