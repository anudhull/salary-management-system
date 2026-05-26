import { useEffect, useState, useCallback } from 'react'
import { Button, Table, Popconfirm, Tag, Space, Typography } from 'antd'
import FilterBar from '../components/FilterBar.jsx'
import EmployeeModal from '../components/EmployeeModal.jsx'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api.js'

const { Title } = Typography

const COUNTRIES   = ['United States','United Kingdom','Canada','Germany','France','Australia','India','Brazil','Japan','Singapore']
const DEPARTMENTS = ['Engineering','Product','Design','Marketing','Sales','Finance','HR','Operations','Legal','Support']

const initFilters = { search: '', country: null, department: null, employmentType: null, status: null }

export default function EmployeesPage() {
  const [data,      setData]      = useState([])
  const [total,     setTotal]     = useState(0)
  const [page,      setPage]      = useState(1)
  const [pageSize,  setPageSize]  = useState(20)
  const [filters,   setFilters]   = useState(initFilters)
  const [loading,   setLoading]   = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState(null)

  const fetchData = useCallback(async (pg, ps, f) => {
    setLoading(true)
    try {
      const res = await getEmployees({
        page: pg, pageSize: ps,
        search:          f.search          || undefined,
        country:         f.country         || undefined,
        department:      f.department      || undefined,
        employmentType:  f.employmentType  || undefined,
        status:          f.status          || undefined,
      })
      setData(res.data)
      setTotal(res.total)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(page, pageSize, filters) }, [])

  const handleFilterChange = (f) => {
    setFilters(f)
    setPage(1)
    fetchData(1, pageSize, f)
  }

  const handleTableChange = (pagination) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)
    fetchData(pagination.current, pagination.pageSize, filters)
  }

  const openAdd    = ()    => { setEditing(null); setModalOpen(true) }
  const openEdit   = (row) => { setEditing(row);  setModalOpen(true) }
  const closeModal = ()    => setModalOpen(false)

  const handleSubmit = async (values) => {
    if (editing) {
      await updateEmployee(editing.id, values)
    } else {
      await createEmployee(values)
    }
    closeModal()
    fetchData(page, pageSize, filters)
  }

  const handleDelete = async (id) => {
    await deleteEmployee(id)
    fetchData(page, pageSize, filters)
  }

  const columns = [
    { title: 'Name',       dataIndex: 'full_name',       key: 'full_name' },
    { title: 'Email',      dataIndex: 'email',           key: 'email' },
    { title: 'Job Title',  dataIndex: 'job_title',       key: 'job_title' },
    { title: 'Department', dataIndex: 'department',      key: 'department' },
    { title: 'Country',    dataIndex: 'country',         key: 'country' },
    { title: 'Salary',     dataIndex: 'salary',          key: 'salary',
      render: (v) => `$${Number(v).toLocaleString()}` },
    { title: 'Type',       dataIndex: 'employment_type', key: 'employment_type' },
    { title: 'Status',     dataIndex: 'status',          key: 'status',
      render: (v) => <Tag color={v === 'active' ? 'green' : 'default'}>{v}</Tag> },
    { title: 'Hire Date',  dataIndex: 'hire_date',       key: 'hire_date' },
    {
      title: 'Actions', key: 'actions',
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openEdit(row)}>Edit</Button>
          <Popconfirm title="Delete this employee?" onConfirm={() => handleDelete(row.id)}>
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Employees</Title>
        <Button type="primary" onClick={openAdd}>Add Employee</Button>
      </Space>

      <FilterBar
        countries={COUNTRIES}
        departments={DEPARTMENTS}
        filters={filters}
        onChange={handleFilterChange}
      />

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ current: page, pageSize, total, showSizeChanger: true }}
        onChange={handleTableChange}
        size="small"
      />

      <EmployeeModal
        open={modalOpen}
        employee={editing}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </>
  )
}
