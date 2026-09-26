import { Platform } from 'react-native';
import {
  PurchaseError,
  PurchaseStateAndroid,
  endConnection,
  finishTransaction,
  getAvailablePurchases,
  getSubscriptions,
  initConnection,
  requestSubscription,
} from 'react-native-iap';
import type {
  Purchase,
  SubscriptionAndroid,
  SubscriptionOffer,
  SubscriptionPurchase,
} from 'react-native-iap';
import { IPurchaseAdapter } from '../../domain/repositories';
import { SubscriptionEntitlement } from '../../domain/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PERIOD_MS = 30 * DAY_MS;

const RECURRING_RECURRENCE_MODE = 2;

function parseBillingPeriodMs(period?: string | null): number | null {
  if (!period) return null;
  const match = /^P(\d+)(D|W|M|Y)$/.exec(period.trim());
  if (!match) return null;
  const amount = parseInt(match[1], 10);
  switch (match[2]) {
    case 'D':
      return amount * DAY_MS;
    case 'W':
      return amount * 7 * DAY_MS;
    case 'M':
      return amount * 30 * DAY_MS;
    case 'Y':
      return amount * 365 * DAY_MS;
    default:
      return null;
  }
}

function resolveBillingPeriodMs(subscription: SubscriptionAndroid): number | null {
  const offers = subscription.subscriptionOfferDetails ?? [];
  for (const offer of offers) {
    for (const phase of offer.pricingPhases.pricingPhaseList) {
      if (
        phase.recurrenceMode === RECURRING_RECURRENCE_MODE &&
        (phase.billingCycleCount ?? 0) === 0
      ) {
        const parsed = parseBillingPeriodMs(phase.billingPeriod);
        if (parsed !== null) return parsed;
      }
    }
  }
  return null;
}

function pickOfferToken(subscription: SubscriptionAndroid): string | undefined {
  const offers = subscription.subscriptionOfferDetails ?? [];
  const plainRecurring = offers.find((offer) => {
    const firstPhase = offer.pricingPhases.pricingPhaseList[0];
    return firstPhase && firstPhase.recurrenceMode === RECURRING_RECURRENCE_MODE;
  });
  return (plainRecurring ?? offers[0])?.offerToken;
}

function toAndroidSubscription(subscription: unknown): SubscriptionAndroid | undefined {
  return subscription && 'subscriptionOfferDetails' in (subscription as object)
    ? (subscription as SubscriptionAndroid)
    : undefined;
}

export class GooglePlayPurchaseAdapter implements IPurchaseAdapter {
  constructor(private readonly productIds: string[]) {}

  async startPurchase(productId: string): Promise<SubscriptionEntitlement | null> {
    if (Platform.OS !== 'android') return null;

    await this.ensureConnected();
    try {
      const subscription = await this.fetchSubscription(productId);
      const offerToken = subscription ? pickOfferToken(subscription) : undefined;

      if (!subscription || !offerToken) {
        throw new Error('La suscripción no está disponible en Google Play.');
      }

      const offers: SubscriptionOffer[] = [{ sku: productId, offerToken }];
      const result = await requestSubscription({ subscriptionOffers: offers });

      const purchase = Array.isArray(result) ? result[0] : result;
      if (!purchase || purchase.productId !== productId) {
        return null;
      }

      await this.acknowledge(purchase);

      return this.buildEntitlement(purchase, subscription);
    } catch (error) {
      if (error instanceof PurchaseError && error.code === 'E_USER_CANCELLED') {
        return null;
      }
      throw error;
    } finally {
      await endConnection().catch(() => {});
    }
  }

  async restorePurchases(): Promise<SubscriptionEntitlement | null> {
    if (Platform.OS !== 'android') return null;

    await this.ensureConnected();
    try {
      const purchased = await getAvailablePurchases();
      const owned = purchased.find(
        (purchase) =>
          this.productIds.includes(purchase.productId) &&
          purchase.purchaseStateAndroid === PurchaseStateAndroid.PURCHASED
      );

      if (!owned) return null;

      await this.acknowledge(owned);

      return this.buildEntitlement(owned, await this.fetchSubscription(owned.productId));
    } finally {
      await endConnection().catch(() => {});
    }
  }

  private async ensureConnected(): Promise<void> {
    const connected = await initConnection();
    if (!connected) {
      throw new Error('No se pudo conectar con Google Play Billing.');
    }
  }

  private async fetchSubscription(productId: string): Promise<SubscriptionAndroid | undefined> {
    const subscriptions = await getSubscriptions({ skus: [productId] });
    const found = subscriptions.find(
      (subscription) => subscription.productId === productId
    );
    return toAndroidSubscription(found);
  }

  private async acknowledge(purchase: Purchase): Promise<void> {
    try {
      await finishTransaction({ purchase, isConsumable: false });
    } catch (error) {
      console.warn('No se pudo confirmar la compra en Google Play:', error);
    }
  }

  private buildEntitlement(
    purchase: SubscriptionPurchase,
    subscription?: SubscriptionAndroid
  ): SubscriptionEntitlement {
    const startedAt = typeof purchase.transactionDate === 'number' ? purchase.transactionDate : Date.now();
    const periodMs = subscription ? resolveBillingPeriodMs(subscription) : null;
    const firstOffer = subscription?.subscriptionOfferDetails?.[0];

    return {
      status: 'active',
      plan: firstOffer?.basePlanId ?? 'monthly',
      productId: purchase.productId,
      provider: 'google-play',
      startedAt,
      expiresAt: startedAt + (periodMs ?? DEFAULT_PERIOD_MS),
      autoRenewing: purchase.autoRenewingAndroid ?? true,
      environment: 'production',
      updatedAt: Date.now(),
    };
  }
}