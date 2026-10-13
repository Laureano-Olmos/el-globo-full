import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Turno } from '../../common/enums/turno.enum';

export class CreateActividadDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() descripcion?: string;

  @ApiProperty() @IsNumber() @Min(0) arancel: number;

  @ApiProperty({ enum: Turno }) @IsEnum(Turno) turno: Turno;

  @ApiProperty({ required: false, example: 'Lunes, Miércoles, Viernes' })
  @IsOptional()
  @IsString()
  diasSemana?: string;

  @ApiProperty({ required: false, example: '18:00' })
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiProperty({ required: false, example: '19:00' })
  @IsOptional()
  @IsString()
  horaFin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  cupoMaximo?: number;

  @ApiProperty({ required: false, description: 'Id del instructor a cargo.' })
  @IsOptional()
  @IsInt()
  instructorId?: number;
}
