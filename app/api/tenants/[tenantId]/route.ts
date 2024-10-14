import { validate } from "@/auth/auth";
import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";
import { DateTime } from "luxon";

interface GetTenantProps {
  params: {
    tenantId: string;
  };
}

export async function GET(req: NextRequest, { params }: GetTenantProps) {
  const { accountId } = validate(req);

  const stripe = getClient(accountId);

  const response = await stripe.customers.retrieve(params.tenantId, {
    stripeAccount: accountId,
  });

  console.log('response', response);

  return Response.json(response);
}
