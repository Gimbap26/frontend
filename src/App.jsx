import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Accounts from './pages/accounts/Accounts.jsx'
import Transactions from './pages/transactions/Transactions.jsx'
import Schedule from './pages/schedule/Schedule.jsx'
import Ai from './pages/ai/Ai.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* 기본 진입은 자산 화면 */}
          <Route path="/" element={<Navigate to="/accounts" replace />} />

          {/* 내 담당 화면 */}
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/schedule" element={<Schedule />} />

          {/* AI 분석 에이전트 (내 담당) */}
          <Route path="/ai" element={<Ai />} />

          {/* 다른 팀원 담당. 화면은 아직 없어 배경만 보인다. */}
          <Route path="/home" element={null} />
          <Route path="/weather" element={null} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
