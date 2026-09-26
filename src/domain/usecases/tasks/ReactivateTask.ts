import { ITaskRepository } from '../../repositories';

export class ReactivateTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<void> {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    return this.taskRepository.reactivate(taskId);
  }
}