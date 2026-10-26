import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { ZonaCobro } from '../../common/enums/zona-cobro.enum';

export class CreateCobradorDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() apellido: string;
  @ApiProperty() @IsEmail() correo: string;

  @ApiProperty({ writeOnly: true, minLength: 8 })
  @IsString()
  @MinLength(8)
  passwordInicial: string;

  @ApiProperty({ enum: ZonaCobro, description: 'ZONA_1, ZONA_2 o ZONA_3 (la ZONA_0 no tiene cobrador).' })
  @IsEnum(ZonaCobro)
  zona: ZonaCobro;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comisionPorcentaje?: number;
}
