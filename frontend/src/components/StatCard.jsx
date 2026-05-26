import { Card, Statistic } from 'antd'

export default function StatCard({ title, value, prefix, suffix, valueStyle }) {
  return (
    <Card>
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
    </Card>
  )
}
