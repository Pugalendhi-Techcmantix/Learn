import { useState } from 'react'
import { Alert, Button, Form, Input } from 'antd'
import { ApiOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Navigate, useLocation } from 'react-router-dom'
import { serverMessage } from '../api/errors'
import { useAuth } from '../auth/useAuth'
import { ACCENT, INK } from '../config/antdTheme'

type FormValues = { email: string; password: string }

// Vite removes this development-only branch from production builds.
const TEST_ACCOUNTS: { label: string; values: FormValues }[] =
  import.meta.env.DEV && import.meta.env.VITE_TEST_PASSWORD
    ? [
        { label: 'User', values: { email: 'user@example.com', password: import.meta.env.VITE_TEST_PASSWORD } },
        { label: 'Admin', values: { email: 'admin@example.com', password: import.meta.env.VITE_TEST_PASSWORD } },
      ]
    : []

const LABS = [
  { icon: <ThunderboltOutlined />, title: 'React profiling', text: 'Find and fix slow re-renders with DevTools.' },
  { icon: <SafetyCertificateOutlined />, title: 'Network and auth', text: 'Debug CORS, JWT expiry and API errors.' },
]

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl text-white" style={{ background: ACCENT }}>
        <ApiOutlined className="text-lg" />
      </span>
      <span className={`text-lg font-semibold ${dark ? 'text-white' : 'text-neutral-900'}`}>Learn Lab</span>
    </div>
  )
}

export default function LoginPage() {
  const { status, signIn } = useAuth()
  const location = useLocation()
  const [form] = Form.useForm<FormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  async function onFinish(values: FormValues) {
    setSubmitting(true)
    setError(null)
    try {
      await signIn(values.email, values.password)
    } catch (err) {
      setError(serverMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      {/* Left: what this app is */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{
          background: `radial-gradient(60rem 36rem at 0% 110%, rgba(15,118,110,0.35), transparent 60%), ${INK}`,
        }}
      >
        <Brand dark />

        <div className="max-w-md">
          <h1 className="m-0 text-4xl leading-tight font-semibold text-balance">
            Daily labs for full-stack and DevOps practice
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#aab3bd]">
            Each day adds a working feature to this project. Sign in to open the labs.
          </p>

          <ul className="m-0 mt-8 flex list-none flex-col gap-3 p-0">
            {LABS.map((lab) => (
              <li key={lab.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="mt-0.5 text-lg text-[#5eead4]">{lab.icon}</span>
                <div>
                  <div className="font-medium">{lab.title}</div>
                  <div className="text-sm text-[#aab3bd]">{lab.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="m-0 text-sm text-[#8b95a1]">Full-Stack &amp; DevOps Upskilling, Nov – Dec 2026</p>
      </aside>

      {/* Right: the form */}
      <main className="flex items-center justify-center bg-[#f3f5f7] p-4 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <Brand />
          </div>

          <div className="rounded-2xl border border-[#e5e8ec] bg-white p-6 sm:p-8">
            <h2 className="m-0 text-2xl font-semibold">Sign in</h2>
            <p className="mt-1 mb-6 text-neutral-600">Use your account to open the labs.</p>

            {error && <Alert type="error" showIcon title={error} className="mb-4!" role="alert" />}

            <Form form={form} layout="vertical" requiredMark={false} onFinish={onFinish} disabled={submitting}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Enter your email.' },
                  { type: 'email', message: 'Enter a valid email address.' },
                ]}
              >
                <Input size="large" prefix={<MailOutlined />} autoComplete="username" />
              </Form.Item>
              <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter your password.' }]}>
                <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
                Sign in
              </Button>
            </Form>
          </div>

          {import.meta.env.DEV && TEST_ACCOUNTS.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
              <span>Test accounts (local database):</span>
              {TEST_ACCOUNTS.map((account) => (
                <Button
                  key={account.label}
                  size="small"
                  onClick={() => {
                    form.setFieldsValue(account.values)
                    setError(null)
                  }}
                >
                  Fill {account.label.toLowerCase()}
                </Button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
