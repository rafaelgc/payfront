import '@testing-library/jest-dom'
import { fireEvent, render, waitFor } from "@testing-library/react";
import OneOffPayment from "./page";
import axios from 'axios';

jest.mock('axios');
jest.mock('next/navigation', () => {
  const useRouter = jest.fn().mockReturnValue({
    push: jest.fn()
  });

  return {
    useRouter,
  }
});


const tenantWithInvoiceSettings = {
  name: 'John Doe',
  invoice_settings: {
    default_payment_method: 'pm_1234',
  }
};

const tenantWithoutInvoiceSettings = {
  name: 'John Doe',
  invoice_settings: null,
};

describe('OneOff Page', () => {
  it('Page rendered', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: tenantWithInvoiceSettings
    });

    const { getByTestId } = render(<OneOffPayment params={{ tenantId: 'cus_AKSM' }} />)

    await waitFor(() => {
      expect(getByTestId('save-button')).toBeInTheDocument();
      expect(getByTestId('save-button')).toBeDisabled();
    });
  });

  it('warnign for customers without invoice settings', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: tenantWithoutInvoiceSettings
    });

    const { getByTestId } = render(<OneOffPayment params={{ tenantId: 'cus_AKSM' }} />)

    await waitFor(() => {
      expect(getByTestId('no-default-payment-method-alert')).toBeInTheDocument();
    });
  });

  it('no warnign for customers without invoice settings', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: tenantWithInvoiceSettings
    });

    const { getByTestId, queryByTestId } = render(<OneOffPayment params={{ tenantId: 'cus_AKSM' }} />)

    await waitFor(() => {
      expect(queryByTestId('no-default-payment-method-alert')).not.toBeInTheDocument();
    });
  });

  it('validation', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: tenantWithoutInvoiceSettings
    });

    const { getByTestId } = render(<OneOffPayment params={{ tenantId: 'cus_AKSM' }} />);

    await waitFor(() => {
      expect(getByTestId('save-button')).toBeInTheDocument();
      expect(getByTestId('save-button')).toBeDisabled();
    });

    fireEvent.change(getByTestId('amount').querySelector('input') as Element, {target: {value: '12'}});

    await waitFor(() => {
      expect(getByTestId('save-button')).not.toBeDisabled();
    });

    fireEvent.change(getByTestId('amount').querySelector('input') as Element, {target: {value: '0.2'}});
    await waitFor(() => {
      expect(getByTestId('save-button')).toBeDisabled();
    });
  });
});