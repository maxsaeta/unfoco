import { IPlanRepository } from '../../repositories';
import { ShutdownChecklist } from '../../types';

export class GetShutdownChecklistUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(userId: string): Promise<ShutdownChecklist | null> {
    return this.planRepository.getShutdownChecklist(userId);
  }
}
