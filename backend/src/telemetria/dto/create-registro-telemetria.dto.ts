import {
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRegistroTelemetriaDto {
  @IsString()
  @IsNotEmpty()
  codigoDispositivo: string;

  @IsDateString()
  timestamp: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  velocidadeObd?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  velocidadeGps?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rpm?: number;

  @IsNumber()
  @IsOptional()
  temperaturaMotor?: number;
}
