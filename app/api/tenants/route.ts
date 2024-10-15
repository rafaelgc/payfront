import { validate } from "@/auth/auth";
import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { DateTime } from "luxon";

export async function GET(req: NextRequest) {
  const { accountId } = validate(req);

  const stripe = getClient(accountId);

  const response = await stripe.customers.search({
    query: 'metadata["habitacional"]: "true"',
    expand: ['data.subscriptions'],
  }, {
    stripeAccount: accountId,
  });

  console.log('response', response);

  return Response.json({
    data: response.data,
  });
}

export async function POST(req: NextRequest) {
  // TODO: validate input
  const { accountId } = validate(req);

  const body = await req.json();

  const stripe = getClient(accountId);

  if (!req.body) {
    return Response.json({
      message: 'No body provided'
    }, {
      status: 400
    });
  }

  const description = 'Alquiler C/ Mayor 1, 1A';

  // TODO: Properly handle errors. If the subscription fails, we should delete the customer and the product.

  const customer = await stripe.customers.create({
    name: body.name,
    email: body.email,
    metadata: {
      habitacional: 'true'
    },
    preferred_locales: ['es'],
  }, {
    stripeAccount: accountId
  });

  // TODO: Try to create a sigle product for all the tenants.
  const product = await stripe.products.create({
    name: description,
    type: 'service',
    metadata: {
      habitacional: 'true'
    }
  }, {
    stripeAccount: accountId
  });


  let anchor = DateTime.fromISO(body.anchorDate);
  const entry = DateTime.fromISO(body.entryDate);

  // TODO: if the entry is 8 oct and the pay day is 9, the first payment will
  // be very small. We should try to avoid this situation. Maybe we could
  // ask the user to charge the first payment manually.
  
  // IMPORTANT: Set anchor hour to current hour.
  anchor = anchor.set({
    hour: DateTime.now().hour,
    minute: DateTime.now().minute,
    second: DateTime.now().second,
    millisecond: DateTime.now().millisecond,
  });

  // If the entry date is today, there's no trial period.
  let trialEnd: DateTime<boolean> | null = entry;
  if (entry.toISODate() === DateTime.now().toISODate()) {
    trialEnd = null;
  }

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    billing_cycle_anchor: anchor.toUnixInteger(),
    // The initial collection method is 'send_invoice' because we want to
    // send the invoice to the tenant so he can accept the SEPA authorization.
    // Once the first invoice is paid, the collection method will be automatically
    // changed to 'charge_automatically' via webhook.
    collection_method: 'send_invoice',
    trial_end: trialEnd?.toUnixInteger(),
    days_until_due: 5,
    currency: 'eur',
    description: description,
    items: [
      {
        price_data: {
          currency: 'eur',
          product: product.id,
          recurring: {
            interval: 'month',
          },
          unit_amount: body.rent * 100,
        },
      }
    ],
    payment_settings: {
      payment_method_types: [
        'sepa_debit'
      ]
    },
    metadata: {
      habitacional: 'true'
    }

  }, {
    stripeAccount: accountId
  });

  return Response.json({
    message: 'Subscription created',
    data: subscription,
  }, {
    status: 201
  });
}

/*
  KEEP THIS CODE FOR FUTURE REFERENCE, WHEN STRIPE FIXES THE API BUG.

  This doesn't work because of some kind of bug in the Stripe API.
  The phases should accept payment_settings, and I see that when the
  API is used in the Stripe dashboard.
  Scheduled Subscriptions are great because they allow us to start
  the subscription in the future, but we can't use them yet.

  interface CustomSubscriptionScheduleCreateParams extends Stripe.SubscriptionScheduleCreateParams {
    phases?: (Stripe.SubscriptionScheduleCreateParams.Phase & {
      payment_settings?: {
        payment_method_types: string[];
      };
    })[];
  }

  const scheduleSettings: CustomSubscriptionScheduleCreateParams = {
    start_date: timestamp,
    customer: customer.id,
    phases: [
      {
        billing_cycle_anchor: 'phase_start', // this may not work.
        collection_method: 'send_invoice',
        invoice_settings: {
          days_until_due: 5,
        },
        currency: 'eur',
        description: description,
        items: [
          {
            price_data: {
              currency: 'eur',
              product: product.id,
              recurring: {
                interval: 'month',
              },
              unit_amount: body.rent * 100,
            },
          }
        ],
        metadata: {
          habitacional: 'true'
        },
        payment_settings: {
          payment_method_types: [
            'sepa_debit'
          ]
        }
      }
    ],
  }
  
  const schedule = await stripe.subscriptionSchedules.create(scheduleSettings, {
    stripeAccount: accountId
  });
  */