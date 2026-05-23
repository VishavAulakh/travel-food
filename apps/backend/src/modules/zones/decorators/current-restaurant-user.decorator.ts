import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface RestaurantUserPayload {
  sub: string
  restaurantId: string
  role: 'owner' | 'manager' | 'staff'
}

export const CurrentRestaurantUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RestaurantUserPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.restaurantUser as RestaurantUserPayload
  },
)
