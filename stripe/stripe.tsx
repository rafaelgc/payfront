import { getenv } from "@/env";
import { env } from "process";
import Stripe from "stripe";

export interface StripeContext {
  apiKey: string;
  accountId?: string;
}

export function getClient(stripeContext: StripeContext) {
  
  const stripe = new Stripe(stripeContext.apiKey, {
    typescript: true,
    stripeAccount: stripeContext.accountId,
    // @ts-ignore
    //apiVersion: '2023-08-16'
  });

  return stripe;
}