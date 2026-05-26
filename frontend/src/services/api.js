import axios from 'axios'

const http = axios.create({ baseURL: '/api' })

export const getEmployees   = (params)        => http.get('/employees', { params }).then(r => r.data)
export const getEmployee    = (id)            => http.get(`/employees/${id}`).then(r => r.data)
export const createEmployee = (data)          => http.post('/employees', data).then(r => r.data)
export const updateEmployee = (id, data)      => http.put(`/employees/${id}`, data).then(r => r.data)
export const deleteEmployee = (id)            => http.delete(`/employees/${id}`)

export const getOverview    = ()              => http.get('/insights/overview').then(r => r.data)
export const getByCountry   = ()              => http.get('/insights/by-country').then(r => r.data)
export const getByJobTitle  = (country)       => http.get('/insights/job-title', { params: { country } }).then(r => r.data)
export const getRecentHires = (months = 12)   => http.get('/insights/recent-hires', { params: { months } }).then(r => r.data)
