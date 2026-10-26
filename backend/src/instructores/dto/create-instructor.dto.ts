import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateInstructorDto {
  @ApiProperty() @IsString() nombre: string;
  @ApiProperty() @IsString() apellido: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ writeOnly: true, minLength: 8 }) @IsString() @MinLength(8) passwordInicial: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() telefono?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sueldo?: number;
}
