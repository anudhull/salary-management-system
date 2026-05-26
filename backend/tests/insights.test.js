import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: { query: jest.fn() },
}))

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/db.js')
const { default: request } = await import('supertest')

describe('GET /api/insights/by-country', () => {
  it('returns salary stats per country', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { country: 'United States', headcount: '50', avg_salary: '90000.00', min_salary: '50000.00', max_salary: '200000.00' },
        { country: 'India',         headcount: '30', avg_salary: '45000.00', min_salary: '20000.00', max_salary: '100000.00' },
      ],
    })

    const res = await request(app).get('/api/insights/by-country')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].country).toBe('United States')
    expect(res.body[0].headcount).toBe(50)
    expect(res.body[0].avg_salary).toBe('90000.00')
    expect(res.body[0].min_salary).toBe('50000.00')
    expect(res.body[0].max_salary).toBe('200000.00')
  })

  it('returns all expected fields for each country', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ country: 'Germany', headcount: '20', avg_salary: '70000.00', min_salary: '40000.00', max_salary: '120000.00' }],
    })

    const res = await request(app).get('/api/insights/by-country')

    expect(res.status).toBe(200)
    expect(res.body[0]).toMatchObject({
      country:    expect.any(String),
      headcount:  expect.any(Number),
      avg_salary: expect.any(String),
      min_salary: expect.any(String),
      max_salary: expect.any(String),
    })
  })

  it('returns results sorted by headcount descending', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { country: 'United States', headcount: '50', avg_salary: '90000.00', min_salary: '50000.00', max_salary: '200000.00' },
        { country: 'India',         headcount: '30', avg_salary: '45000.00', min_salary: '20000.00', max_salary: '100000.00' },
        { country: 'Germany',       headcount: '10', avg_salary: '70000.00', min_salary: '40000.00', max_salary: '120000.00' },
      ],
    })

    const res = await request(app).get('/api/insights/by-country')

    expect(res.body[0].headcount).toBeGreaterThanOrEqual(res.body[1].headcount)
    expect(res.body[1].headcount).toBeGreaterThanOrEqual(res.body[2].headcount)
  })

  it('returns empty array when no employees exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).get('/api/insights/by-country')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/insights/by-country')

    expect(res.status).toBe(500)
  })
})

describe('GET /api/insights/job-title', () => {
  it('returns salary stats per job title for a given country', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { job_title: 'Software Engineer', headcount: '20', avg_salary: '95000.00', min_salary: '70000.00', max_salary: '130000.00' },
        { job_title: 'Product Manager',   headcount: '10', avg_salary: '105000.00', min_salary: '80000.00', max_salary: '150000.00' },
      ],
    })

    const res = await request(app).get('/api/insights/job-title?country=United States')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0].job_title).toBe('Software Engineer')
    expect(res.body[0].headcount).toBe(20)
    expect(res.body[0].avg_salary).toBe('95000.00')
    expect(res.body[0].min_salary).toBe('70000.00')
    expect(res.body[0].max_salary).toBe('130000.00')
  })

  it('returns results sorted by avg_salary descending', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { job_title: 'Product Manager',   headcount: '10', avg_salary: '105000.00', min_salary: '80000.00', max_salary: '150000.00' },
        { job_title: 'Software Engineer', headcount: '20', avg_salary: '95000.00',  min_salary: '70000.00', max_salary: '130000.00' },
      ],
    })

    const res = await request(app).get('/api/insights/job-title?country=United States')

    expect(parseFloat(res.body[0].avg_salary)).toBeGreaterThanOrEqual(parseFloat(res.body[1].avg_salary))
  })

  it('returns 400 when country param is missing', async () => {
    const res = await request(app).get('/api/insights/job-title')

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns empty array when no employees in that country', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).get('/api/insights/job-title?country=Antarctica')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/insights/job-title?country=United States')

    expect(res.status).toBe(500)
  })
})

describe('GET /api/insights/overview', () => {
  const mockOverview = () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [{
          total: '100',
          avg_salary: '75000.00',
          min_salary: '30000.00',
          max_salary: '200000.00',
          active_count: '90',
        }],
      })
      .mockResolvedValueOnce({
        rows: [
          { employment_type: 'full-time', count: '70' },
          { employment_type: 'part-time', count: '20' },
          { employment_type: 'contract',  count: '10' },
        ],
      })
  }

  it('returns headcount, salary stats and active count', async () => {
    mockOverview()

    const res = await request(app).get('/api/insights/overview')

    expect(res.status).toBe(200)
    expect(res.body.total).toBe(100)
    expect(res.body.active_count).toBe(90)
    expect(res.body.avg_salary).toBe('75000.00')
    expect(res.body.min_salary).toBe('30000.00')
    expect(res.body.max_salary).toBe('200000.00')
  })

  it('returns employment type breakdown with counts as numbers', async () => {
    mockOverview()

    const res = await request(app).get('/api/insights/overview')

    expect(res.body.employment_breakdown).toHaveLength(3)
    expect(res.body.employment_breakdown[0]).toMatchObject({
      employment_type: 'full-time',
      count: 70,
    })
  })

  it('returns all expected top-level fields', async () => {
    mockOverview()

    const res = await request(app).get('/api/insights/overview')

    expect(res.body).toMatchObject({
      total:                expect.any(Number),
      active_count:         expect.any(Number),
      avg_salary:           expect.any(String),
      min_salary:           expect.any(String),
      max_salary:           expect.any(String),
      employment_breakdown: expect.any(Array),
    })
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/insights/overview')

    expect(res.status).toBe(500)
  })
})
