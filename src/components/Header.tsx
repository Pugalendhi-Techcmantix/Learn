import { Button, Typography } from 'antd'
import { useTheme } from '../theme/useTheme'

export default function Header() {
  const { theme, toggleTheme, now } = useTheme()

  return (
    <header className="flex items-center gap-4">
      <Typography.Title level={2} className="!m-0">
        Product Lab
      </Typography.Title>
      <span className="text-gray-500 tabular-nums">{now.toLocaleTimeString()}</span>
      <Button onClick={toggleTheme}>Theme: {theme}</Button>
    </header>
  )
}
