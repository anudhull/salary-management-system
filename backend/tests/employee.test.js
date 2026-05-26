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
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      full_name: expect.any(String),
      email: expect.any(String),
      job_title: expect.any(String),
      department: expect.any(String),
      country: expect.any(String),
      salary: expect.any(String),
      employment_type: expect.any(String),
      status: expect.any(String),
      hire_date: expect.any(String),
    })
  })

  const requiredFields = [
    'full_name',
    'email',
    'job_title',
    'department',
    'country',
    'salary',
    'employment_type',
    'hire_date',
  ]

  requiredFields.forEach((field) => {
    it(`returns 400 when ${field} is missing`, async () => {
      const payload = { ...validPayload }
      delete payload[field]

      const res = await request(app).post('/api/employees').send(payload)

      expect(res.status).toBe(400)
      expect(res.body.errors).toBeDefined()
    })
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

  it('returns 400 for invalid status value', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, status: 'terminated' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 400 for invalid hire_date format', async () => {
    const res = await request(app)
      .post('/api/employees')
      .send({ ...validPayload, hire_date: 'not-a-date' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 409 when email already exists', async () => {
    pool.query.mockRejectedValueOnce({ code: '23505' })

    const res = await request(app).post('/api/employees').send(validPayload)

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Email already exists')
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).post('/api/employees').send(validPayload)

    expect(res.status).toBe(500)
  })
})

describe('GET /api/employees/:id', () => {
  it('returns a single employee when found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEmployee] })

    const res = await request(app).get('/api/employees/1')

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(1)
    expect(res.body.full_name).toBe('Jane Doe')
    expect(res.body.email).toBe('jane.doe@company.com')
  })

  it('returns 404 when employee does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).get('/api/employees/999')

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Employee not found')
  })

  it('returns all expected fields in response', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEmployee] })

    const res = await request(app).get('/api/employees/1')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: expect.any(Number),
      full_name: expect.any(String),
      email: expect.any(String),
      job_title: expect.any(String),
      department: expect.any(String),
      country: expect.any(String),
      salary: expect.any(String),
      employment_type: expect.any(String),
      status: expect.any(String),
      hire_date: expect.any(String),
    })
  })

  it('returns 400 for non-numeric id', async () => {
    const res = await request(app).get('/api/employees/abc')

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 400 for negative id', async () => {
    const res = await request(app).get('/api/employees/-1')

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/employees/1')

    expect(res.status).toBe(500)
  })
})

// mocks the two queries the list endpoint always makes
const mockListQuery = (rows = [mockEmployee], count = '1') => {
  pool.query
    .mockResolvedValueOnce({ rows })
    .mockResolvedValueOnce({ rows: [{ count }] })
}

describe('GET /api/employees', () => {
  it('returns 200 with data and total', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees')

    expect(res.status).toBe(200)
    expect(res.body.data).toBeDefined()
    expect(res.body.total).toBeDefined()
  })

  it('returns correct page and pageSize in response', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees?page=2&pageSize=5')

    expect(res.status).toBe(200)
    expect(res.body.page).toBe(2)
    expect(res.body.pageSize).toBe(5)
  })

  it('returns matched employees when searching by name', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees?search=Jane')

    expect(res.status).toBe(200)
    expect(res.body.data[0].full_name).toBe('Jane Doe')
  })

  it('filters employees by country', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees?country=United States')

    expect(res.status).toBe(200)
    expect(res.body.data[0].country).toBe('United States')
  })

  it('filters employees by department', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees?department=Engineering')

    expect(res.status).toBe(200)
    expect(res.body.data[0].department).toBe('Engineering')
  })

  it('filters employees by employment type', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees?employmentType=full-time')

    expect(res.status).toBe(200)
    expect(res.body.data[0].employment_type).toBe('full-time')
  })

  it('filters employees by status', async () => {
    mockListQuery()

    const res = await request(app).get('/api/employees?status=active')

    expect(res.status).toBe(200)
    expect(res.body.data[0].status).toBe('active')
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/api/employees')

    expect(res.status).toBe(500)
  })
})

describe('PUT /api/employees/:id', () => {
  it('updates an employee and returns 200 with updated data', async () => {
    const updated = { ...mockEmployee, job_title: 'Senior Engineer' }
    pool.query.mockResolvedValueOnce({ rows: [updated] })

    const res = await request(app)
      .put('/api/employees/1')
      .send(validPayload)

    expect(res.status).toBe(200)
    expect(res.body.job_title).toBe('Senior Engineer')
  })

  it('returns 404 when employee does not exist', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .put('/api/employees/999')
      .send(validPayload)

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Employee not found')
  })

  it('returns 400 when required field is missing', async () => {
    const { full_name, ...payload } = validPayload

    const res = await request(app)
      .put('/api/employees/1')
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 400 for invalid email on update', async () => {
    const res = await request(app)
      .put('/api/employees/1')
      .send({ ...validPayload, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('returns 409 when updated email already belongs to another employee', async () => {
    pool.query.mockRejectedValueOnce({ code: '23505' })

    const res = await request(app)
      .put('/api/employees/1')
      .send(validPayload)

    expect(res.status).toBe(409)
    expect(res.body.error).toBe('Email already exists')
  })

  it('returns 500 on unexpected database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app)
      .put('/api/employees/1')
      .send(validPayload)

    expect(res.status).toBe(500)
  })
})