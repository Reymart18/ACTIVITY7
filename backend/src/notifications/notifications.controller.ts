import { Controller, Get, Query, UseGuards, Req, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../users/dto/auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  list(@Req() req: any, @Query('status') status?: 'unread' | 'read') {
    return this.service.listForUser(req.user.userId, status);
  }

  @Post('read')
  markRead(@Req() req: any, @Body() body: { ids: number[] }) {
    return this.service.markRead(req.user.userId, body.ids || []);
  }
}