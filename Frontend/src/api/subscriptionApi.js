import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("edupath_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  };
}

/**
 * Fetch current user's subscription status, real-time usage metrics, and limits.
 */
export async function getSubscriptionStatus() {
  const response = await axios.get(`${API_BASE_URL}/subscription/status`, getAuthHeaders());
  return response.data.subscription;
}

/**
 * Upgrade to Premium plan directly (Instant simulation).
 */
export async function upgradeSubscription({ billingCycle = "monthly", paymentDetails = {} }) {
  const response = await axios.post(
    `${API_BASE_URL}/subscription/upgrade`,
    { billingCycle, paymentDetails },
    getAuthHeaders()
  );
  return response.data;
}

/**
 * Cancel/downgrade subscription back to Free plan.
 */
export async function cancelSubscription() {
  const response = await axios.post(`${API_BASE_URL}/subscription/cancel`, {}, getAuthHeaders());
  return response.data;
}

/**
 * Track course view and check against monthly limit.
 */
export async function trackCourseView(courseId) {
  const response = await axios.post(
    `${API_BASE_URL}/subscription/track-view/${courseId}`,
    {},
    getAuthHeaders()
  );
  return response.data;
}

/**
 * Initialize PayHere Sandbox payment order and obtain signed payload.
 */
export async function initPayherePayment({ billingCycle = "monthly" }) {
  const response = await axios.post(
    `${API_BASE_URL}/subscription/payhere-init`,
    { billingCycle },
    getAuthHeaders()
  );
  return response.data.payment;
}

/**
 * Verify PayHere completed payment on backend and upgrade account.
 */
export async function verifyPayherePayment({ billingCycle = "monthly", orderId }) {
  const response = await axios.post(
    `${API_BASE_URL}/subscription/payhere-verify`,
    { billingCycle, orderId },
    getAuthHeaders()
  );
  return response.data;
}
