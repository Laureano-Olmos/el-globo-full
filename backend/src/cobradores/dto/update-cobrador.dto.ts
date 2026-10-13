import { PartialType } from '@nestjs/swagger';
import { CreateCobradorDto } from './create-cobrador.dto';

export class UpdateCobradorDto extends PartialType(CreateCobradorDto) {}
