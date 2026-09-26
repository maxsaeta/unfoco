import { SubscriptionEntitlement } from '../types';

export interface IPurchaseAdapter {
  startPurchase(productId: string): Promise<SubscriptionEntitlement | null>;
  restorePurchases(): Promise<SubscriptionEntitlement | null>;
}

export interface ISubscriptionRepository {
  setPurchaseAdapter(adapter: IPurchaseAdapter): void;
  getSubscription(userId: string): Promise<SubscriptionEntitlement>;
  subscribe(userId: string, callback: (entitlement: SubscriptionEntitlement) => void): () => void;
  activate(userId: string, entitlement: SubscriptionEntitlement): Promise<void>;
  purchase(userId: string, productId: string): Promise<SubscriptionEntitlement | null>;
  restore(userId: string): Promise<SubscriptionEntitlement | null>;
}