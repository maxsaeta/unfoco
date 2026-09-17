import { CompleteStepResult } from '../../types';
import { ITaskRepository } from '../../repositories';

export class CompleteStepUseCase {
  constructor(private taskRepository: ITaskRepository) {}

  async execute(
    taskId: string,
    currentStepIndex: number,
    totalSteps: number
  ): Promise<CompleteStepResult> {
    if (currentStepIndex >= totalSteps) {
      throw new Error('Already at the last step');
    }

    return this.taskRepository.completeStep(taskId, currentStepIndex, totalSteps);
  }
}
