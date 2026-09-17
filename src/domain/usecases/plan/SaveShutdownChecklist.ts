import { IPlanRepository } from '../../repositories';
import { ShutdownChecklist } from '../../types';

export class SaveShutdownChecklistUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(userId: string, checklist: ShutdownChecklist): Promise<void> {
    return this.planRepository.saveShutdownChecklist(userId, checklist);
  }
}
