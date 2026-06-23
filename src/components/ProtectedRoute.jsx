import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 animate-fadeIn">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
    </div>
  );
}

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <div className="animate-fadeIn">{children}</div>;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <div className="animate-fadeIn">{children}</div>;
}
