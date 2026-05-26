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

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/insights/by-country')

    expect(res.status).toBe(500)
  })
})
