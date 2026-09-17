import { Task, CreateTaskDTO } from '../../types';
import { ITaskRepository } from '../../repositories';

export class CreateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string, data: CreateTaskDTO): Promise<string> {
    if (!data.title.trim()) {
      throw new Error('Task title is required');
    }

    if (data.steps.length === 0) {
      throw new Error('At least one step is required');
    }

    return this.taskRepository.create(userId, data);
  }
}
