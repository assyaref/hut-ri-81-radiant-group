import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RegistrationPage from './pages/RegistrationPage';
import CheckinPage from './pages/CheckinPage';
import LoginPage from './pages/LoginPage';
import ParticipantsPage from './pages/ParticipantsPage';
import PrizesPage from './pages/PrizesPage';
import SpinDrawPage from './pages/SpinDrawPage';
import WinnersPage from './pages/WinnersPage';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/admin/UsersPage';
import SettingsPage from './pages/admin/SettingsPage';
import ActivityLogPage from './pages/admin/ActivityLogPage';
import CompetitionsPage from './pages/CompetitionsPage';
import CompetitionDetailPage from './pages/CompetitionDetailPage';
import ScoringPage from './pages/ScoringPage';
import LeaderboardPage from './pages/LeaderboardPage';
import NominationsPage from './pages/NominationsPage';
import CompetitionWinnersPage from './pages/CompetitionWinnersPage';
import LiveCompetitionPage from './pages/LiveCompetitionPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/checkin" element={<CheckinPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/participants"
        element={
          <ProtectedRoute>
            <ParticipantsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prizes"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <PrizesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spin"
        element={
          <ProtectedRoute requireRole="OPERATOR">
            <SpinDrawPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/winners"
        element={
          <ProtectedRoute>
            <WinnersPage />
          </ProtectedRoute>
        }
      />

      {/* Competition management */}
      <Route
        path="/competitions"
        element={
          <ProtectedRoute>
            <CompetitionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competition/:id"
        element={
          <ProtectedRoute>
            <CompetitionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scoring"
        element={
          <ProtectedRoute requireRole="OPERATOR">
            <ScoringPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nominations"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <NominationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competition-winners"
        element={
          <ProtectedRoute>
            <CompetitionWinnersPage />
          </ProtectedRoute>
        }
      />

      {/* Live competition monitor (public, fullscreen) */}
      <Route path="/live-competition" element={<LiveCompetitionPage />} />

      {/* Administration */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireRole="SUPERADMIN">
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireRole="SUPERADMIN">
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/activity"
        element={
          <ProtectedRoute requireRole="ADMIN">
            <ActivityLogPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}

export default App;