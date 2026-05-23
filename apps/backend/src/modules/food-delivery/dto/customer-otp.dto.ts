import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SendCustomerOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string
}

export class VerifyCustomerOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp: string
}
