import {
  Controller, Get, Post, Body, UseGuards, Req, Put, Param, ParseIntPipe, Patch, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from '../users/dto/create-project.dto';
import { JwtAuthGuard } from '../users/dto/auth/jwt-auth.guard';
import { Project } from './project.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { Express } from 'express';

function imageFileFilter(req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
}

function filenameFactory(userId: number, projectId: number, taskId: string, file: Express.Multer.File) {
  const ts = Date.now();
  const ext = extname(file.originalname) || '.jpg';
  return `p${projectId}_t${taskId}_u${userId}_${ts}${ext}`;
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findMine(@Req() req: any) {
    return this.projectsService.findAllByUser(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.createForUser(req.user.userId, dto);
  }

  @Post(':id/tasks')
  addTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; status?: 'Not started' | 'In progress' | 'Finished'; members?: number[] },
  ) {
    return this.projectsService.addTask(req.user.userId, id, body);
  }

  @Post(':id/tasks/:taskId/assign')
  assignMembers(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @Body() body: { members: number[] },
  ) {
    return this.projectsService.assignMembersToTask(req.user.userId, id, taskId, body.members || []);
  }

  @Post(':id/tasks/:taskId/respond')
  respond(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @Body() body: { action: 'accept' | 'reject' },
  ) {
    return this.projectsService.respondToAssignment(req.user.userId, id, taskId, body.action);
  }

  @Patch(':id/tasks/:taskId/status')
  updateTaskStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @Body() body: { status: 'Not started' | 'In progress' | 'Finished' },
  ) {
    if (body.status === 'Finished') {
      throw new Error('Use /finish to mark as Finished with a proof image');
    }
    return this.projectsService.updateTaskStatus(req.user.userId, id, taskId, body.status);
  }

  // Use POST for multipart upload (more reliable across proxies)
  @Post(':id/tasks/:taskId/finish')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'task-proofs');
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (req: any, file, cb) => {
          const userId = req.user.userId;
          const projectId = Number(req.params.id);
          const taskId = String(req.params.taskId);
          cb(null, filenameFactory(userId, projectId, taskId, file));
        },
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  finishTaskWithProof(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('Proof image is required to finish the task');
    }
    const relativeUrl = `/uploads/task-proofs/${file.filename}`;
    return this.projectsService.finishTaskWithProof(req.user.userId, id, taskId, relativeUrl);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: Partial<Project>) {
    return this.projectsService.updateForUser(req.user.userId, id, body);
  }
}