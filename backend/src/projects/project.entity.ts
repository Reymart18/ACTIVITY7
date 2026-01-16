import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  deadline?: string;

  @Column({ default: 0 })
  tasksPending!: number;

  @Column({ default: 'inProgress' })
  status!: 'finished' | 'inProgress' | 'unfinished';

  // Each task can include proofs: [{ userId, url, createdAt }]
  @Column('json', { nullable: true })
  tasks?: any[];

  @Column('json', { nullable: true })
  participants?: number[];

  @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ type: 'int', nullable: false })
  userId!: number;
}