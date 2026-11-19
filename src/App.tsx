import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './auth/RequireAuth'
import AppErrorBoundary from './components/AppErrorBoundary'
import Day1Profiling from './day1/Day1Profiling'
import Day2Network from './day2/Day2Network'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Everything below needs a signed-in user */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="labs/day1" element={<Day1Profiling />} />
            <Route path="labs/day2" element={<Day2Network />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppErrorBoundary>
  )
}

export default App
