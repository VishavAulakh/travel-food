import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from 'class-validator'

export class CheckCoverageDto {
  @ApiProperty({ example: 28.6139, description: 'Latitude (-90 to 90)' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number

  @ApiProperty({ example: 77.209, description: 'Longitude (-180 to 180)' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number
}
