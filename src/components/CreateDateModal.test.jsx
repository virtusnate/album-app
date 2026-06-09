import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateDateModal } from './CreateDateModal'

describe('CreateDateModal', () => {
  it('renders title and date inputs', () => {
    render(<CreateDateModal onClose={() => {}} />)
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn()
    render(<CreateDateModal onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<CreateDateModal onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('disables submit button when title or date is empty', () => {
    render(<CreateDateModal onClose={() => {}} />)
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled()
  })
})
