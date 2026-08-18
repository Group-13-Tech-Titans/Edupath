/**
 * Resolves premium status from subscription API data and/or auth user payload.
 * Falls back to currentUser.subscription when the subscription endpoint is unavailable.
 */
export function isPremiumUser(subscription, currentUser) {
  return (
    subscription?.isPremium === true ||
    subscription?.plan === "premium" ||
    currentUser?.subscription?.isPremium === true ||
    currentUser?.subscription?.plan === "premium"
  );
}
