import { IPlanRepository } from '../../repositories';
import { MoodEntry } from '../../types';

export class GetMoodHistoryUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(userId: string, days: number = 7): Promise<MoodEntry[]> {
    return this.planRepository.getMoodHistory(userId, days);
  }
}
