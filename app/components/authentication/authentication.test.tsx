import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Authentication } from './authentication';

const localStorageMock = {
  getItem: jest.fn(),
}

describe('Authentication', () => {
  it('renders without crashing', () => {

    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    localStorageMock.getItem.mockReturnValueOnce('fake_token');

    render(<Authentication useHeap={false} />);
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');

  });
});