import { getenv } from "@/env";
import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('body', body);

  const accountId = body.account; // Undefined if the event comes from my account, not from a connected one.
  const key = accountId ? getenv('STRIPE_KEY_FOR_CONNECTED', '') : getenv('STRIPE_KEY_FOR_ME', '')

  const stripe = getClient({
    apiKey: key,
  });

  if (body.type === 'invoice.payment_succeeded') {
    // Retrieve the subscription associated with the invoice.
    const subscriptionId = body.data.object.subscription;
    if (subscriptionId) {
      // Modify the subscription to set 'charge_automatically'.

      await stripe.subscriptions.update(subscriptionId, {
        collection_method: 'charge_automatically',
      }, {
        stripeAccount: accountId,
      });
    }
  }
  if (body.type === 'invoice.created') {
    const subscriptionId = body.data.object.subscription;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        stripeAccount: accountId,
      });

      if (subscription.metadata.habitacional) {
        await stripe.invoices.update(body.data.object.id, {
          metadata: {
            habitacional: 'true',
          },
        }, {
          stripeAccount: accountId,
        });
      }
    }
  }

  return Response.json({
    message: 'Ok',
  });
}