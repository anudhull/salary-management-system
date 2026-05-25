import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: { query: jest.fn() },
}))

const { default: app } = await import('../src/app.js')
const { default: pool } = await import('../src/config/db.js')
const { default: request } = await import('supertest')

const mockEmployee = {
  id: 1,
  full_name: 'Jane Doe',
  email: 'jane.doe@company.com',
  job_title: 'Software Engineer',
  department: 'Engineering',
  country: 'United States',
  salary: '95000.00',
  employment_type: 'full-time',
  status: 'active',
  hire_date: '2022-03-15',
}

const validPayload = {
  full_name: 'Jane Doe',
  email: 'jane.doe@company.com',
  job_title: 'Software Engineer',
  department: 'Engineering',
  country: 'United States',
  salary: 95000,
  employment_type: 'full-time',
  status: 'active',
  hire_date: '2022-03-15',
}

describe('POST /api/employees', () => {
  it('creates a new employee and returns 201 with created data', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEmployee] })

    const res = await request(app).post('/api/employees').send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body.full_name).toBe('Jane Doe')
    expect(res.body.email).toBe('jane.doe@company.com')
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 when full_name is missing', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, full_name: '' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 400 when email is invalid', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 400 when salary is negative', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, salary: -1000 })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 400 for invalid employment type', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, employment_type: 'freelance' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })
})
