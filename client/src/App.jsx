import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/auth/ProtectedRoute'
import FramesPage from './pages/FramesPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import ReportPage from './pages/ReportPage'
import Register from './pages/Register'
import ResultsPage from './pages/ResultsPage'
import SignIn from './pages/SignIn'
import UploadPage from './pages/UploadPage'

export default function App() {
  const path = window.location.pathname

  if (path === '/signin') return <SignIn />
  if (path === '/register') return <Register />
  if (path === '/upload' || path === '/upload-video') return <ProtectedRoute allowedRole="user"><UploadPage /></ProtectedRoute>
  if (path === '/results' || path.startsWith('/results/')) return <ProtectedRoute allowedRole="user"><ResultsPage /></ProtectedRoute>
  if (path === '/frames') return <ProtectedRoute allowedRole="user"><FramesPage /></ProtectedRoute>
  if (path === '/report') return <ProtectedRoute allowedRole="user"><ReportPage /></ProtectedRoute>
  if (path === '/history' || path === '/previous-videos' || path === '/home') return <ProtectedRoute allowedRole="user"><HistoryPage /></ProtectedRoute>
  if (path === '/admin') return <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>

  return <HomePage />
}
