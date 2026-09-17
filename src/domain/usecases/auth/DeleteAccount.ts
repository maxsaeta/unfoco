import { ITaskRepository, ISettingsRepository, IStatsRepository, IPlanRepository } from '../../repositories';

export class DeleteAccountUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private settingsRepository: ISettingsRepository,
    private statsRepository: IStatsRepository,
    private planRepository: IPlanRepository
  ) {}

  async execute(userId: string): Promise<void> {
    // Delete all user tasks
    const tasks = await this.taskRepository.getByUserId(userId);
    for (const task of tasks) {
      if (task.id) {
        await this.taskRepository.delete(task.id);
      }
    }

    // Delete user settings
    await this.settingsRepository.delete(userId);

    // Delete user stats
    await this.statsRepository.delete(userId);

    // Delete user plan data (priorities, moods, shutdown)
    await this.planRepository.delete(userId);
  }
}
