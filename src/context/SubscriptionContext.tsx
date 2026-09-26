import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SubscriptionEntitlement } from '../domain/types';
import { container } from '../di/container';

interface SubscriptionContextValue {
  subscription: SubscriptionEntitlement | null;
  loading: boolean;
  isPremium: boolean;
  purchase: (productId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  subscription: null,
  loading: true,
  isPremium: false,
  purchase: async () => false,
  restore: async () => false,
  refresh: async () => {},
});

export function SubscriptionProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [subscription, setSubscription] = useState<SubscriptionEntitlement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = container.subscriptionRepository.subscribe(userId, (entitlement) => {
      setSubscription(entitlement);
      setLoading(false);
    });
    return () => {
      setLoading(false);
      setSubscription(null);
      unsubscribe();
    };
  }, [userId]);

  const isPremium =
    subscription?.status === 'active' &&
    subscription.expiresAt != null &&
    subscription.expiresAt > Date.now();

  const purchase = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        const entitlement = await container.purchaseSubscriptionUseCase.execute(userId, productId);
        if (entitlement) {
          setSubscription(entitlement);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error purchasing subscription:', error);
        return false;
      }
    },
    [userId]
  );

  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const entitlement = await container.restorePurchasesUseCase.execute(userId);
      if (entitlement) {
        setSubscription(entitlement);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return false;
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    const entitlement = await container.getSubscriptionUseCase.execute(userId);
    setSubscription(entitlement);
  }, [userId]);

  return (
    <SubscriptionContext.Provider
      value={{ subscription, loading, isPremium, purchase, restore, refresh }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  return useContext(SubscriptionContext);
}