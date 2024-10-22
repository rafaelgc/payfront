import { validate } from "@/auth/auth";
import { getClient } from "@/stripe/stripe";
import { NextRequest } from "next/server";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
    const { stripeContext } = validate(req);
    const accountId = stripeContext.accountId;

    const stripe = getClient(stripeContext);

    const response = await stripe.invoices.list({
        customer: req.nextUrl.searchParams.get('tenantId') || undefined,
        expand: ['data.payment_intent', 'data.payment_intent.charges', 'data.payment_intent.latest_charge'],
    }, {
        stripeAccount: accountId,
    });

    return Response.json({
        data: response.data,
    });
}

export async function POST(req: NextRequest) {
    const { stripeContext } = validate(req);
    const accountId = stripeContext.accountId;

    if (!req.body) {
        return Response.json({
        message: 'No body provided'
        }, {
        status: 400
        });
    }
    
    const body = await req.json();
    
    const { customerId, amount, description } = body;

    const stripe = getClient(stripeContext);

    const invoice = await stripe.invoices.create({
        customer: customerId,
        collection_method: 'charge_automatically',
        currency: 'eur',
        auto_advance: true,
        description,
        statement_descriptor: description.substring(0, 22),
        payment_settings: {
            
        },
        metadata: {
            habitacional: 'true',
            habitacional_oneoff: 'true',
        }
    }, {
        stripeAccount: accountId,
    });

    await stripe.invoiceItems.create({
        invoice: invoice.id,
        customer: customerId,
        currency: 'eur',
        amount: amount * 100,
        description,
        metadata: {
            habitacional: 'true',
        }
    }, {
        stripeAccount: accountId,
    });

    await stripe.invoices.finalizeInvoice(invoice.id, {
        stripeAccount: accountId,
    });

    await stripe.invoices.pay(invoice.id, {
        stripeAccount: accountId,
    });

    return Response.json({
        message: 'Invoice created',
        data: invoice,
    }, {
        status: 201
    });
}
    