import { DailyStats, TotalStats } from '../../types';
import { IStatsRepository } from '../../repositories';

export class GetStatsUseCase {
  constructor(private statsRepository: IStatsRepository) {}

  async getWeeklyStats(userId: string): Promise<DailyStats[]> {
    return this.statsRepository.getWeeklyStats(userId);
  }

  async getTotalStats(userId: string): Promise<TotalStats> {
    return this.statsRepository.getTotalStats(userId);
  }
}
