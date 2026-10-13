import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateInscripcionDto {
  @ApiProperty() @IsInt() socioId: number;
  @ApiProperty() @IsInt() actividadId: number;
}
