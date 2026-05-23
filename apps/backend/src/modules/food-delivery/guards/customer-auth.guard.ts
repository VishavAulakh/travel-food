import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const authHeader: string | undefined = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException('No token provided')
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
      })
      if (payload.type !== 'customer') throw new UnauthorizedException('Invalid token type')
      req.customer = payload
      return true
    } catch {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
