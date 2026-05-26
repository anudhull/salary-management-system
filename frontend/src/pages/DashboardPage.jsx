import { useEffect, useState } from 'react'
import { Row, Col, Table, Typography, Spin } from 'antd'
import StatCard from '../components/StatCard.jsx'
import { getOverview, getByCountry, getRecentHires } from '../services/api.js'

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

export default function DashboardPage() {
  const [overview,  setOverview]  = useState(null)
  const [countries, setCountries] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getOverview(), getByCountry(), getRecentHires()])
      .then(([ov, ct]) => {
        setOverview(ov)
        setCountries(ct)
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
    </>
  )
}
