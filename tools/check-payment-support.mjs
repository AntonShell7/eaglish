import assert from 'node:assert/strict';
import { checkoutAmount, createPayment, PRICES, PAYMENT_METHODS } from '../api/_pay.ts';

for (const cycle of Object.keys(PRICES)) {
  assert.equal(checkoutAmount(cycle, undefined), PRICES[cycle]);
  assert.equal(checkoutAmount(cycle, PRICES[cycle]), PRICES[cycle]);
  assert.equal(checkoutAmount(cycle, 5000), 5000);
  for (const total of [null, '5000', NaN, Infinity, -1, PRICES[cycle] - 1, 5000.5, 100001]) {
    assert.equal(checkoutAmount(cycle, total), null);
  }
}
// No network or real payments: verify the exact provider payload for each method.
const originalFetch = globalThis.fetch;
try {
  for (const [method, providerMethod] of Object.entries(PAYMENT_METHODS)) {
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.amount.value, '5000.00');
      assert.equal(body.payment_method_data.type, providerMethod);
      assert.equal(body.metadata.cycle, 'monthly');
      assert.equal(body.metadata.supportRub, '4801');
      return Response.json({ id: 'test', status: 'pending', amount: body.amount,
        confirmation: { confirmation_url: 'https://example.test/payment' } });
    };
    const result = await createPayment({ YOOKASSA_SHOP_ID: 'test', YOOKASSA_SECRET_KEY: 'test' }, {
      method, amountRub: checkoutAmount('monthly', 5000), idempotenceKey: 'test',
      description: 'test', returnUrl: 'https://example.test/return', email: null,
      metadata: { cycle: 'monthly', supportRub: String(5000 - PRICES.monthly) },
    });
    assert.equal(result.amountRub, 5000);
  }
} finally { globalThis.fetch = originalFetch; }
console.log('PASS: support limits, legacy totals, four payment methods, unchanged subscription period');
