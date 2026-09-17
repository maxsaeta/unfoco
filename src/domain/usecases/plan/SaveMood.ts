import { IPlanRepository } from '../../repositories';
import { MoodEntry } from '../../types';

export class SaveMoodUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(userId: string, entry: MoodEntry): Promise<void> {
    return this.planRepository.saveMood(userId, entry);
  }
}
