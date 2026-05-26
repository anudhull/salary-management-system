import { render, screen } from '@testing-library/react'
import StatCard from '../components/StatCard.jsx'

describe('StatCard', () => {
  it('renders the title', () => {
    render(<StatCard title="Total Employees" value={10000} />)
    expect(screen.getByText('Total Employees')).toBeInTheDocument()
  })

  it('renders the value', () => {
    render(<StatCard title="Total Employees" value={10000} />)
    expect(screen.getByText('10,000')).toBeInTheDocument()
  })

  it('renders a prefix when provided', () => {
    render(<StatCard title="Avg Salary" value={95000} prefix="$" />)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('renders custom valueStyle when provided', () => {
    render(<StatCard title="Active" value={9000} valueStyle={{ color: '#3f8600' }} />)
    expect(screen.getByText('9,000')).toBeInTheDocument()
  })
})
