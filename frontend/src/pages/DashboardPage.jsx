import { useEffect, useState } from 'react'
import { Row, Col, Typography, Spin } from 'antd'
import StatCard from '../components/StatCard.jsx'
import { getOverview, getByCountry, getRecentHires } from '../services/api.js'

const { Title } = Typography

export default function DashboardPage() {
  const [overview,  setOverview]  = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getOverview(), getByCountry(), getRecentHires()])
      .then(([ov]) => {
        setOverview(ov)
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
    </>
  )
}
