import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export type NotificationType = 'task_assigned' | 'task_response';
export type NotificationStatus = 'unread' | 'read';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 32 })
  type: NotificationType;

  @Column({ type: 'int', nullable: true })
  projectId: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  taskId: string | null;

  @Column({ type: 'text' })
  message: string;

  @Index()
  @Column({ type: 'varchar', length: 16, default: 'unread' })
  status: NotificationStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}