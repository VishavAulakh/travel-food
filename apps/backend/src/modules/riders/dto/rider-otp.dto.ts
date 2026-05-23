import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendRiderOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiPropertyOptional({ example: 'Rajan Kumar' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: 'bike', enum: ['bike', 'car', 'bicycle'] })
  @IsString()
  @IsOptional()
  vehicleType?: string
}

export class VerifyRiderOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string
}
