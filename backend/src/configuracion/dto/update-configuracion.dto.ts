import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateConfiguracionDto {
  @IsOptional() @IsNumber() @Min(0) cuotaCadete?: number;
  @IsOptional() @IsNumber() @Min(0) cuotaActivo?: number;
  @IsOptional() @IsNumber() @Min(0) cuotaVitalicio?: number;
  @IsOptional() @IsNumber() @Min(0) cuotaGrupoFamiliar?: number;
  @IsOptional() @IsNumber() @Min(0) costoCasillero?: number;
  @IsOptional() @IsNumber() @Min(0) recargoMorosidad?: number;
  @IsOptional() @IsNumber() @Min(0) comisionCobrador?: number;
  @IsOptional() @IsNumber() @Min(0) edadMinimaActivo?: number;
  @IsOptional() @IsNumber() @Min(0) edadMinimaVitalicio?: number;
  @IsOptional() @IsNumber() @Min(0) antiguedadMinimaVitalicio?: number;
  @IsOptional() @IsNumber() @Min(1) mesesConsecutivosParaMorosidad?: number;
  @IsOptional() @IsNumber() @Min(1) totalCasilleros?: number;
}
