import { IStatsRepository } from '../../repositories';

export class IncrementTaskCompletedUseCase {
  constructor(private statsRepository: IStatsRepository) {}

  async execute(userId: string): Promise<void> {
    return this.statsRepository.incrementTaskCompleted(userId);
  }
}
