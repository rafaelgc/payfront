import { getenv } from "@/env";
import { env } from "process";
import Stripe from "stripe";

export function getClient(stripeAccount?: string) {
  
  const stripe = new Stripe(getenv('STRIPE_MASTER_KEY', ''), {
    typescript: true,
    stripeAccount,
    // @ts-ignore
    //apiVersion: '2023-08-16'
  });

  return stripe;
}