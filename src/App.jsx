import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateContent from './pages/CreateContent';
import ContentDetail from './pages/ContentDetail';
import EditContent from './pages/EditContent';
import AdminPanel from './pages/AdminPanel';
import PublicContent from './pages/PublicContent';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/public" replace />} />
            <Route path="/public" element={<PublicContent />} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create" element={<ProtectedRoute roles={['USER', 'ADMIN']}><CreateContent /></ProtectedRoute>} />
            <Route path="/content/:id" element={<ProtectedRoute><ContentDetail /></ProtectedRoute>} />
            <Route path="/content/:id/edit" element={<ProtectedRoute roles={['USER', 'ADMIN']}><EditContent /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
