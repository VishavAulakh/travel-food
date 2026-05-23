import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentRider = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.rider as { sub: string; type: string }
  },
)
