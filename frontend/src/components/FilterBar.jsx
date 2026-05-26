import { Input, Select, Space } from 'antd'

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract']
const STATUSES         = ['active', 'inactive']

const toOptions = (arr) => arr.map(v => ({ label: v, value: v }))

export default function FilterBar({ countries, departments, filters, onChange }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value ?? null })

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Input
        placeholder="Search by name"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        allowClear
        style={{ width: 220 }}
      />
      <Select
        placeholder="Country"
        value={filters.country}
        options={toOptions(countries)}
        onChange={set('country')}
        allowClear
        style={{ width: 180 }}
      />
      <Select
        placeholder="Department"
        value={filters.department}
        options={toOptions(departments)}
        onChange={set('department')}
        allowClear
        style={{ width: 160 }}
      />
      <Select
        placeholder="Type"
        value={filters.employmentType}
        options={toOptions(EMPLOYMENT_TYPES)}
        onChange={set('employmentType')}
        allowClear
        style={{ width: 140 }}
      />
      <Select
        placeholder="Status"
        value={filters.status}
        options={toOptions(STATUSES)}
        onChange={set('status')}
        allowClear
        style={{ width: 130 }}
      />
    </Space>
  )
}
