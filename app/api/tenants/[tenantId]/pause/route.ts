import { NextRequest } from "next/server";
import { validate } from "@/auth/auth";
import { getClient } from "@/stripe/stripe";


interface GetTenantProps {
  params: {
    tenantId: string;
  };
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

  if (subscription.pause_collection) {
    await stripe.subscriptions.update(filteredSubscriptions[0].id, {
      pause_collection: null
    });
  }
  else {
    await stripe.subscriptions.update(filteredSubscriptions[0].id, {
      pause_collection: {
        behavior: 'void',
      },
    });
  }

  

  return Response.json({
    message: 'Inquilino modificado con éxito.'
  })
}