import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Authentication } from './authentication';
import { ACTIONS, StoreContext, initialState } from '@/store';

const localStorageMock = {
  getItem: jest.fn(),
}

describe('Authentication', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReset();
  });

  it('set token is dispatched', () => {
    const dispatch = jest.fn();

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    localStorageMock.getItem.mockReturnValueOnce('fake_token');

    render(
      <StoreContext.Provider value={{ state: initialState, dispatch }}>
        <Authentication useHeap={false} />
      </StoreContext.Provider>
    );
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_TOKEN, payload: 'fake_token' });

  });

  it('token not loading', () => {
    const dispatch = jest.fn();

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    localStorageMock.getItem.mockReturnValueOnce(undefined);

    render(
      <StoreContext.Provider value={{ state: initialState, dispatch }}>
        <Authentication useHeap={false} />
      </StoreContext.Provider>
    );
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(dispatch).toHaveBeenCalledWith({ type: ACTIONS.SET_NOT_LOADING_TOKEN });

  });
});