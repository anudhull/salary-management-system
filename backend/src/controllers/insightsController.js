import pool from '../config/db.js'

const parseInts = (...fields) => (row) => {
  const result = { ...row }
  fields.forEach(f => { result[f] = parseInt(result[f]) })
  return result
}

export const getOverview = async (req, res) => {
  const [stats, breakdown] = await Promise.all([
    pool.query(`
      SELECT COUNT(*)                                    AS total,
             ROUND(AVG(salary), 2)                       AS avg_salary,
             MIN(salary)                                 AS min_salary,
             MAX(salary)                                 AS max_salary,
             COUNT(*) FILTER (WHERE status = 'active')  AS active_count
      FROM employees
    `),
    pool.query(`
      SELECT employment_type, COUNT(*) AS count
      FROM employees
      GROUP BY employment_type
      ORDER BY count DESC
    `),
  ])

  const s = stats.rows[0]
  res.json({
    total:                parseInt(s.total),
    active_count:         parseInt(s.active_count),
    avg_salary:           s.avg_salary,
    min_salary:           s.min_salary,
    max_salary:           s.max_salary,
    employment_breakdown: breakdown.rows.map(parseInts('count')),
  })
}

export const getRecentHires = async (req, res) => {
  const months = parseInt(req.query.months) || 12

  const { rows } = await pool.query(`
    SELECT TO_CHAR(DATE_TRUNC('month', hire_date), 'YYYY-MM') AS month,
           COUNT(*) AS hires
    FROM employees
    WHERE hire_date >= NOW() - INTERVAL '1 month' * $1
    GROUP BY DATE_TRUNC('month', hire_date)
    ORDER BY 1
  `, [months])

  res.json(rows.map(parseInts('hires')))
}

export const getByJobTitle = async (req, res) => {
  const { country } = req.query

  if (!country) {
    return res.status(400).json({ error: 'country query param is required' })
  }

  const { rows } = await pool.query(`
    SELECT job_title,
           COUNT(*)              AS headcount,
           ROUND(AVG(salary), 2) AS avg_salary,
           MIN(salary)           AS min_salary,
           MAX(salary)           AS max_salary
    FROM employees
    WHERE country = $1
    GROUP BY job_title
    ORDER BY avg_salary DESC
  `, [country])

  res.json(rows.map(parseInts('headcount')))
}

export const getByCountry = async (req, res) => {
  const { rows } = await pool.query(`
    SELECT country,
           COUNT(*)              AS headcount,
           ROUND(AVG(salary), 2) AS avg_salary,
           MIN(salary)           AS min_salary,
           MAX(salary)           AS max_salary
    FROM employees
    GROUP BY country
    ORDER BY headcount DESC
  `)
  res.json(rows.map(parseInts('headcount')))
}
