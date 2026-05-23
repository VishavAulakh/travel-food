import { Type } from 'class-transformer'
import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  Min,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  menuItemId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  qty: number

  @ApiProperty()
  @IsInt()
  @Min(0)
  unitPricePaise: number
}

export class PlaceOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliveryAddressLine: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  deliveryLat?: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  deliveryLng?: number

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  promoCode?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialInstructions?: string
}
