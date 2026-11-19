import { Alert, Button, Space, Spin } from 'antd'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

// Wrap protected routes with this. Anonymous visitors are sent to /login and
// returned to the page they asked for after signing in.
export default function RequireAuth() {
  const { status, retrySessionRestore } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  if (status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spin size="large" description="Restoring your session" />
      </div>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (status === 'restore-error') {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Alert
          type="warning"
          showIcon
          message="Session restore took too long"
          description="The server did not respond in time. Try again, or sign in to continue."
          action={
            <Space direction="vertical">
              <Button type="primary" onClick={() => void retrySessionRestore()}>
                Try again
              </Button>
              <Button
                block
                onClick={() => navigate('/login', { replace: true, state: { from: location.pathname } })}
              >
                Sign in
              </Button>
            </Space>
          }
        />
      </div>
    )
  }

  return <Outlet />
}
