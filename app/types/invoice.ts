export interface Invoice {
  id: string;
  status: string;
  automatically_finalizes_at: number;
  payment_intent?: InvoicePaymentIntent
  attempts: number;
  description: string | null;
  hosted_invoice_status: string | null;
  customer: string;
  customer_name: string;
  amount_due: number;
  created: number;
}

export interface InvoicePaymentIntent {
  status: string;
  last_payment_error?: { message: string }
}