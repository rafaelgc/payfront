import { validate } from "@/auth/auth";
import { getMinimumChargeAmount } from "@/invoice-utils";
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
        limit: 50,
        starting_after: req.nextUrl.searchParams.get('startingAfter') || undefined,
        ending_before: req.nextUrl.searchParams.get('endingBefore') || undefined,
    }, {
        stripeAccount: accountId,
    });

    return Response.json({
        data: response.data,
        has_more: response.has_more,
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

    if (amount <= getMinimumChargeAmount()) {
        return Response.json({
            error_code: 'amount_too_small',
            message: `El importe debe ser al menos de ${getMinimumChargeAmount()}€`,
        }, {
            status: 422
        });
    }

    const stripe = getClient(stripeContext);

    const customerResponse = await stripe.customers.retrieve(customerId, {
        stripeAccount: accountId,
    });
    
    const customer = customerResponse as Stripe.Customer;
    const canChargeAutomatically = !!customer.invoice_settings.default_payment_method;

    try {
        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: canChargeAutomatically ? 'charge_automatically' : 'send_invoice',
            days_until_due: canChargeAutomatically ? undefined : 3,
            currency: 'eur',
            auto_advance: true,
            description,
            statement_descriptor: description.substring(0, 22),
            payment_settings: {
                payment_method_types: [
                    'sepa_debit'
                ],
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

        try {
            await stripe.invoices.finalizeInvoice(invoice.id, {
                stripeAccount: accountId,
            });
        }
        catch (e) {
            await stripe.invoices.del(invoice.id, {
                stripeAccount: accountId,
            });
            console.error((e as any).raw.code);
            throw e;
        }

        if (canChargeAutomatically) {
            await stripe.invoices.pay(invoice.id, {
                stripeAccount: accountId,
            });
        }

        return Response.json({
            message: 'Invoice created',
            data: invoice,
        }, {
            status: 201
        });
    }
    catch (e) {
        console.error(e);
        return Response.json({
            message: `No se ha podido crear el cobro. Detalles: ${(e as any).raw.message}`,
        }, {
            status: 400
        });
    }
}
    