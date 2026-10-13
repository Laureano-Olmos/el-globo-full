import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  socioId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  instructorId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  cobradorId?: number;
}
