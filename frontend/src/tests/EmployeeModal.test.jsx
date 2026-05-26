import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmployeeModal from '../components/EmployeeModal.jsx'

const defaultProps = {
  open:     true,
  onSubmit: () => {},
  onCancel: () => {},
  employee: null,
}

describe('EmployeeModal', () => {
  it('renders modal with title "Add Employee" when no employee provided', () => {
    render(<EmployeeModal {...defaultProps} />)
    expect(screen.getByText('Add Employee')).toBeInTheDocument()
  })

  it('renders modal with title "Edit Employee" when employee provided', () => {
    render(<EmployeeModal {...defaultProps} employee={{ id: 1, full_name: 'Alice Smith', email: 'alice@company.com', job_title: 'Engineer', department: 'Engineering', country: 'India', salary: 90000, employment_type: 'full-time', status: 'active', hire_date: '2022-01-01' }} />)
    expect(screen.getByText('Edit Employee')).toBeInTheDocument()
  })

  it('renders all required form fields', () => {
    render(<EmployeeModal {...defaultProps} />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button clicked', async () => {
    const onCancel = vi.fn()
    render(<EmployeeModal {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onSubmit with form data when Save clicked with valid input', async () => {
    const onSubmit = vi.fn()
    render(<EmployeeModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Alice Smith')
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@company.com')
    await userEvent.type(screen.getByLabelText(/job title/i), 'Engineer')
    await userEvent.type(screen.getByLabelText(/department/i), 'Engineering')
    await userEvent.type(screen.getByLabelText(/country/i), 'India')
    await userEvent.type(screen.getByLabelText(/salary/i), '90000')

    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce())
  })

  it('does not call onSubmit when required fields are empty', async () => {
    const onSubmit = vi.fn()
    render(<EmployeeModal {...defaultProps} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled())
  })

  it('pre-fills form fields when editing an existing employee', () => {
    render(<EmployeeModal {...defaultProps} employee={{ id: 1, full_name: 'Bob Jones', email: 'bob@company.com', job_title: 'Designer', department: 'Design', country: 'Germany', salary: 80000, employment_type: 'part-time', status: 'active', hire_date: '2021-06-15' }} />)
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Bob Jones')
    expect(screen.getByLabelText(/email/i)).toHaveValue('bob@company.com')
  })
})
