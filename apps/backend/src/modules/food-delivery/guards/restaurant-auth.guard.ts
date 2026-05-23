import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

@Injectable()
export class RestaurantAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractBearerToken(request)

    if (!token) {
      throw new UnauthorizedException('Missing bearer token')
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
      })

      if (!payload?.restaurantId) {
        throw new UnauthorizedException('Token does not carry a restaurantId claim')
      }

      ;(request as any).restaurantUser = payload
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Invalid or expired token')
    }

    return true
  }

  private extractBearerToken(request: Request): string | undefined {
    const authHeader = request.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined
    return authHeader.slice(7)
  }
}
