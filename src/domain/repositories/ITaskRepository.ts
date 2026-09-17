import { Task, CreateTaskDTO, UpdateTaskDTO, CompleteStepResult } from '../types';

export interface ITaskRepository {
  create(userId: string, data: CreateTaskDTO): Promise<string>;
  getByUserId(userId: string): Promise<Task[]>;
  subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void
  ): () => void;
  update(taskId: string, data: UpdateTaskDTO): Promise<void>;
  completeStep(taskId: string, currentStepIndex: number, totalSteps: number): Promise<CompleteStepResult>;
  goToPreviousStep(taskId: string, currentStepIndex: number): Promise<number>;
  delete(taskId: string): Promise<void>;
}
