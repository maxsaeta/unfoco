import { IStatsRepository } from '../../repositories';

export class IncrementPomodoroUseCase {
  constructor(private statsRepository: IStatsRepository) {}

  async execute(userId: string, workMinutes: number): Promise<void> {
    if (workMinutes <= 0) {
      throw new Error('Work minutes must be positive');
    }

    return this.statsRepository.incrementPomodoro(userId, workMinutes);
  }
}
