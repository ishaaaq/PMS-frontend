import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import ProjectListPage from './pages/ProjectListPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ConsultantListPage from './pages/ConsultantListPage';
import ConsultantDetailPage from './pages/ConsultantDetailPage';
import BudgetPage from './pages/BudgetPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
// Consultant Pages
import ConsultantDashboard from './pages/consultant/ConsultantDashboard';
import ConsultantProjectList from './pages/consultant/ConsultantProjectList';
import ConsultantProjectDetails from './pages/consultant/ConsultantProjectDetails';
import SubmissionQueue from './components/consultant/SubmissionQueue';
import ConsultantContractors from './pages/consultant/ConsultantContractors';
import ConsultantNotifications from './pages/consultant/ConsultantNotifications';
import ConsultantReports from './pages/consultant/ConsultantReports';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import type { UserRole } from './services/mockRole';

function DevRoleSwitcher() {
  const { login, user } = useAuth();

  if (import.meta.env.MODE === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
      {(['ADMIN', 'CONSULTANT', 'CONTRACTOR'] as UserRole[]).map((role) => (
        <button
          key={role}
          onClick={() => login(user?.email || 'test@ptdf.gov.ng', role)}
          className={`text-[10px] px-2 py-1 rounded ${user?.role === role ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}


function RoleBasedRedirect() {
  const { user } = useAuth();

  if (user?.role === 'CONSULTANT') {
    return <ConsultantDashboard />;
  }
  // Default to Admin/Standard view for now
  return <DashboardHome />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Split Dashboard Home based on Role */}
            <Route index element={
              <RoleBasedRedirect />
            } />

            {/* Admin Dashboard */}
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardHome />
              </ProtectedRoute>
            } />

            {/* Consultant Routes */}
            <Route path="consultant" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantDashboard />
              </ProtectedRoute>
            } />
            <Route path="consultant/projects" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantProjectList />
              </ProtectedRoute>
            } />
            <Route path="consultant/projects/:id" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantProjectDetails />
              </ProtectedRoute>
            } />
            <Route path="consultant/verification-queue" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <SubmissionQueue />
              </ProtectedRoute>
            } />
            <Route path="consultant/contractors" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantContractors />
              </ProtectedRoute>
            } />
            <Route path="consultant/notifications" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantNotifications />
              </ProtectedRoute>
            } />
            <Route path="consultant/reports" element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantReports />
              </ProtectedRoute>
            } />

            {/* Shared/Admin Routes (Legacy - will strictly separate later) */}
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/new" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateProjectPage />
              </ProtectedRoute>
            } />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="consultants" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ConsultantListPage />
              </ProtectedRoute>
            } />
            <Route path="consultants/:id" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ConsultantDetailPage />
              </ProtectedRoute>
            } />
            <Route path="budget" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <BudgetPage />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CONSULTANT', 'CONTRACTOR']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
        <DevRoleSwitcher />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
