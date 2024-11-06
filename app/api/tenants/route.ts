import { validate } from "@/auth/auth";
import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { DateTime } from "luxon";

export async function GET(req: NextRequest) {
  const { stripeContext } = validate(req);
  const accountId = stripeContext.accountId;

  const stripe = getClient(stripeContext);

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
  const { stripeContext } = validate(req);
  const accountId = stripeContext.accountId;

  // Test cases you should test when modifying this code:
  // Let's assume that today is November 4th.
  // Case 1: Entry date is today and pay day is 4th.
  // Case 2: Entry date is today and pay day is 15th. -> The pay day is in the future but within the same month.
  // Case 3: Entry date is today and pay day is 1st. -> The pay day is in the future but in the next month.
  // Case 4: Entry date is November 5th and pay day is 5th.
  // Case 5: Entry date is November 5th and pay day is 15th.
  // Case 6: Entry date is November 5th and pay day is 1st.

  const body = await req.json();

  const stripe = getClient(stripeContext);

  if (!req.body) {
    return Response.json({
      message: 'No body provided'
    }, {
      status: 400
    });
  }

  const description = 'Alquiler';

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

  const product = await getRentProduct(description, stripe, accountId);

  try {
    const subscription = await createSubscription(
      customer,
      product,
      description,
      body.rent,
      body.payDay,
      body.entryDate,
      stripe,
      accountId
    );

    return Response.json({
      message: 'Subscription created',
      data: subscription,
    }, {
      status: 201
    });
  }
  catch (error) {
    // Delete the customer.
    console.log('Deleting customer', customer.id, error);
    await stripe.customers.del(customer.id, {
      stripeAccount: accountId
    });
  }

  return Response.json({
    message: 'No se ha podido procesar la solicitud.',
  }, {
    status: 500
  });
}

async function createSubscription(
  customer: Stripe.Customer,
  product: Stripe.Product,
  description: string,
  rent: number,
  payDay: number,
  entryDate: string,
  stripe: Stripe,
  accountId?: string
): Promise<Stripe.Subscription> {
  //let anchor = DateTime.fromISO(anchorDate);
  const entry = DateTime.fromISO(entryDate);
  // ERROR: billing_cycle_anchor cannot be later than next natural billing date (1733356800) for plan
  // anchorDate was set to Dec 5th.
  // entryDate was set to Nov 5th
  // Now is: Nov 4th 21:50 UTC.
  // IMPORTANT: Set anchor hour to current hour. <- Why?
  // This anchor.set causes problem with this setting: current date 4th, entry & anchor: 5th nov.
  /*anchor = anchor.set({
    hour: DateTime.now().hour,
    minute: DateTime.now().minute,
    second: DateTime.now().second,
    millisecond: DateTime.now().millisecond,
  });*/

  // If the entry date is today, there's no trial period.
  let trialEnd: DateTime<boolean> | null = entry;
  if (entry.toISODate() === DateTime.now().toISODate()) {
    trialEnd = null;
  }
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    //billing_cycle_anchor: anchor.toUnixInteger(),
    billing_cycle_anchor_config: {
      day_of_month: payDay
    },
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
          unit_amount: rent * 100,
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

  return subscription;
}

async function getRentProduct(description: string, stripe: Stripe, accountId?: string): Promise<Stripe.Product> {
  const products = await stripe.products.search({
    query: 'metadata["habitacional"]: "true"',
    limit: 1,
  }, {
    stripeAccount: accountId,
  })

  let product = null;
  if (products.data.length === 0) {
    console.log('Creating product');
    product = await stripe.products.create({
      name: description,
      type: 'service',
      metadata: {
        habitacional: 'true'
      }
    }, {
      stripeAccount: accountId
    });
  }
  else {
    console.log('Reuse product');
    product = products.data[0];
  }

  return product;
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