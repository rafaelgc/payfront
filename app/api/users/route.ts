import { generateToken } from "@/auth/auth";
import { getenv } from "@/env";
import { getClient } from "@/stripe/stripe";
import { hash } from "crypto";
import { NextApiRequest } from "next";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!req.body) {
    return Response.json({
      message: 'No body provided'
    }, {
      status: 400
    });
  }
  const body = await req.json();

  // TODO: ensure that the email is unique.

  const hashedPassword = hash('sha256', body.password);
  const stripe = getClient({
    apiKey: getenv('STRIPE_KEY_FOR_CONNECTED', ''),
  });
  const account = await stripe.accounts.create({
    type: 'standard',
    country: 'ES',
    default_currency: 'eur',
    email: body.email,
    capabilities: {
      sepa_debit_payments: {
        requested: true,
      },
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
    business_type: 'individual',
    business_profile: {
      product_description: 'Alquilo pisos por habitaciones, utilizo Stripe para cobrar a mis inquilinos.',
      mcc: '6513',
    },
    settings: {
      payments: {
        statement_descriptor: 'Alquiler',
      }
    },  
    metadata: {
      'habitacional_pass': hashedPassword,
      //'habitacional_token': token,
    },
  });
  const links = await stripe.accountLinks.create({
    return_url: `http://localhost:3000?stripeStatus=success&stripeAccount=${account.id}`,
    refresh_url: `http://localhost:3000?stripeStatus=error`,
    account: account.id,
    type: 'account_onboarding'
  });

  const token = generateToken(account.id);
  
  // Update the account with the token.
  await stripe.accounts.update(account.id, {
    metadata: {
      'habitacional_token': token,
    }
  });

  return Response.json({
    url: links.url,
    token: account.id + ':' + token,
    message: 'User created',
  }, {
    status: 201
  });
}