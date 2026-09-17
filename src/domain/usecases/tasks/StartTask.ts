import { ITaskRepository } from '../../repositories';

export class StartTaskUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(taskId: string): Promise<void> {
    return this.taskRepository.startTask(taskId);
  }
}
