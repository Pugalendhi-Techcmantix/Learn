import { Tabs } from 'antd'
import Day1Profiling from './day1/Day1Profiling'
import Day2Network from './day2/Day2Network'

function App() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Tabs
        defaultActiveKey="day2"
        destroyOnHidden
        items={[
          { key: 'day1', label: 'Day 1 · Profiling', children: <Day1Profiling /> },
          { key: 'day2', label: 'Day 2 · Network & Auth', children: <Day2Network /> },
        ]}
      />
    </div>
  )
}

export default App
