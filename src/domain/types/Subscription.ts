export type SubscriptionProviderName = 'google-play' | 'app-store';

export interface SubscriptionEntitlement {
  status: 'active' | 'none';
  plan?: string;
  productId?: string;
  provider?: SubscriptionProviderName;
  startedAt?: number;
  expiresAt?: number;
  autoRenewing?: boolean;
  environment?: 'production' | 'sandbox';
  updatedAt?: number;
}