import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Tristate } from '@/app/components/tristate/tristate'

const renderTristate = (observed: any) => {
  render(
    <Tristate observed={observed}>
      <h1>Loading...</h1>
      <h1>Empty array</h1>
      <h1>With elements</h1>
      <h1>With elements 2</h1>
    </Tristate>
  )
}

describe('Tristate', () => {
  it('content loading (null)', () => {
    renderTristate(null);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...').parentElement?.children.length).toBe(1);
    
  });

  it('content loading (undefined)', () => {
    renderTristate(undefined);
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...').parentElement?.children.length).toBe(1);
  });

  it('no elements', () => {
    renderTristate([]);
    expect(screen.getByText('Empty array')).toBeInTheDocument();
    expect(screen.getByText('Empty array').parentElement?.children.length).toBe(1);
  });

  it('no elements', () => {
    renderTristate([1, 2, 3]);
    expect(screen.getByText('With elements')).toBeInTheDocument();
    expect(screen.getByText('With elements').parentElement?.children.length).toBe(1);
  });
})
