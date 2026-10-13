import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCasilleroDto {
  @ApiProperty() @IsInt() @Min(1) numero: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) costoMensual?: number;
}
