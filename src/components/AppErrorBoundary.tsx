import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button, Result } from 'antd'

type Props = { children: ReactNode }
type State = { hasError: boolean }

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled route error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center px-4">
          <Result
            status="error"
            title="Something went wrong"
            subTitle="The page could not be displayed. Reload it to try again."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Reload
              </Button>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}
