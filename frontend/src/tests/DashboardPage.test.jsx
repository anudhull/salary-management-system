import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach } from 'vitest'

vi.mock('../services/api.js', () => ({
  getOverview:    vi.fn(),
  getByCountry:   vi.fn(),
  getRecentHires: vi.fn(),
  getByJobTitle:  vi.fn(),
}))

const { default: DashboardPage } = await import('../pages/DashboardPage.jsx')
const api = await import('../services/api.js')

const mockOverview = {
  total: 10000, active_count: 8965, avg_salary: '95000.00',
  min_salary: '50000.00', max_salary: '280000.00',
  employment_breakdown: [
    { employment_type: 'full-time', count: 6000 },
    { employment_type: 'part-time', count: 2000 },
    { employment_type: 'contract',  count: 2000 },
  ],
}

const mockCountries = [
  { country: 'United States', headcount: 1200, avg_salary: '110000.00', min_salary: '50000.00', max_salary: '280000.00' },
  { country: 'India',         headcount: 900,  avg_salary: '60000.00',  min_salary: '30000.00', max_salary: '150000.00' },
]

const mockHires = [
  { month: '2024-01', hires: 80 },
  { month: '2024-02', hires: 95 },
]

const mockJobTitles = [
  { job_title: 'Software Engineer', headcount: 200, avg_salary: '95000.00', min_salary: '70000.00', max_salary: '130000.00' },
]

describe('DashboardPage', () => {
  beforeEach(() => {
    api.getOverview.mockResolvedValue(mockOverview)
    api.getByCountry.mockResolvedValue(mockCountries)
    api.getRecentHires.mockResolvedValue(mockHires)
    api.getByJobTitle.mockResolvedValue(mockJobTitles)
  })

  afterEach(() => vi.clearAllMocks())

  it('calls all insight APIs on mount', async () => {
    render(<DashboardPage />)
    await waitFor(() => {
      expect(api.getOverview).toHaveBeenCalledOnce()
      expect(api.getByCountry).toHaveBeenCalledOnce()
      expect(api.getRecentHires).toHaveBeenCalledOnce()
    })
  })

  it('displays total employee count', async () => {
    render(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('10,000')).toBeInTheDocument())
  })

  it('displays active employee count', async () => {
    render(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('8,965')).toBeInTheDocument())
  })

  it('displays average salary', async () => {
    render(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('95,000')).toBeInTheDocument())
  })

  it('renders country table with data', async () => {
    render(<DashboardPage />)
    await waitFor(() => expect(screen.getByText('United States')).toBeInTheDocument())
    expect(screen.getByText('India')).toBeInTheDocument()
  })

  it('renders job title section with country selector', async () => {
    render(<DashboardPage />)
    await waitFor(() => screen.getByText('United States'))
    expect(screen.getByText('Job Title Breakdown')).toBeInTheDocument()
  })

  it('fetches job titles when a country is selected', async () => {
    render(<DashboardPage />)
    await waitFor(() => screen.getByText('United States'))
    const selects = screen.getAllByRole('combobox')
    await userEvent.click(selects[selects.length - 1])
    const option = await screen.findByText('United States', { selector: '.ant-select-item-option-content' })
    await userEvent.click(option)
    await waitFor(() => expect(api.getByJobTitle).toHaveBeenCalledWith('United States'))
  })
})
