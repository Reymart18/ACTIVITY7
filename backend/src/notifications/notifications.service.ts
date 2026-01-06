import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  notify(
    userId: number,
    type: 'task_assigned' | 'task_response',
    message: string,
    projectId?: number,
    taskId?: string,
  ) {
    const n = this.repo.create({
      userId,
      type,
      message,
      projectId: projectId ?? null,
      taskId: taskId ?? null,
      status: 'unread',
    });
    return this.repo.save(n);
  }

  listForUser(userId: number, status?: 'unread' | 'read') {
    const where: any = { userId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { createdAt: 'DESC' }, take: 50 });
  }

  async markRead(userId: number, ids: number[]) {
    if (!ids?.length) return { updated: 0 };
    const res = await this.repo.update({ userId, id: In(ids) }, { status: 'read' });
    return { updated: res.affected ?? 0 };
  }

  // Update the user's assignment notification message with ACCEPTED/REJECTED and mark it as read
  async updateAssignmentMessageAndMarkRead(
    userId: number,
    projectId: number,
    taskId: string,
    action: 'accept' | 'reject',
  ) {
    const items = await this.repo.find({
      where: { userId, projectId, taskId, type: 'task_assigned' },
      order: { createdAt: 'DESC' },
      take: 1,
    });
    const n = items[0];
    if (!n) return;

    // Remove any previous suffix, then append the new one
    const base = n.message.replace(/\s*-(ACCEPTED|REJECTED)\s*$/i, '');
    const suffix = action === 'accept' ? ' -ACCEPTED' : ' -REJECTED';

    n.message = `${base}${suffix}`;
    n.status = 'read';
    await this.repo.save(n);

    // Mark any other pending assignment notifications for the same task as read
    await this.repo.update(
      { userId, projectId, taskId, type: 'task_assigned', status: 'unread' },
      { status: 'read' },
    );
  }
}