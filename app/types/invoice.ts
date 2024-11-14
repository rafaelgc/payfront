export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  PROCESSING = 'processing',
}

export interface Invoice {
  id: string;
  status: InvoiceStatus;
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

export enum InvoicePaymentIntentStatus {
  REQUIRES_PAYMENT_METHOD = 'requires_payment_method',
  PROCESSING = 'processing',
  PAID = 'paid',
}

export interface InvoicePaymentIntent {
  status: InvoicePaymentIntentStatus;
  last_payment_error?: { message: string }
}