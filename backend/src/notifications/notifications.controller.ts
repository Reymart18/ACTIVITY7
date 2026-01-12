import { Controller, Get, Query, UseGuards, Req, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../users/dto/auth/jwt-auth.guard';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for logged-in user' })
  @ApiQuery({ name: 'status', required: false, enum: ['unread', 'read'] })
  list(@Req() req: any, @Query('status') status?: 'unread' | 'read') {
    return this.service.listForUser(req.user.userId, status);
  }

  @Post('read')
  @ApiOperation({ summary: 'Mark notifications as read' })
  markRead(@Req() req: any, @Body() body: { ids: number[] }) {
    return this.service.markRead(req.user.userId, body.ids || []);
  }
}
