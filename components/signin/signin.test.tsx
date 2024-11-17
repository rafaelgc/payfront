import '@testing-library/jest-dom'
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { SignIn } from "./signin";
import { ACTIONS, initialState, StoreContext } from "@/store";
import axios from "axios";
import { useRouter } from "next/navigation";

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

describe('Signin', () => {
  axios.post = jest.fn();

  beforeEach(() => {
    localStorageMock.setItem.mockReset();

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('should render successfully', async () => {
    const { getByTestId } = render(<SignIn />);

    expect(getByTestId('email')).toBeInTheDocument();
    expect(getByTestId('password')).toBeInTheDocument();
    expect(getByTestId('submit')).toBeInTheDocument();
  });

  it('should login', async () => {
    const dispatch = jest.fn();

    axios.post.mockResolvedValue({
      data: {
        token: 'fake_token',
      }
    });

    const { getByTestId } = render(
      <StoreContext.Provider value={{ state: initialState, dispatch }}>
        <SignIn />
      </StoreContext.Provider>
    );

    act(() => {
      fireEvent.change(getByTestId('email').querySelector('input') as Element, {target: {value: 'fake@email.com'}});
      fireEvent.change(getByTestId('password').querySelector('input') as Element, {target: {value: 'fakepassword'}});
      fireEvent.click(getByTestId('submit'));
    });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_TOKEN, payload: 'fake_token' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake_token');
      expect(useRouter().push).toHaveBeenCalledWith('/');
    });
  });
});