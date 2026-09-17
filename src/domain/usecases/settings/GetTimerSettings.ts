import { TimerSettings } from '../../types';
import { ISettingsRepository } from '../../repositories';

export class GetTimerSettingsUseCase {
  constructor(private settingsRepository: ISettingsRepository) {}

  async execute(userId: string): Promise<TimerSettings> {
    return this.settingsRepository.getTimerSettings(userId);
  }
}
