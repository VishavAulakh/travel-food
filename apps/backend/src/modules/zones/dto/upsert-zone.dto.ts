import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator'

export class UpsertZoneDto {
  @ApiProperty({ example: 5, description: 'Delivery radius in kilometres (0.5 – 50)' })
  @IsNumber()
  @Min(0.5)
  @Max(50)
  radiusKm: number

  @ApiPropertyOptional({ example: 28.6139, description: 'Override centre latitude' })
  @IsOptional()
  @IsNumber()
  centerLat?: number

  @ApiPropertyOptional({ example: 77.209, description: 'Override centre longitude' })
  @IsOptional()
  @IsNumber()
  centerLng?: number

  @ApiProperty({ example: 10000, description: 'Minimum order value in paise' })
  @IsInt()
  @Min(0)
  minOrderPaise: number

  @ApiProperty({ example: 2500, description: 'Delivery fee in paise' })
  @IsInt()
  @Min(0)
  deliveryFeePaise: number

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean
}
