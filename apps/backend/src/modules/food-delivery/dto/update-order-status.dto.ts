import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum OrderStatusUpdate {
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatusUpdate })
  @IsEnum(OrderStatusUpdate)
  status: OrderStatusUpdate
}
