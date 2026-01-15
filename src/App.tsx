import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// JD pages
import { BrowseJDPage } from './pages/jd/BrowseJDPage';
import { CreateJDPage } from './pages/jd/CreateJDPage';
import { EditJDPage } from './pages/jd/EditJDPage';
import { ViewJDPage } from './pages/jd/ViewJDPage';
import { PublicViewJDPage } from './pages/jd/PublicViewJDPage';

// Settings pages
import { SettingsPage } from './pages/settings/SettingsPage';
import { DepartmentsPage } from './pages/settings/DepartmentsPage';
import { TeamsPage } from './pages/settings/TeamsPage';
import { LocationsPage } from './pages/settings/LocationsPage';
import { CompetenciesPage } from './pages/settings/CompetenciesPage';
import { JobBandsPage } from './pages/settings/JobBandsPage';
import { JobGradesPage } from './pages/settings/JobGradesPage';
import { CompanyAssetsPage } from './pages/settings/CompanyAssetsPage';
import { JobPositionsPage } from './pages/settings/JobPositionsPage';

// User pages
import { UsersPage } from './pages/users/UsersPage';
import { ActivityLogPage } from './pages/users/ActivityLogPage';
import { ProfilePage } from './pages/users/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Public JD view route - no authentication required */}
          <Route path="/jd/share/:id" element={<PublicViewJDPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* JD routes */}
            <Route path="job-descriptions" element={<BrowseJDPage />} />
            <Route path="jd">
              <Route index element={<Navigate to="/job-descriptions" replace />} />
              <Route path="create" element={<CreateJDPage />} />
              <Route path=":id" element={<ViewJDPage />} />
              <Route path=":id/edit" element={<EditJDPage />} />
            </Route>

            {/* Settings routes */}
            <Route path="settings">
              <Route index element={<SettingsPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="competencies" element={<CompetenciesPage />} />
              <Route path="job-bands" element={<JobBandsPage />} />
              <Route path="job-grades" element={<JobGradesPage />} />
              <Route path="job-positions" element={<JobPositionsPage />} />
              <Route path="company-assets" element={<CompanyAssetsPage />} />
            </Route>

            {/* User management routes */}
            <Route path="users" element={<UsersPage />} />
            <Route path="activity-log" element={<ActivityLogPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
