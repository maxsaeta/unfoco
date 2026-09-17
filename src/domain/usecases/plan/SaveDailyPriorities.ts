import { IPlanRepository } from '../../repositories';
import { DailyPriorities } from '../../types';

export class SaveDailyPrioritiesUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(userId: string, priorities: DailyPriorities): Promise<void> {
    return this.planRepository.saveDailyPriorities(userId, priorities);
  }
}
