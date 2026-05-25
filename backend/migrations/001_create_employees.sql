-- Enable trigram extension for fast name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS employees (
  id              SERIAL PRIMARY KEY,
  full_name       TEXT          NOT NULL,
  email           TEXT          NOT NULL UNIQUE,
  job_title       TEXT          NOT NULL,
  department      TEXT          NOT NULL,
  country         TEXT          NOT NULL,
  salary          NUMERIC(12,2) NOT NULL CHECK (salary >= 0),
  employment_type TEXT          NOT NULL CHECK (employment_type IN ('full-time', 'part-time', 'contract')),
  status          TEXT          NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  hire_date       DATE          NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- For filtering by country
CREATE INDEX IF NOT EXISTS idx_employees_country
  ON employees (country);

-- For "avg salary by job title in a country" insight query
CREATE INDEX IF NOT EXISTS idx_employees_country_jobtitle
  ON employees (country, job_title);

-- For salary by department insight
CREATE INDEX IF NOT EXISTS idx_employees_department
  ON employees (department);

-- For recent hires trend (date range scan)
CREATE INDEX IF NOT EXISTS idx_employees_hire_date
  ON employees (hire_date);

-- For status filter
CREATE INDEX IF NOT EXISTS idx_employees_status
  ON employees (status);

-- For fast full-name substring search (ILIKE '%term%')
CREATE INDEX IF NOT EXISTS idx_employees_fullname_trgm
  ON employees USING GIN (full_name gin_trgm_ops);
