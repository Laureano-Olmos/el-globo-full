import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsOptional } from 'class-validator';

/**
 * Crea el grupo familiar y asocia los socios existentes que lo componen
 * (matrimonio + hijos). El enunciado exige que sea un matrimonio con al
 * menos un hijo; no hay tope de hijos.
 */
export class CreateGrupoFamiliarDto {
  @ApiProperty({ description: 'Id del socio titular (uno de los cónyuges).' })
  @IsInt()
  titularId: number;

  @ApiProperty({ description: 'Id del socio cónyuge.' })
  @IsInt()
  conyugeId: number;

  @ApiProperty({ type: [Number], description: 'Ids de los socios hijos (mínimo 1).' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  hijosIds: number[];

  @ApiProperty({ required: false, description: 'Por defecto se usa la cuota configurada ($80.000).' })
  @IsOptional()
  @IsInt()
  cuotaGrupal?: number;
}
