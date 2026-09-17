import { Task } from '../../types';
import { ITaskRepository } from '../../repositories';

export class GetTasksUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(userId: string): Promise<Task[]> {
    return this.taskRepository.getByUserId(userId);
  }

  subscribe(userId: string, callback: (tasks: Task[]) => void): () => void {
    return this.taskRepository.subscribeToUserTasks(userId, callback);
  }
}
