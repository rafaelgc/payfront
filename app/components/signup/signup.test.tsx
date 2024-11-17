import '@testing-library/jest-dom'
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { SignUp } from "./signup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ACTIONS } from '@/store';

jest.mock('axios');

jest.mock('next/navigation', () => {
  const useRouter = jest.fn().mockReturnValue({
    push: jest.fn()
  });

  return {
    useRouter,
  }
});

const localStorageMock = {
  setItem: jest.fn(),
}

describe('Signup', () => {
  beforeEach(() => {
    localStorageMock.setItem.mockReset();

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it(('should render successfully'), async () => {
    const { getByTestId } = render(<SignUp />);

    expect(getByTestId('email')).toBeInTheDocument();
    expect(getByTestId('password')).toBeInTheDocument();
    expect(getByTestId('submit')).toBeInTheDocument();
    expect(getByTestId('submit')).toBeEnabled();
  });

  it('should signup', async () => {
    const { getByTestId } = render(<SignUp />);

    axios.post = jest.fn();
    axios.post.mockResolvedValue({
      data: {
        token: 'fake_token',
        url: 'https://stripe.com/onboarding'
      },
      status: 200,
    });

    act(() => {
      fireEvent.change(getByTestId('email').querySelector('input') as Element, {target: {value: 'fake@email.com'}});
      fireEvent.change(getByTestId('password').querySelector('input') as Element, {target: {value: 'fakepassword'}});
      fireEvent.click(getByTestId('submit'));
    });

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake_token');
      expect(useRouter().push).toHaveBeenCalledWith('https://stripe.com/onboarding');
    });
  });
});