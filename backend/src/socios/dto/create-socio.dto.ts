import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';

export class CreateSocioDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() apellido: string;

  @ApiProperty()
  @IsString()
  @Length(7, 20)
  dni: string;

  @ApiProperty({ example: '2005-03-14' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ example: '2024-01-10', required: false, description: 'Por defecto, hoy.' })
  @IsOptional()
  @IsDateString()
  fechaAlta?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() direccion?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() localidad?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefono?: string;

  @ApiProperty() @IsEmail() email: string;

  @ApiProperty({ writeOnly: true, minLength: 8 })
  @IsString()
  @MinLength(8)
  passwordInicial: string;

  @ApiProperty({ enum: ZonaCobro, default: ZonaCobro.ZONA_0 })
  @IsEnum(ZonaCobro)
  zonaCobro: ZonaCobro;
}
