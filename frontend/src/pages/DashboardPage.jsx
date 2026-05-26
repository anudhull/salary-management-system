import { useEffect, useState } from 'react'
import { Row, Col, Table, Select, Typography, Spin } from 'antd'
import { Line, Pie } from '@ant-design/charts'
import StatCard from '../components/StatCard.jsx'
import { getOverview, getByCountry, getRecentHires, getByJobTitle } from '../services/api.js'

const { Title } = Typography

const countryColumns = [
  { title: 'Country',    dataIndex: 'country',    key: 'country' },
  { title: 'Headcount',  dataIndex: 'headcount',  key: 'headcount' },
  { title: 'Avg Salary', dataIndex: 'avg_salary', key: 'avg_salary',
    render: (v) => `$${Number(v).toLocaleString()}` },
  { title: 'Min',        dataIndex: 'min_salary', key: 'min_salary',
    render: (v) => `$${Number(v).toLocaleString()}` },
  { title: 'Max',        dataIndex: 'max_salary', key: 'max_salary',
    render: (v) => `$${Number(v).toLocaleString()}` },
]

const COUNTRIES = [
  'United States','United Kingdom','Canada','Germany','France',
  'Australia','India','Brazil','Japan','Singapore',
]

const jobTitleColumns = [
  { title: 'Job Title',  dataIndex: 'job_title',  key: 'job_title' },
  { title: 'Headcount',  dataIndex: 'headcount',  key: 'headcount' },
  { title: 'Avg Salary', dataIndex: 'avg_salary', key: 'avg_salary',
    render: (v) => `$${Number(v).toLocaleString()}` },
  { title: 'Min',        dataIndex: 'min_salary', key: 'min_salary',
    render: (v) => `$${Number(v).toLocaleString()}` },
  { title: 'Max',        dataIndex: 'max_salary', key: 'max_salary',
    render: (v) => `$${Number(v).toLocaleString()}` },
]

export default function DashboardPage() {
  const [overview,  setOverview]  = useState(null)
  const [countries, setCountries] = useState([])
  const [hires,     setHires]     = useState([])
  const [jobTitles, setJobTitles] = useState([])
  const [loading,   setLoading]   = useState(true)

  const handleCountryChange = async (val) => {
    if (val) {
      const rows = await getByJobTitle(val)
      setJobTitles(rows)
    } else {
      setJobTitles([])
    }
  }

  useEffect(() => {
    Promise.all([getOverview(), getByCountry(), getRecentHires()])
      .then(([ov, ct, hr]) => {
        setOverview(ov)
        setCountries(ct)
        setHires(hr)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />

  return (
    <>
      <Title level={4}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Employees" value={overview?.total} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Active Employees"
            value={overview?.active_count}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Salary"
            value={Math.round(overview?.avg_salary)}
            prefix="$"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Max Salary"
            value={overview?.max_salary}
            prefix="$"
          />
        </Col>
      </Row>

      {/* Recent Hires + Employment Type */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Title level={5}>Recent Hires Trend</Title>
          <Line
            data={hires}
            xField="month"
            yField="hires"
            height={260}
            smooth
          />
        </Col>
        <Col xs={24} lg={10}>
          <Title level={5}>Employment Type</Title>
          <Pie
            data={overview?.employment_breakdown ?? []}
            angleField="count"
            colorField="employment_type"
            height={260}
            label={{ text: 'employment_type' }}
          />
        </Col>
      </Row>

      {/* Country Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Title level={5}>Headcount by Country</Title>
          <Table
            rowKey="country"
            columns={countryColumns}
            dataSource={countries}
            pagination={false}
            size="small"
          />
        </Col>
      </Row>

      {/* Job Title Deep Dive */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Title level={5}>Job Title Breakdown</Title>
          <Select
            placeholder="Select country"
            options={COUNTRIES.map(c => ({ label: c, value: c }))}
            onChange={handleCountryChange}
            allowClear
            style={{ width: 220, marginBottom: 12 }}
          />
          <Table
            rowKey="job_title"
            columns={jobTitleColumns}
            dataSource={jobTitles}
            pagination={false}
            size="small"
          />
        </Col>
      </Row>
    </>
  )
}
