import pool from '../config/db.js'

const parseInts = (...fields) => (row) => {
  const result = { ...row }
  fields.forEach(f => { result[f] = parseInt(result[f]) })
  return result
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
