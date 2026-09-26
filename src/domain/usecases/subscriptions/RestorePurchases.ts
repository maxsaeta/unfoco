import { ISubscriptionRepository } from '../../repositories';
import { SubscriptionEntitlement } from '../../types';

export class RestorePurchasesUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  execute(userId: string): Promise<SubscriptionEntitlement | null> {
    return this.subscriptionRepository.restore(userId);
  }
}