import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import EmployeesPage from './pages/EmployeesPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

const { Header, Content } = Layout

const navItems = [
  { key: '/', label: <NavLink to="/">Dashboard</NavLink> },
  { key: '/employees', label: <NavLink to="/employees">Employees</NavLink> },
]

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginRight: 32 }}>
            Salary Manager
          </span>
          <Menu theme="dark" mode="horizontal" items={navItems} style={{ flex: 1 }} />
        </Header>
        <Content style={{ padding: '24px 48px' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  )
}
