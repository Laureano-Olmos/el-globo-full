import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, Min, ValidateNested } from 'class-validator';

export class DetalleCobranzaDto {
  @ApiProperty({ description: 'Id del cupón cobrado por el cobrador.' })
  @IsInt()
  cuponId: number;

  @ApiProperty({ description: 'Importe efectivamente cobrado (0 si no pagó, para armar la devolución).' })
  @IsNumber()
  @Min(0)
  importeCobrado: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  cobrado?: boolean;
}

/**
 * Planilla de rendición semanal del cobrador (R9): datos del socio e
 * importe cobrado por cada cupón de su recorrido. Si es la última semana
 * del mes, además devuelve (marca como DEVUELTO) los cupones no cobrados.
 */
export class CreateRendicionDto {
  @ApiProperty()
  @IsInt()
  cobradorId: number;

  @ApiProperty({ example: '2026-08-03' })
  semanaInicio: string;

  @ApiProperty({ example: '2026-08-09' })
  semanaFin: string;

  @ApiProperty({ type: [DetalleCobranzaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DetalleCobranzaDto)
  detalles: DetalleCobranzaDto[];

  @ApiProperty({
    default: false,
    description: 'Marcar true si corresponde a la última semana del mes (dispara la devolución de cupones impagos).',
  })
  @IsOptional()
  @IsBoolean()
  esUltimaSemanaDelMes?: boolean;
}
