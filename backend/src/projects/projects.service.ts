import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto } from '../users/dto/create-project.dto';
import { User } from '../users/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

type TaskStatus = 'Not started' | 'In progress' | 'Finished';
const genId = () => `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const allowedStatuses: TaskStatus[] = ['Not started', 'In progress', 'Finished'];

function recomputeProjectState(project: Project) {
  const tasks = Array.isArray(project.tasks) ? project.tasks : [];
  const total = tasks.length;
  const finished = tasks.filter((t: any) => (t.status || '').toLowerCase() === 'finished').length;
  const inProg = tasks.filter((t: any) => (t.status || '').toLowerCase() === 'in progress').length;
  project.tasksPending = tasks.filter((t: any) => (t.status || '').toLowerCase() !== 'finished').length;

  if (total > 0 && finished === total) {
    project.status = 'finished';
  } else if (inProg > 0 || (finished > 0 && finished < total)) {
    project.status = 'inProgress';
  } else {
    project.status = 'unfinished';
  }
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectsRepository: Repository<Project>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private notifications: NotificationsService,
  ) {}

  async findAllByUser(userId: number): Promise<Project[]> {
    const all = await this.projectsRepository.find();
    return all.filter(
      (p) => p.userId === userId || (Array.isArray(p.participants) && p.participants.includes(userId)),
    );
  }

  async createForUser(userId: number, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectsRepository.create({ ...dto, userId, tasks: [], participants: [] });
    return this.projectsRepository.save(project);
  }

  async addTask(
    userId: number,
    projectId: number,
    payload: { name: string; status?: TaskStatus; members?: number[]; deadline?: string },
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Not your project');

    const members = Array.isArray(payload.members) ? Array.from(new Set(payload.members)) : [];
    if (members.length) {
      const count = await this.usersRepository.count({ where: { id: In(members) } });
      if (count !== members.length) throw new BadRequestException('One or more assigned members do not exist');
    }

    const taskId = genId();
    const newTask: any = {
      id: taskId,
      name: payload.name,
      status: payload.status ?? 'Not started',
      members,
      assignments: members.map((uid) => ({ userId: uid, status: 'pending' as const })),
      proofs: [], // [{ userId, url, createdAt }]
      deadline: payload.deadline || null,
    };

    const tasks = Array.isArray(project.tasks) ? project.tasks : [];
    tasks.push(newTask);
    project.tasks = tasks;

    const saved = await this.projectsRepository.save(project);

    await Promise.all(
      members.map((uid) =>
        this.notifications.notify(uid, 'task_assigned', `You were assigned to task "${payload.name}"`, project.id, taskId),
      ),
    );

    return saved;
  }

  async assignMembersToTask(
    userId: number,
    projectId: number,
    taskId: string,
    memberIds: number[],
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Not your project');

    const task: any = (project.tasks || []).find((t: any) => t.id === taskId);
    if (!task) throw new NotFoundException('Task not found');

    const unique = Array.from(new Set(memberIds || []));
    if (!unique.length) return project;

    const count = await this.usersRepository.count({ where: { id: In(unique) } });
    if (count !== unique.length) throw new BadRequestException('One or more assigned members do not exist');

    task.assignments = Array.isArray(task.assignments) ? task.assignments : [];
    task.members = Array.isArray(task.members) ? task.members : [];
    task.proofs = Array.isArray(task.proofs) ? task.proofs : [];

    const existing = new Set(task.assignments.map((a: any) => a.userId));
    const toNotify: number[] = [];
    unique.forEach((uid) => {
      if (!existing.has(uid)) {
        task.assignments.push({ userId: uid, status: 'pending' });
        if (!task.members.includes(uid)) task.members.push(uid);
        toNotify.push(uid);
      }
    });

    const saved = await this.projectsRepository.save(project);

    await Promise.all(
      toNotify.map((uid) =>
        this.notifications.notify(uid, 'task_assigned', `You were assigned to task "${task.name}"`, project.id, taskId),
      ),
    );

    return saved;
  }

  async respondToAssignment(
    currentUserId: number,
    projectId: number,
    taskId: string,
    action: 'accept' | 'reject',
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const task: any = (project.tasks || []).find((t: any) => t.id === taskId);
    if (!task) throw new NotFoundException('Task not found');

    const assignment = (task.assignments || []).find((a: any) => a.userId === currentUserId);
    if (!assignment) throw new ForbiddenException('You are not assigned to this task');
    if (assignment.status !== 'pending') throw new BadRequestException('Invitation already responded');

    assignment.status = action === 'accept' ? 'accepted' : 'rejected';

    if (action === 'accept') {
      const participants = Array.isArray(project.participants) ? project.participants : [];
      if (!participants.includes(currentUserId)) {
        project.participants = [...participants, currentUserId];
      }
    }

    const saved = await this.projectsRepository.save(project);

    await this.notifications.updateAssignmentMessageAndMarkRead(currentUserId, project.id, taskId, action);
    await this.notifications.notify(
      project.userId,
      'task_response',
      `An assignee ${action === 'accept' ? 'accepted' : 'rejected'} the task "${task.name}"`,
      project.id,
      taskId,
    );

    return saved;
  }

  // For non-finished status changes (no proof)
  async updateTaskStatus(
    currentUserId: number,
    projectId: number,
    taskId: string,
    status: TaskStatus,
  ): Promise<Project> {
    if (!allowedStatuses.includes(status)) throw new BadRequestException('Invalid status');
    if (status === 'Finished') {
      throw new BadRequestException('Upload a proof image to mark as Finished');
    }

    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const task: any = (project.tasks || []).find((t: any) => t.id === taskId);
    if (!task) throw new NotFoundException('Task not found');

    const isAcceptedAssignee =
      Array.isArray(task.assignments) &&
      task.assignments.some((a: any) => a.userId === currentUserId && a.status === 'accepted');

    const isLegacyMember = Array.isArray(task.members) && task.members.includes(currentUserId);
    if (!isAcceptedAssignee && !isLegacyMember) {
      throw new ForbiddenException('You can only update tasks assigned to you');
    }

    task.status = status;
    recomputeProjectState(project);

    const saved = await this.projectsRepository.save(project);

    await this.notifications.notify(
      project.userId,
      'task_response',
      `Task "${task.name}" status updated to "${status}"`,
      project.id,
      taskId,
    );

    return saved;
  }

  // Finished with proof image
  async finishTaskWithProof(
    currentUserId: number,
    projectId: number,
    taskId: string,
    proofUrl: string, // may be relative; will convert to absolute
  ): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const task: any = (project.tasks || []).find((t: any) => t.id === taskId);
    if (!task) throw new NotFoundException('Task not found');

    const isAcceptedAssignee =
      Array.isArray(task.assignments) &&
      task.assignments.some((a: any) => a.userId === currentUserId && a.status === 'accepted');
    const isLegacyMember = Array.isArray(task.members) && task.members.includes(currentUserId);
    if (!isAcceptedAssignee && !isLegacyMember) {
      throw new ForbiddenException('You can only finish tasks assigned to you');
    }

    const apiOrigin = process.env.API_ORIGIN || 'http://localhost:3000';
    const absoluteUrl = /^https?:\/\//i.test(proofUrl) ? proofUrl : `${apiOrigin}${proofUrl}`;

    task.proofs = Array.isArray(task.proofs) ? task.proofs : [];
    task.proofs.push({ userId: currentUserId, url: absoluteUrl, createdAt: new Date().toISOString() });

    task.status = 'Finished';
    recomputeProjectState(project);

    const saved = await this.projectsRepository.save(project);

    await this.notifications.notify(
      project.userId,
      'task_response',
      `Task "${task.name}" was marked Finished with a proof image`,
      project.id,
      taskId,
    );

    return saved;
  }

  async updateForUser(userId: number, id: number, updated: Partial<Project>): Promise<Project> {
    const project = await this.projectsRepository.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Not your project');

    if (Array.isArray(updated.tasks)) {
      const memberIds = new Set<number>();
      for (const t of updated.tasks as any[]) {
        if (Array.isArray(t.members)) t.members.forEach((m: number) => memberIds.add(m));
        if (Array.isArray(t.assignments)) t.assignments.forEach((a: any) => memberIds.add(a.userId));
      }
      const ids = Array.from(memberIds);
      if (ids.length) {
        const count = await this.usersRepository.count({ where: { id: In(ids) } });
        if (count !== ids.length) throw new BadRequestException('One or more assigned members do not exist');
      }
    }

    const merged = this.projectsRepository.merge(project, updated);
    recomputeProjectState(merged);
    return this.projectsRepository.save(merged);
  }

  async deleteProject(userId: number, projectId: number): Promise<{ message: string }> {
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Only the project creator can delete it');

    await this.projectsRepository.remove(project);
    return { message: 'Project deleted successfully' };
  }
}