import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export enum RiderDeliveryStatus {
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
}

export class UpdateDeliveryStatusDto {
  @ApiProperty({ enum: RiderDeliveryStatus, example: RiderDeliveryStatus.PICKED_UP })
  @IsEnum(RiderDeliveryStatus)
  status: RiderDeliveryStatus
}
