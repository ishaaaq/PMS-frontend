
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
import UserDetailPage from './pages/UserDetailPage';
import ContractorManagementPage from './pages/ContractorManagementPage';
import ContractorDetailPage from './pages/ContractorDetailPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import MilestonesPage from './pages/MilestonesPage';
import ContractorLayout from './layouts/ContractorLayout';
import ContractorDashboard from './pages/contractor/ContractorDashboard';
import ContractorAssignmentsPage from './pages/contractor/ContractorAssignmentsPage';
import ContractorMessagesPage from './pages/contractor/ContractorMessagesPage';
import ContractorProfilePage from './pages/contractor/ContractorProfilePage';
import ContractorDocumentsPage from './pages/contractor/ContractorDocumentsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/new" element={<CreateProjectPage />} />
          <Route path="projects/:id" element={<ProjectDetailsPage />} />
          <Route path="consultants" element={<ConsultantListPage />} />
          <Route path="consultants/:id" element={<ConsultantDetailPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="contractors" element={<ContractorManagementPage />} />
          <Route path="contractors/:id" element={<ContractorDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="milestones" element={<MilestonesPage />} />
        </Route>

        {/* Contractor Routes */}
        <Route path="/contractor" element={<ContractorLayout />}>
          <Route path="dashboard" element={<ContractorDashboard />} />
          <Route path="projects" element={<ContractorAssignmentsPage />} />
          <Route path="messages" element={<ContractorMessagesPage />} />
          <Route path="profile" element={<ContractorProfilePage />} />
          <Route path="documents" element={<ContractorDocumentsPage />} />
          <Route index element={<Navigate to="/contractor/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
