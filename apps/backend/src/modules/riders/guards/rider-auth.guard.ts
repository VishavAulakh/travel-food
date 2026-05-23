import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RiderAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const authHeader: string | undefined = request.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header')
    }

    const token = authHeader.slice(7)

    try {
      const payload = this.jwtService.verify<{ sub: string; type: string }>(token, {
        secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
      })

      if (payload.type !== 'rider') {
        throw new UnauthorizedException('Token is not a rider token')
      }

      request.rider = payload
      return true
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
