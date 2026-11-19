import { useState } from 'react'
import { Avatar, Button, Drawer, Dropdown, Layout, Menu, Tag, type MenuProps } from 'antd'
import {
  ApiOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ACCENT, INK } from '../config/antdTheme'

const NAV = [
  { path: '/', title: 'Products', label: 'Products', icon: <DashboardOutlined /> },
  { path: '/labs/day1', title: 'Day 1 · React profiling', label: 'Day 1 · Profiling', icon: <ThunderboltOutlined /> },
  { path: '/labs/day2', title: 'Day 2 · Network & auth', label: 'Day 2 · Network & Auth', icon: <SafetyCertificateOutlined /> },
]

const COLLAPSE_KEY = 'sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1'
  } catch {
    return false
  }
}

function saveCollapsed(value: boolean) {
  try {
    localStorage.setItem(COLLAPSE_KEY, value ? '1' : '0')
  } catch {
    // Storage can be blocked (private window). The toggle still works for this visit.
  }
}

// Brand + navigation. Shown in the fixed sidebar on desktop and in a drawer on small screens.
function SidebarContent({
  activePath,
  collapsed = false,
  onNavigate,
}: {
  activePath: string
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const items: MenuProps['items'] = NAV.map((item) => ({
    key: item.path,
    icon: item.icon,
    label: <Link to={item.path}>{item.label}</Link>,
  }))

  return (
    <>
      <div className={`flex h-14 items-center gap-3 ${collapsed ? "justify-center px-0" : "px-5"}`}>
        <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: ACCENT }}>
          <ApiOutlined />
        </span>
        {!collapsed && <span className="font-semibold text-white">Learn Lab</span>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[activePath]}
        items={items}
        inlineCollapsed={collapsed}
        onClick={onNavigate}
        className={collapsed ? "border-0!" : "border-0! px-2"}
      />
    </>
  )
}

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    saveCollapsed(next)
  }

  const current = NAV.find((item) => item.path === pathname) ?? NAV[0]!

  const userMenu: MenuProps['items'] = [
    {
      key: 'who',
      disabled: true,
      label: (
        <div className="py-1">
          <div className="font-medium text-neutral-900">{user?.name}</div>
          <div className="text-xs text-neutral-500">{user?.email}</div>
        </div>
      ),
    },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sign out', onClick: () => void signOut() },
  ]

  return (
    <Layout hasSider className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 overflow-x-hidden overflow-y-auto transition-[width] duration-200 ease-out lg:block ${collapsed ? "w-20" : "w-60"}`}
        style={{ background: INK }}
      >
        <SidebarContent activePath={current.path} collapsed={collapsed} />
      </aside>

      {/* Phone / tablet navigation */}
      <Drawer
        placement="left"
        size={260}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closable={false}
        styles={{ body: { padding: 0, background: INK }, header: { display: 'none' } }}
      >
        <SidebarContent activePath={current.path} onNavigate={() => setDrawerOpen(false)} />
      </Drawer>

      <Layout className="min-w-0">
        <Layout.Header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[#e5e8ec] bg-white/80! px-4! backdrop-blur-md sm:px-6!">
          <div className="flex min-w-0 items-center gap-3">
            {/* Wrapper spans do the show/hide: antd button styles would override Tailwind's hidden on the button itself. */}
            {/* Phone / tablet: opens the drawer */}
            <span className="lg:hidden">
              <Button
                type="text"
                icon={<MenuOutlined />}
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              />
            </span>
            {/* Desktop: shrinks the sidebar to icons and back */}
            <span className="hidden lg:block">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!collapsed}
                onClick={toggleCollapsed}
              />
            </span>
            <h1 className="m-0 truncate text-base font-semibold text-neutral-900">{current.title}</h1>
          </div>

          <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="bottomRight">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-1 hover:bg-neutral-100"
              aria-label="Account menu"
            >
              <span className="hidden text-sm text-neutral-700 md:inline">{user?.email}</span>
              {user?.role === 'ADMIN' && <Tag color="gold" className="m-0!">Admin</Tag>}
              <Avatar style={{ backgroundColor: ACCENT }}>{user?.name.charAt(0).toUpperCase()}</Avatar>
            </button>
          </Dropdown>
        </Layout.Header>

        <Layout.Content className="p-4 sm:p-6">
          <div key={pathname} className="page-in mx-auto max-w-5xl">
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
