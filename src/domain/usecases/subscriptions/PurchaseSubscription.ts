import { ISubscriptionRepository } from '../../repositories';
import { SubscriptionEntitlement } from '../../types';

export class PurchaseSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  execute(userId: string, productId: string): Promise<SubscriptionEntitlement | null> {
    return this.subscriptionRepository.purchase(userId, productId);
  }
}