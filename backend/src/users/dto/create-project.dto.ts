export class CreateProjectDto {
    name: string;
    tasksPending?: number;
    status?: 'finished' | 'inProgress' | 'unfinished';
  }
  