import { render, screen } from "@testing-library/react"
import { InvoiceRow } from "./invoice-row"
import { Invoice } from "@/app/types/invoice"
import { DateTime } from "luxon"
import { Table, TableBody } from "@mui/material"
import '@testing-library/jest-dom'

const invoice: Invoice = {
  id: 'in_ASDF',
  status: 'draft',
  automatically_finalizes_at: DateTime.fromISO("2025-01-03T09:03:12.123").toSeconds(),
  payment_intent: {
    status: 'requires_payment_method' // processing
  },
  attempts: 0,
  description: 'Suministros',
  hosted_invoice_status: 'https://habitacional.es',
  customer: 'cus_ASDM',
  customer_name: 'John Doe',
  amount_due: 1253,
  created: DateTime.fromISO("2025-01-01T09:03:12.123").toSeconds(),
}

describe('InvoiceRow', () => {
  it('displays the price with the proper format', () => {
    render(<Table><TableBody><InvoiceRow invoice={invoice} showTenantPaymentsButton={true} /></TableBody></Table>)
    expect(screen.getByTestId('price').innerHTML).toEqual('12,53&nbsp;€');
  });

  it('displays the right link', () => {
    render(<Table><TableBody><InvoiceRow invoice={invoice} showTenantPaymentsButton={true} /></TableBody></Table>)
    expect(screen.getByTestId('customer-link-cell')).toHaveAttribute('href', `/payments?tenantId=${invoice.customer}`);
    expect(screen.getByTestId('customer-link-cell')).toHaveTextContent('John Doe')
  });
})