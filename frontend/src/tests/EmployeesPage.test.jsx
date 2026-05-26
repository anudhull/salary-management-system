import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach } from 'vitest'

vi.mock('../services/api.js', () => ({
  getEmployees:   vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}))

const { default: EmployeesPage } = await import('../pages/EmployeesPage.jsx')
const api = await import('../services/api.js')

const mockData = {
  data: [
    { id: 1, full_name: 'Alice Smith', email: 'alice@company.com', job_title: 'Engineer',
      department: 'Engineering', country: 'India', salary: 90000,
      employment_type: 'full-time', status: 'active', hire_date: '2022-01-01' },
  ],
  total: 1, page: 1, pageSize: 20,
}

describe('EmployeesPage', () => {
  beforeEach(() => {
    api.getEmployees.mockResolvedValue(mockData)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders Add Employee button', () => {
    render(<EmployeesPage />)
    expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument()
  })

  it('renders FilterBar search input', () => {
    render(<EmployeesPage />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('calls getEmployees on mount', async () => {
    render(<EmployeesPage />)
    await waitFor(() => expect(api.getEmployees).toHaveBeenCalledOnce())
  })

  it('displays employee data in table after loading', async () => {
    render(<EmployeesPage />)
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    expect(screen.getByText('alice@company.com')).toBeInTheDocument()
  })

  it('opens modal when Add Employee is clicked', async () => {
    render(<EmployeesPage />)
    await userEvent.click(screen.getByRole('button', { name: /add employee/i }))
    expect(screen.getByText('Add Employee')).toBeInTheDocument()
  })

  it('shows Edit button per table row', async () => {
    render(<EmployeesPage />)
    await waitFor(() => screen.getByText('Alice Smith'))
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('shows Delete button per table row', async () => {
    render(<EmployeesPage />)
    await waitFor(() => screen.getByText('Alice Smith'))
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
