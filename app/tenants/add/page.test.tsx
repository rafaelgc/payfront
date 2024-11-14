import '@testing-library/jest-dom'
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react'
import { Payments } from '@/app/payments/page'
import axios from 'axios';
import { Invoice, InvoicePaymentIntentStatus, InvoiceStatus } from '@/app/types/invoice';
import { DateTime } from 'luxon';
import { useRouter } from "next/navigation";
import AddTenant from './page';

const routerPush = jest.fn();

jest.mock('next/navigation', () => {
  const useRouter = jest.fn().mockReturnValue({
    push: jest.fn()
  });

  return {
    useRouter,
  }
});

describe('Add Tenant Page', () => {
  it('unnamed test', async () => {
    jest.mock('axios');
    axios.post = jest.fn();
    axios.post.mockResolvedValue(() => {
      return {
        status: 200,
      }
    });

    render(<AddTenant />);

    act(() => {
      //screen.getByTestId('tenant-name').value = 'John Doe';
      fireEvent.change(screen.getByTestId('tenant-name').querySelector('input') as Element, {target: {value: 'John Doe'}});
      fireEvent.change(screen.getByTestId('tenant-email').querySelector('input') as Element, {target: {value: 'johndoe@habitacional.es'}});
      fireEvent.change(screen.getByTestId('rent').querySelector('input') as Element, {target: {value: '500'}});
      fireEvent.change(screen.getByTestId('pay-day').querySelector('input') as Element, {target: {value: '1'}});
      fireEvent.change(screen.getByTestId('entry-date').querySelector('input') as Element, {target: {value: '2023-01-01'}});
      fireEvent.click(screen.getByTestId('save-button'));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/tenants', {
        email: 'johndoe@habitacional.es',
        name: 'John Doe',
        rent: '500',
        anchorDate: 1,
        entryDate: '2023-01-01',
      }, {
        headers: {
          'Authorization': `Bearer null`
        }
      });
      expect(useRouter().push).toHaveBeenCalledWith('/?newTenant=true');
    });
  });
});