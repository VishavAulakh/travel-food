import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { RedisService } from '../../common/services/redis.service'

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/ws',
})
@Injectable()
export class TrackingGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly jwtService: JwtService,
    private readonly redis: RedisService,
  ) {}

  handleDisconnect(client: Socket) {
    // rooms auto-clean on disconnect
  }

  // ── join_order_room ──────────────────────────────────────────────────────────
  // Payload: { orderId: string, token: string }
  // Customer or rider joins room order:{orderId} to receive status + location updates
  @SubscribeMessage('join_order_room')
  async handleJoinOrderRoom(
    @MessageBody() data: { orderId: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    const payload = this.verifyToken(data.token)
    if (!payload) {
      client.emit('error', { message: 'Unauthorized' })
      return
    }
    await client.join(`order:${data.orderId}`)
    client.emit('joined', { room: `order:${data.orderId}` })
  }

  // ── join_restaurant_room ─────────────────────────────────────────────────────
  // Payload: { branchId: string, token: string }
  // Restaurant portal joins room restaurant:{branchId} for new order notifications
  @SubscribeMessage('join_restaurant_room')
  async handleJoinRestaurantRoom(
    @MessageBody() data: { branchId: string; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    const payload = this.verifyToken(data.token)
    if (!payload || !payload.restaurantId) {
      client.emit('error', { message: 'Unauthorized' })
      return
    }
    await client.join(`restaurant:${data.branchId}`)
    client.emit('joined', { room: `restaurant:${data.branchId}` })
  }

  // ── rider_location ───────────────────────────────────────────────────────────
  // Payload: { orderId: string, lat: number, lng: number, token: string }
  // Rider broadcasts GPS; server stores in Redis and forwards to order room
  @SubscribeMessage('rider_location')
  async handleRiderLocation(
    @MessageBody() data: { orderId: string; lat: number; lng: number; token: string },
    @ConnectedSocket() client: Socket,
  ) {
    const payload = this.verifyToken(data.token)
    if (!payload || payload.type !== 'rider') {
      client.emit('error', { message: 'Unauthorized' })
      return
    }
    const riderId = payload.sub
    const locationData = { lat: data.lat, lng: data.lng, ts: Date.now() }
    await this.redis.set(`rider:location:${riderId}`, JSON.stringify(locationData), 30)
    this.server.to(`order:${data.orderId}`).emit('rider_location_update', {
      riderId,
      ...locationData,
    })
  }

  // ── Server-side emitters (called by other services) ─────────────────────────

  emitOrderStatusChanged(orderId: string, status: string, updatedAt: Date) {
    this.server.to(`order:${orderId}`).emit('order_status_changed', {
      orderId, status, updatedAt,
    })
  }

  emitNewOrder(branchId: string, order: any) {
    this.server.to(`restaurant:${branchId}`).emit('delivery.order.placed', order)
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'travel-food-local-secret',
      })
    } catch {
      return null
    }
  }
}
