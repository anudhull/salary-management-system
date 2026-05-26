import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterBar from '../components/FilterBar.jsx'

const COUNTRIES    = ['United States', 'India', 'Germany']
const DEPARTMENTS  = ['Engineering', 'Product', 'HR']

const defaultProps = {
  countries:   COUNTRIES,
  departments: DEPARTMENTS,
  filters:     { search: '', country: null, department: null, employmentType: null, status: null },
  onChange:    () => {},
}

describe('FilterBar', () => {
  it('renders search input', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders country, department, employment type and status dropdowns', () => {
    render(<FilterBar {...defaultProps} />)
    expect(screen.getByText(/country/i)).toBeInTheDocument()
    expect(screen.getByText(/department/i)).toBeInTheDocument()
    expect(screen.getByText(/type/i)).toBeInTheDocument()
    expect(screen.getByText(/status/i)).toBeInTheDocument()
  })

  it('calls onChange with search value when user types', async () => {
    const onChange = vi.fn()
    render(<FilterBar {...defaultProps} onChange={onChange} />)
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'Alice')
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: expect.stringContaining('A') }))
  })

  it('reflects controlled filter values', () => {
    render(<FilterBar {...defaultProps} filters={{ ...defaultProps.filters, search: 'Bob' }} />)
    expect(screen.getByPlaceholderText(/search/i)).toHaveValue('Bob')
  })
})
