import { PartialType } from '@nestjs/swagger';
import { CreateSocioDto } from './create-socio.dto';

/**
 * Todos los campos son opcionales. Notar que `dni` y `fechaNacimiento`
 * también son editables aquí porque, a diferencia de create, no deberían
 * cambiar la categoría sin que el sistema la recalcule (el servicio se
 * encarga de eso en cada update).
 */
export class UpdateSocioDto extends PartialType(CreateSocioDto) {}
