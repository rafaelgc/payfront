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
  const stripe = getClient({
    apiKey: getenv('STRIPE_KEY_FOR_CONNECTED', ''),
  });

  const hashedPassword = hash('sha256', body.password);

  const response = await stripe.accounts.list();
  const accounts = response.data;
  for (const account of accounts) {
    if (account.email === body.email && account.metadata?.habitacional_pass === hashedPassword) {
      return Response.json({
        token: account.id + ':' + generateToken(account.id),
      }, {
        status: 200
      });
    }
  }

  return Response.json({
    message: 'User not found',
  }, {
    status: 404
  });
}