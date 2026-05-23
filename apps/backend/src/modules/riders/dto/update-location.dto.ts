import { IsNumber, Max, Min } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateLocationDto {
  @ApiProperty({ example: 12.9716, description: 'Latitude between -90 and 90' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number

  @ApiProperty({ example: 77.5946, description: 'Longitude between -180 and 180' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number
}
