import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { FollowUpDialog } from './components/FollowUpDialog'
import { MobileHeader, Sidebar } from './components/Sidebar'
import { Calendar } from './pages/Calendar'
import { Inbox } from './pages/Inbox'
import { NextActions } from './pages/NextActions'
import { ProjectDetail } from './pages/ProjectDetail'
import { Projects } from './pages/Projects'
import { Reference } from './pages/Reference'
import { Settings } from './pages/Settings'
import { SomedayMaybe } from './pages/SomedayMaybe'
import { WaitingFor } from './pages/WaitingFor'
import { WeeklyReview } from './pages/WeeklyReview'
import { useApplySettings } from './settings/useSettings'
import { useGtdStore } from './store/useGtdStore'

/** Empties today's tickler into the Inbox on load, when the app regains focus, and hourly. */
function useTickler() {
  const runTickler = useGtdStore((s) => s.runTickler)
  useEffect(() => {
    runTickler()
    const onVisible = () => document.visibilityState === 'visible' && runTickler()
    document.addEventListener('visibilitychange', onVisible)
    const timer = window.setInterval(runTickler, 60 * 60 * 1000)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(timer)
    }
  }, [runTickler])
}

function App() {
  useTickler()
  useApplySettings()
  return (
    <div className="min-h-screen bg-canvas text-ink md:flex">
      <Sidebar />
      <MobileHeader />
      <main className="paper min-h-screen min-w-0 flex-1 pb-36 md:border-l md:border-rule md:pb-0">
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/next" element={<NextActions />} />
          <Route path="/waiting" element={<WaitingFor />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/someday" element={<SomedayMaybe />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/review" element={<WeeklyReview />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Inbox />} />
        </Routes>
      </main>
      <FollowUpDialog />
    </div>
  )
}

export default App
