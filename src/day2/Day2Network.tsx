import { useEffect, useState } from 'react'
import { Alert, Button, Card, Descriptions, Space, Table, Tag, Typography } from 'antd'
import { api } from '../api/client'
import { getAccessToken, refreshAccessToken } from '../api/client'
import { describeError } from '../api/errors'
import { env } from '../config/env'
import { useAuth } from '../auth/useAuth'
import { decodeJwt } from './jwt'

type LogRow = { id: number; time: string; label: string; ok: boolean; detail: string; ms: number }

export default function Day2Network() {
  const { user } = useAuth()
  const [expiresAt, setExpiresAt] = useState<number | null>(() => tokenExpiry())
  const [now, setNow] = useState(() => Date.now())
  const [log, setLog] = useState<LogRow[]>([])

  // Countdown so you can watch the 30s access token expire.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  function addLog(label: string, ok: boolean, detail: string, startedAt: number) {
    setLog((rows) => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        label,
        ok,
        detail,
        ms: Math.round(performance.now() - startedAt),
      },
      ...rows,
    ])
  }

  async function run(label: string, request: () => Promise<string>) {
    const startedAt = performance.now()
    try {
      addLog(label, true, await request(), startedAt)
    } catch (error) {
      addLog(label, false, describeError(error), startedAt)
    } finally {
      // The token may have changed after a silent refresh.
      setExpiresAt(tokenExpiry())
    }
  }

  // The same protected call with fetch: fetch does NOT throw on 401/500, you must check res.ok.
  function productsWithFetch() {
    return run('fetch GET /api/products', async () => {
      const token = getAccessToken()
      const res = await fetch(`${env.apiUrl}/api/products`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(`fetch got ${res.status} (res.ok = false): ${body.message ?? ''}`)
      }
      return `fetch: ${body.products.length} products (res.ok = true)`
    })
  }

  const secondsLeft = expiresAt ? Math.max(0, Math.round((expiresAt - now) / 1000)) : null

  return (
    <Space orientation="vertical" size="large" className="w-full">
      <Alert
        type="info"
        showIcon
        title="Open DevTools → Network tab (tick “Preserve log”) and Console before you click anything."
      />

      <Card title="Session" size="small">
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Signed in as">
            {user?.email} <Tag color={user?.role === 'ADMIN' ? 'gold' : 'blue'}>{user?.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Access token expires in">
            {secondsLeft === null ? '—' : secondsLeft > 0 ? `${secondsLeft}s` : <Tag color="red">expired</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="API tests" size="small">
        <Space wrap>
          <Button
            onClick={() =>
              run('GET /api/me', async () => {
                const res = await api.get<{ user: { email: string } }>('/api/me')
                return `I am ${res.data.user.email}`
              })
            }
          >
            /api/me
          </Button>
          <Button
            onClick={() =>
              run('GET /api/products', async () => {
                const res = await api.get<{ products: unknown[] }>('/api/products')
                return `${res.data.products.length} products`
              })
            }
          >
            Products (axios)
          </Button>
          <Button onClick={productsWithFetch}>Products (fetch)</Button>
          <Button
            onClick={() =>
              run('GET /api/admin/users', async () => {
                const res = await api.get<{ users: unknown[] }>('/api/admin/users')
                return `${res.data.users.length} users`
              })
            }
          >
            Admin users (403 test)
          </Button>
          <Button
            onClick={() =>
              run('GET /api/slow', async () => {
                // This call takes 5s on the server; a 3s timeout makes it fail on purpose.
                const res = await api.get<{ message: string }>('/api/slow', { timeout: 3000 })
                return res.data.message
              })
            }
          >
            Slow (timeout test)
          </Button>
          <Button
            danger
            onClick={() =>
              run('GET /api/error', async () => {
                await api.get('/api/error')
                return 'unexpected success'
              })
            }
          >
            Server error (500)
          </Button>
          <Button
            onClick={() =>
              run('POST /auth/refresh', async () => {
                await refreshAccessToken()
                return 'New access token received'
              })
            }
          >
            Refresh token now
          </Button>
        </Space>
      </Card>

      <Card
        title="Request log"
        size="small"
        extra={<Button size="small" onClick={() => setLog([])}>Clear</Button>}
      >
        <Table<LogRow>
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={log}
          locale={{ emptyText: 'Click a button above' }}
          columns={[
            { title: 'Time', dataIndex: 'time', width: 100 },
            { title: 'Request', dataIndex: 'label', width: 200 },
            {
              title: 'Result',
              dataIndex: 'ok',
              width: 80,
              render: (ok: boolean) => <Tag color={ok ? 'green' : 'red'}>{ok ? 'OK' : 'FAIL'}</Tag>,
            },
            { title: 'Detail', dataIndex: 'detail' },
            { title: 'ms', dataIndex: 'ms', width: 70 },
          ]}
        />
        <Typography.Text type="secondary">Every row here should match a request in the Network tab.</Typography.Text>
      </Card>
    </Space>
  )
}

function tokenExpiry(): number | null {
  const token = getAccessToken()
  const payload = token ? decodeJwt(token) : null
  return payload ? payload.exp * 1000 : null
}
