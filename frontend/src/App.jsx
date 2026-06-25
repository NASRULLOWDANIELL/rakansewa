import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import HousematesPage from './pages/HousematesPage';
import ProfilePage from './pages/ProfilePage';
import ManageHousemateProfilePage from './pages/ManageHousemateProfilePage';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-on-surface-variant font-medium">Loading…</p>
      </div>
    </div>
  );
  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to="/" replace />;
  
  return children;
};

function AppLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/properties', element: <PropertiesPage /> },
      { path: '/properties/:id', element: <PropertyDetailsPage /> },
      { path: '/housemates', element: <HousematesPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/feedback', element: <FeedbackPage /> },
      {
        path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: '/profile/housemate',
        element: <ProtectedRoute><ManageHousemateProfilePage /></ProtectedRoute>
      },
      {
        path: '/owner/*',
        element: <ProtectedRoute allowedRoles={['Owner']}><OwnerDashboard /></ProtectedRoute>
      },
      {
        path: '/admin/*',
        element: <ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

function App() {
  return (
    <DarkModeProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </DarkModeProvider>
  );
}

export default App;
