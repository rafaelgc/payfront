import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Tristate } from '@/app/components/tristate/tristate'

describe('Tristate', () => {
  it('content loading (null)', () => {
    render(
      <Tristate observed={null}>
        <h1>Loading...</h1>
        <h1>Empty array</h1>
        <h1>With elements</h1>
        <h1>With elements 2</h1>
      </Tristate>
    )
 
    expect(screen.findByText('Loading...')).toBeInTheDocument()
  })

  it('content loading (undefined)', () => {
    render(
      <Tristate observed={undefined}>
        <h1>Loading...</h1>
        <h1>Empty array</h1>
        <h1>With elements</h1>
        <h1>With elements 2</h1>
      </Tristate>
    )
 
    expect(screen.findByText('Loading...')).toBeInTheDocument()
  })
})