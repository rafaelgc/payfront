import '@testing-library/jest-dom'
import { act, render, screen, waitFor, fireEvent} from '@testing-library/react'
import axios from 'axios';
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
  it('can be saved', async () => {
    jest.mock('axios');
    axios.post = jest.fn();
    axios.post.mockResolvedValue(() => {
      return {
        status: 200,
      }
    });

    render(<AddTenant />);

    act(() => {
      fireEvent.change(screen.getByTestId('tenant-name').querySelector('input') as Element, {target: {value: 'John Doe'}});
      fireEvent.change(screen.getByTestId('tenant-email').querySelector('input') as Element, {target: {value: 'johndoe@habitacional.es'}});
      fireEvent.change(screen.getByTestId('rent').querySelector('input') as Element, {target: {value: '500'}});
      fireEvent.change(screen.getByTestId('entry-date').querySelector('input') as Element, {target: {value: '2024-11-15'}});
      fireEvent.click(screen.getByTestId('save-button'));
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/tenants', {
        email: 'johndoe@habitacional.es',
        name: 'John Doe',
        rent: '500',
        anchorDate: 1,
        entryDate: '2024-11-15',
      }, {
        headers: {
          'Authorization': `Bearer null`
        }
      });
      expect(useRouter().push).toHaveBeenCalledWith('/?newTenant=true');
    });
  });

  it('displays partial rent alert', async () => {
    render(<AddTenant />);

    act(() => {
      fireEvent.change(screen.getByTestId('tenant-name').querySelector('input') as Element, {target: {value: 'John Doe'}});
      fireEvent.change(screen.getByTestId('tenant-email').querySelector('input') as Element, {target: {value: 'johndoe@habitacional.es'}});
      fireEvent.change(screen.getByTestId('rent').querySelector('input') as Element, {target: {value: '500'}});
      fireEvent.change(screen.getByTestId('entry-date').querySelector('input') as Element, {target: {value: '2024-11-15'}});
    });

    await waitFor(() => {
      expect(screen.getByTestId("partial-rent-alert")).toBeInTheDocument();
    });
  });

  it('not displays partial rent alert', async () => {
    render(<AddTenant defaultPayDay={15} />);

    act(() => {
      fireEvent.change(screen.getByTestId('tenant-name').querySelector('input') as Element, {target: {value: 'John Doe'}});
      fireEvent.change(screen.getByTestId('tenant-email').querySelector('input') as Element, {target: {value: 'johndoe@habitacional.es'}});
      fireEvent.change(screen.getByTestId('rent').querySelector('input') as Element, {target: {value: '500'}});
      fireEvent.change(screen.getByTestId('entry-date').querySelector('input') as Element, {target: {value: '2024-11-15'}});
    });

    await waitFor(() => {
      expect(screen.queryByTestId("partial-rent-alert")).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});