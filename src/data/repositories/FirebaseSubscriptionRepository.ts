import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ISubscriptionRepository, IPurchaseAdapter } from '../../domain/repositories';
import { SubscriptionEntitlement } from '../../domain/types';

const cacheKey = (userId: string): string => `@unpaso_subscription_${userId}`;

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (value instanceof Date) return value.getTime();
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().getTime();
  }
  return undefined;
}

function mapToEntitlement(data?: Record<string, unknown> | null): SubscriptionEntitlement | null {
  if (!data || typeof data.status !== 'string') return null;
  if (data.status !== 'active') {
    return { status: 'none' };
  }
  const expiresAt = toNumber(data.expiresAt);
  return {
    status: 'active',
    plan: typeof data.plan === 'string' ? data.plan : undefined,
    productId: typeof data.productId === 'string' ? data.productId : undefined,
    provider: data.provider === 'app-store' ? 'app-store' : 'google-play',
    startedAt: toNumber(data.startedAt),
    expiresAt,
    autoRenewing: Boolean(data.autoRenewing),
    environment: data.environment === 'sandbox' ? 'sandbox' : 'production',
    updatedAt: toNumber(data.updatedAt),
  };
}

export class FirebaseSubscriptionRepository implements ISubscriptionRepository {
  private purchaseAdapter: IPurchaseAdapter | null = null;

  setPurchaseAdapter(adapter: IPurchaseAdapter): void {
    this.purchaseAdapter = adapter;
  }

  async getSubscription(userId: string): Promise<SubscriptionEntitlement> {
    try {
      const docRef = doc(db, 'users', userId);
      const snapshot = await getDoc(docRef);
      const entitlement = snapshot.exists()
        ? mapToEntitlement(snapshot.data().subscription as Record<string, unknown> | undefined)
        : null;
      const result = entitlement ?? { status: 'none' as const };
      await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('Error loading subscription:', error);
      const cached = await AsyncStorage.getItem(cacheKey(userId));
      if (cached) {
        try {
          return JSON.parse(cached) as SubscriptionEntitlement;
        } catch {
          // ignore
        }
      }
      return { status: 'none' };
    }
  }

  subscribe(userId: string, callback: (entitlement: SubscriptionEntitlement) => void): () => void {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (snapshot) => {
        const entitlement = snapshot.exists()
          ? mapToEntitlement(snapshot.data().subscription as Record<string, unknown> | undefined)
          : null;
        const result = entitlement ?? { status: 'none' as const };
        AsyncStorage.setItem(cacheKey(userId), JSON.stringify(result));
        callback(result);
      },
      (error) => {
        console.error('Error in subscription subscription:', error);
      }
    );
    return unsubscribe;
  }

  async activate(userId: string, entitlement: SubscriptionEntitlement): Promise<void> {
    await setDoc(doc(db, 'users', userId), { subscription: entitlement }, { merge: true });
    await AsyncStorage.setItem(cacheKey(userId), JSON.stringify(entitlement));
  }

  async purchase(userId: string, productId: string): Promise<SubscriptionEntitlement | null> {
    if (!this.purchaseAdapter) {
      throw new Error('Adaptador de compras no configurado.');
    }
    const entitlement = await this.purchaseAdapter.startPurchase(productId);
    if (entitlement) {
      await this.activate(userId, entitlement);
    }
    return entitlement;
  }

  async restore(userId: string): Promise<SubscriptionEntitlement | null> {
    if (!this.purchaseAdapter) {
      throw new Error('Adaptador de compras no configurado.');
    }
    const entitlement = await this.purchaseAdapter.restorePurchases();
    if (entitlement) {
      await this.activate(userId, entitlement);
    }
    return entitlement;
  }
}