import { ISubscriptionRepository } from '../../repositories';
import { SubscriptionEntitlement } from '../../types';

export class GetSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  execute(userId: string): Promise<SubscriptionEntitlement> {
    return this.subscriptionRepository.getSubscription(userId);
  }
}