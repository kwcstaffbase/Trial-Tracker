import { Navigate, Route, Routes } from 'react-router-dom'
import { useData } from './context/DataContext'
import UploadPage from './pages/UploadPage'
import HomePage from './pages/HomePage'
import DiseasePage from './pages/DiseasePage'
import LineOfTherapyPage from './pages/LineOfTherapyPage'
import TrialDetailPage from './pages/TrialDetailPage'
import LoadingScreen from './components/LoadingScreen'

export default function App() {
  const { data, loading, error } = useData()

  // First-time auto-load is in flight — show a spinner so the user doesn't
  // see a flash of the upload page (which would be misleading).
  if (loading && !data && !error) {
    return <LoadingScreen label="Loading trial data from SharePoint…" />
  }

  // No data and not loading → either the auto-load failed or there's no
  // configured URL. Fall back to the upload screen, which displays any
  // error and offers a retry button.
  if (!data) {
    return (
      <Routes>
        <Route path="*" element={<UploadPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/disease/:disease" element={<DiseasePage />} />
      <Route path="/disease/:disease/lot/:lot" element={<LineOfTherapyPage />} />
      <Route path="/trial/:idx" element={<TrialDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
