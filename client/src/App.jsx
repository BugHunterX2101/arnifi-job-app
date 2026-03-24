import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import PostJobPage from './pages/PostJobPage';
import ApplicationsPage from './pages/ApplicationsPage';

function RootRedirect() {
  const { user } = useSelector((s) => s.auth);
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute><JobsPage /></ProtectedRoute>
          } />
          {/* /jobs/new MUST be before /jobs/:id */}
          <Route path="/jobs/new" element={
            <ProtectedRoute><PostJobPage /></ProtectedRoute>
          } />
          <Route path="/jobs/:id" element={
            <ProtectedRoute><JobDetailPage /></ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute><ApplicationsPage /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-sovereign-border mt-20 py-8 text-center">
        <p className="text-sovereign-muted text-xs tracking-widest uppercase">
          © 2024 Sovereign Executive Group · Arnifi
        </p>
      </footer>
    </BrowserRouter>
  );
}
