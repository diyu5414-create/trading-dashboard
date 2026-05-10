import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';

function AppContent() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
