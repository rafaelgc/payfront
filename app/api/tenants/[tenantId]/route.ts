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
