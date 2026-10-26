import { OmitType, PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateInstructorDto } from './create-instructor.dto';

export class UpdateInstructorDto extends PartialType(OmitType(CreateInstructorDto, ['passwordInicial'] as const)) {
	@ApiPropertyOptional({ minLength: 8, writeOnly: true })
	@IsOptional()
	@IsString()
	@MinLength(8)
	passwordInicial?: string;
}
