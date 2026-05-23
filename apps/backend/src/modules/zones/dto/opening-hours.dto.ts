import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export class HoursRowDto {
  @ApiProperty({ example: 1, description: 'Day of week: 0=Sun, 1=Mon … 6=Sat' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number

  @ApiProperty({ example: true })
  @IsBoolean()
  isOpen: boolean

  @ApiProperty({ example: '11:00', description: 'HH:MM 24-hour format' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'opensAt must match HH:MM format' })
  opensAt: string

  @ApiProperty({ example: '23:00', description: 'HH:MM 24-hour format' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'closesAt must match HH:MM format' })
  closesAt: string
}

export class UpsertOpeningHoursDto {
  @ApiProperty({ type: [HoursRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HoursRowDto)
  hours: HoursRowDto[]
}
