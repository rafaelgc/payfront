import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('body', body);
  if (body.type === 'invoice.payment_succeeded') {
    // Retrieve the subscription associated with the invoice.
    const subscriptionId = body.data.object.subscription;
    if (subscriptionId) {
      // Modify the subscription to set 'charge_automatically'.
      const stripe = getClient();

      await stripe.subscriptions.update(subscriptionId, {
        collection_method: 'charge_automatically',
      }, {
        stripeAccount: body.account,
      });
    }
  }
  if (body.type === 'invoice.created') {
    const stripe = getClient();
    const subscriptionId = body.data.object.subscription;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        stripeAccount: body.account,
      });

      if (subscription.metadata.habitacional) {
        await stripe.invoices.update(body.data.object.id, {
          metadata: {
            habitacional: 'true',
          },
        }, {
          stripeAccount: body.account,
        });
      }
    }
  }

  return Response.json({
    message: 'Ok',
  });
}