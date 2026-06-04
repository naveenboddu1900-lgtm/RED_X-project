const stripeActive = !!process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeActive) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('\x1b[32m[Service] Stripe Payment Gateway Initialized\x1b[0m');
} else {
  console.log('\x1b[33m[Service] Stripe API keys absent. Operating in MOCK payment gateway mode.\x1b[0m');
}

/**
 * Creates a payment intent
 * @param {number} amount - Amount in USD (e.g. 10.99)
 * @param {string} currency - currency code
 * @returns {Promise<object>} - Stripe Payment Intent object or Mock representation
 */
const createPaymentIntent = async (amount, currency = 'usd') => {
  const amountInCents = Math.round(amount * 100);

  if (stripeActive) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: currency,
        metadata: { integration: 'saas-multi-tenant' },
      });
      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status,
        mock: false,
      };
    } catch (err) {
      console.error('[Stripe Service] Error creating payment intent:', err.message);
      throw err;
    }
  } else {
    // Return a mock payload representing a Stripe PaymentIntent
    const mockId = `pi_mock_${Math.random().toString(36).substring(2, 15)}`;
    return {
      id: mockId,
      clientSecret: `${mockId}_secret_${Math.random().toString(36).substring(2, 10)}`,
      amount: amount,
      status: 'requires_payment_method',
      mock: true,
    };
  }
};

/**
 * Confirms payment status for an intent (Used in manual/mock overrides)
 */
const confirmMockPayment = async (paymentIntentId) => {
  if (paymentIntentId.startsWith('pi_mock_')) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      mock: true,
    };
  }
  
  if (stripeActive) {
    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: intent.id,
        status: intent.status,
        mock: false,
      };
    } catch (err) {
      console.error('[Stripe Service] Retrieval Error:', err.message);
      throw err;
    }
  }
  
  return { id: paymentIntentId, status: 'failed', mock: true };
};

module.exports = {
  createPaymentIntent,
  confirmMockPayment,
  isMock: !stripeActive,
};
