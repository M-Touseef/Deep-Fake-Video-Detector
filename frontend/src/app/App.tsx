import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { AboutPage } from './components/AboutPage';
import { UploadPage } from './components/UploadPage';
import { VerifyNewsPage } from './components/VerifyNewsPage';
import { ResultsPage } from './components/ResultsPage';
import { HistoryPage } from './components/HistoryPage';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Routes>

            {/* Login */}
            <Route path="/" element={<LoginPage />} />

            {/* USER ONLY ROUTES */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRole="user">
                  <HomePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute allowedRole="user">
                  <AboutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute allowedRole="user">
                  <UploadPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verify-news"
              element={
                <ProtectedRoute allowedRole="user">
                  <VerifyNewsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results/:id"
              element={
                <ProtectedRoute allowedRole="user">
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute allowedRole="user">
                  <HistoryPage />
                </ProtectedRoute>
              }
            />

            {/* ADMIN ONLY ROUTE */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>

          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
