import pool from '../config/db.js'

const parseInts = (...fields) => (row) => {
  const result = { ...row }
  fields.forEach(f => { result[f] = parseInt(result[f]) })
  return result
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
