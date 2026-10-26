import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateCobradorDto } from './create-cobrador.dto';

export class UpdateCobradorDto extends PartialType(OmitType(CreateCobradorDto, ['passwordInicial'] as const)) {
	@ApiPropertyOptional({ minLength: 8, writeOnly: true })
	@IsOptional()
	@IsString()
	@MinLength(8)
	passwordInicial?: string;
}
