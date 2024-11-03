import { validate } from "@/auth/auth";
import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";

interface GetTenantProps {
  params: {
    tenantId: string;
  };
}

export async function GET(req: NextRequest, { params }: GetTenantProps) {
  const { stripeContext } = validate(req);

  const stripe = getClient(stripeContext);

  const response = await stripe.customers.retrieve(params.tenantId, {
    stripeAccount: stripeContext.accountId,
  });

  console.log('response', response);

  return Response.json(response);
}

export async function POST(req: NextRequest, { params }: GetTenantProps) {
  const { stripeContext } = validate(req);
  if (!req.body) {
    return Response.json({
      message: 'No body provided'
    }, {
      status: 400
    });
  }

  const body = await req.json();

  if (!body.rent) {
    return Response.json({
      message: 'No rent provided'
    }, {
      status: 400
    });
  }

  const stripe = getClient(stripeContext);

  const customerId = params.tenantId;

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId
  }, {
    stripeAccount: stripeContext.accountId,
  });

  const filteredSubscriptions = subscriptions.data.filter((s) => {
    return s.metadata['habitacional'] === 'true'
  });

  if (filteredSubscriptions.length == 0) {
    return Response.json({
      message: 'El inquilino no tiene ninguna suscripción.'
    }, {
      status: 400
    });
  }

  const subscription = filteredSubscriptions[0];

  // About proration_behavior set to None.
  // In general, we want the new price to be applied in the next billing cycle.
  // If we're in the middle of a billing cycle and we increase the price, Stripe will prorate the difference, meaning
  // that the customer will have to pay the difference. I think that difference will be charged in the next billing
  // cycle. Anyways, I don't think this proratio is in general a good idea, so I'm setting it to None.
  await stripe.subscriptions.update(filteredSubscriptions[0].id, {
    items: [{
      id: subscription.items.data[0].id,
      price_data: {
        product: subscription.items.data[0].price.product.toString(),
        recurring: {
          interval: 'month',
        },
        currency: 'eur',
        unit_amount: body.rent * 100,
      },
    }],
    proration_behavior: 'none', // See notes above
  }, {
    stripeAccount: stripeContext.accountId,
  });

  return Response.json({
    message: 'Success'
  });
}