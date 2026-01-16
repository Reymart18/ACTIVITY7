import {
  Controller, Get, Post, Body, UseGuards, Req, Put,
  Param, ParseIntPipe, Patch, UseInterceptors, UploadedFile, Delete,
} from '@nestjs/common'
import {
  ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody,
} from '@nestjs/swagger'
import { ProjectsService } from './projects.service'
import { CreateProjectDto } from '../users/dto/create-project.dto'
import { JwtAuthGuard } from '../users/dto/auth/jwt-auth.guard'
import { Project } from './project.entity'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { Express } from 'express'

function imageFileFilter(req: any, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false)
  }
  cb(null, true)
}

function filenameFactory(userId: number, projectId: number, taskId: string, file: Express.Multer.File) {
  const ts = Date.now()
  const ext = extname(file.originalname) || '.jpg'
  return `p${projectId}_t${taskId}_u${userId}_${ts}${ext}`
}

@ApiTags('Projects')
@ApiBearerAuth('access-token') // mark all routes as protected
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Get projects of logged-in user' })
  findMine(@Req() req: any) {
    return this.projectsService.findAllByUser(req.user.userId)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  create(@Req() req: any, @Body() dto: CreateProjectDto) {
    return this.projectsService.createForUser(req.user.userId, dto)
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Add a task to a project' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string', enum: ['Not started', 'In progress', 'Finished'] },
        members: { type: 'array', items: { type: 'number' } },
        deadline: { type: 'string', format: 'date' },
      },
    },
  })
  addTask(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; status?: 'Not started' | 'In progress' | 'Finished'; members?: number[]; deadline?: string },
  ) {
    return this.projectsService.addTask(req.user.userId, id, body)
  }

  @Post(':id/tasks/:taskId/assign')
  @ApiOperation({ summary: 'Assign members to a task' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { members: { type: 'array', items: { type: 'number' } } },
    },
  })
  assignMembers(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @Body() body: { members: number[] },
  ) {
    return this.projectsService.assignMembersToTask(req.user.userId, id, taskId, body.members || [])
  }

  @Post(':id/tasks/:taskId/respond')
  @ApiOperation({ summary: 'Respond to task assignment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { action: { type: 'string', enum: ['accept', 'reject'] } },
    },
  })
  respond(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @Body() body: { action: 'accept' | 'reject' },
  ) {
    return this.projectsService.respondToAssignment(req.user.userId, id, taskId, body.action)
  }

  @Patch(':id/tasks/:taskId/status')
  @ApiOperation({ summary: 'Update task status (except Finished)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { status: { type: 'string', enum: ['Not started', 'In progress', 'Finished'] } },
    },
  })
  updateTaskStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('taskId') taskId: string,
    @Body('status') status: 'Not started' | 'In progress' | 'Finished',
  ) {
    if (status === 'Finished') throw new Error('Use /finish to mark as Finished with a proof image')
    return this.projectsService.updateTaskStatus(req.user.userId, id, taskId, status)
  }

  @Post(':id/tasks/:taskId/finish')
  @ApiOperation({ summary: 'Finish a task with image proof' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dir = join(process.cwd(), 'uploads', 'task-proofs')
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
          cb(null, dir)
        },
        filename: (req: any, file, cb) => {
          cb(null, filenameFactory(req.user.userId, Number(req.params.id), req.params.taskId, file))
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
    if (!file) throw new Error('Proof image is required')
    return this.projectsService.finishTaskWithProof(
      req.user.userId,
      id,
      taskId,
      `/uploads/task-proofs/${file.filename}`,
    )
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project details' })
  @ApiBody({ type: Project })
  update(@Req() req: any, @Param('id', ParseIntPipe) id: number, @Body() body: Partial<Project>) {
    return this.projectsService.updateForUser(req.user.userId, id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  delete(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.projectsService.deleteProject(req.user.userId, id)
  }
}
