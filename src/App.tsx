import { Route, Routes } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { Inbox } from './pages/Inbox'
import { NextActions } from './pages/NextActions'
import { Projects } from './pages/Projects'
import { ProjectDetail } from './pages/ProjectDetail'
import { WaitingFor } from './pages/WaitingFor'
import { SomedayMaybe } from './pages/SomedayMaybe'

function App() {
  return (
    <div className="flex min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Sidebar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Inbox />} />
          <Route path="/next" element={<NextActions />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/waiting" element={<WaitingFor />} />
          <Route path="/someday" element={<SomedayMaybe />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
