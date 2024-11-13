import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { Payments } from '@/app/payments/page'
import axios from 'axios';
import { Invoice } from '@/app/types/invoice';
import { DateTime } from 'luxon';
import { useSearchParams } from "next/navigation";

const invoices: Invoice[] = [
  {
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
];

jest.mock('next/navigation', () => {
  const useSearchParams = jest.fn()

  return {
    useSearchParams
  }
});

describe('Payments Page', () => {
  jest.mock('axios');
  // Mock api call: /api/tenants/invoices
  axios.get = jest.fn().mockResolvedValue({
    data: {
      data: invoices,
      has_more: false,
    }
  })

  beforeEach(() => {
    //jest.resetModules();
  });

  it('Page rendered', async () => {

    useSearchParams.mockReturnValue(new URLSearchParams(''));


    render(<Payments />)

    await waitFor(() => {
      expect(screen.getByTestId('page-title').textContent).toEqual('Pagos');
    });  
  });

  it('Page rendered for customer', async () => {
    useSearchParams.mockReturnValue(new URLSearchParams('tenantId=cus_ASDM'));

    render(<Payments />)

    await waitFor(() => {
      expect(screen.getByTestId('page-title').textContent).toEqual('Pagos de John Doe');
    });  
  });
});
