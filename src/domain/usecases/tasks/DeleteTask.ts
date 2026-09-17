import { ITaskRepository } from '../../repositories';

export class DeleteTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<void> {
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    return this.taskRepository.delete(taskId);
  }
}
