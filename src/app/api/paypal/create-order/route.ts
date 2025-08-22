
// app/api/paypal/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, PAYPAL_API_BASE } from '../_lib';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'USD' } = await req.json();

    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0 || value > 10000) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: value.toFixed(2),
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });

    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
