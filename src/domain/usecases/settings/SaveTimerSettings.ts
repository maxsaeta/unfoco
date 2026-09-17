import { TimerSettings } from '../../types';
import { ISettingsRepository } from '../../repositories';

export class SaveTimerSettingsUseCase {
  constructor(private settingsRepository: ISettingsRepository) {}

  async execute(userId: string, settings: TimerSettings): Promise<void> {
    if (settings.workMinutes <= 0 || settings.breakMinutes <= 0) {
      throw new Error('Timer settings must be positive');
    }

    return this.settingsRepository.saveTimerSettings(userId, settings);
  }
}
