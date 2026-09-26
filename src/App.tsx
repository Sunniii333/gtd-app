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
import { SomedayMaybe } from './pages/SomedayMaybe'
import { WaitingFor } from './pages/WaitingFor'
import { WeeklyReview } from './pages/WeeklyReview'
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
  return (
    <div className="min-h-screen bg-canvas text-ink md:flex">
      <Sidebar />
      <MobileHeader />
      <main className="min-w-0 flex-1">
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
          <Route path="*" element={<Inbox />} />
        </Routes>
      </main>
      <FollowUpDialog />
    </div>
  )
}

export default App
