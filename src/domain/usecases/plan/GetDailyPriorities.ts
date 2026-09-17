import { IPlanRepository } from '../../repositories';
import { DailyPriorities } from '../../types';

export class GetDailyPrioritiesUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(userId: string, date: string): Promise<DailyPriorities | null> {
    return this.planRepository.getDailyPriorities(userId, date);
  }
}
