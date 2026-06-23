import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleDescriptions = {
  USER: 'Creates content',
  REVIEWER: 'Reviews submitted content',
  VERIFIER: 'Final approval of content',
  ADMIN: 'Full system management',
};

const roleColors = {
  USER: 'bg-gray-100 text-gray-800',
  REVIEWER: 'bg-yellow-100 text-yellow-800',
  VERIFIER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showRoleTip, setShowRoleTip] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50 animate-slideDown">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="font-bold text-lg text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-2">
          <span className="text-xl">📝</span>
          ContentFlow
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/public" className="text-gray-600 hover:text-blue-700 transition-all duration-200 hover:-translate-y-0.5 inline-block">Browse</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-700 transition-all duration-200 hover:-translate-y-0.5 inline-block">Dashboard</Link>
              {user.role === 'ADMIN' && <Link to="/admin" className="text-gray-600 hover:text-blue-700 transition-all duration-200 hover:-translate-y-0.5 inline-block">Admin</Link>}
              {['USER', 'ADMIN'].includes(user.role) && <Link to="/create" className="text-gray-600 hover:text-blue-700 transition-all duration-200 hover:-translate-y-0.5 inline-block">Create</Link>}
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium">{user.name}</span>
              <div className="relative">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium animate-scaleIn cursor-default ${roleColors[user.role]}`}
                  onMouseEnter={() => setShowRoleTip(true)}
                  onMouseLeave={() => setShowRoleTip(false)}
                >
                  {user.role}
                </span>
                {showRoleTip && (
                  <div className="absolute top-full right-0 mt-2 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg animate-fadeIn">
                    {roleDescriptions[user.role]}
                    <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-800 rotate-45" />
                  </div>
                )}
              </div>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-800 transition-all duration-200 hover:-translate-y-0.5 font-medium btn-press">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-700 transition-all duration-200 hover:-translate-y-0.5 inline-block">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-all duration-200 btn-press text-sm font-medium">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
