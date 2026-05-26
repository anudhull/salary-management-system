import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd'
import dayjs from 'dayjs'

const DEPARTMENTS      = ['Engineering','Product','Design','Marketing','Sales','Finance','HR','Operations','Legal','Support']
const COUNTRIES        = ['United States','United Kingdom','Canada','Germany','France','Australia','India','Brazil','Japan','Singapore']
const EMPLOYMENT_TYPES = ['full-time','part-time','contract']
const STATUSES         = ['active','inactive']

const toOptions = (arr) => arr.map(v => ({ label: v, value: v }))

export default function EmployeeModal({ open, employee, onSubmit, onCancel }) {
  const [form] = Form.useForm()
  const isEdit = Boolean(employee)

  useEffect(() => {
    if (open && employee) {
      form.setFieldsValue({ ...employee, hire_date: dayjs(employee.hire_date) })
    } else if (open) {
      form.resetFields()
    }
  }, [open, employee, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    onSubmit({ ...values, hire_date: values.hire_date.format('YYYY-MM-DD') })
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Edit Employee' : 'Add Employee'}
      okText="Save"
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="job_title" label="Job Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="department" label="Department" rules={[{ required: true }]}>
          <Select options={toOptions(DEPARTMENTS)} />
        </Form.Item>
        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
          <Select options={toOptions(COUNTRIES)} />
        </Form.Item>
        <Form.Item name="salary" label="Salary" rules={[{ required: true }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="employment_type" label="Employment Type" rules={[{ required: true }]}>
          <Select options={toOptions(EMPLOYMENT_TYPES)} />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="active" rules={[{ required: true }]}>
          <Select options={toOptions(STATUSES)} />
        </Form.Item>
        <Form.Item name="hire_date" label="Hire Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
