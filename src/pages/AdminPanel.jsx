import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const roleColors = {
  USER: 'bg-gray-100 text-gray-700',
  REVIEWER: 'bg-yellow-100 text-yellow-800',
  VERIFIER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-purple-100 text-purple-800',
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [allContent, setAllContent] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('users');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/users').then((r) => setUsers(r.data)),
      api.get('/content/all').then((r) => setAllContent(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const changeRole = async (userId, role) => {
    try {
      const { data } = await api.put(`/users/${userId}/role`, { role });
      setUsers(users.map((u) => (u.id === userId ? data : u)));
      setMessage(`✅ ${data.name} role updated to ${role}`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to update role');
    }
  };

  const createUser = async () => {
    try {
      setCreating(true);
      const { data } = await api.post('/users', newUser);
      setUsers([...users, data]);
      setShowCreateForm(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      setMessage(`✅ User ${data.name} created as ${data.role}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.error || 'Failed to create user'}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (userId) => {
    try {
      const { data } = await api.put(`/users/${userId}/active`);
      setUsers(users.map((u) => (u.id === userId ? data : u)));
      setMessage(`✅ ${data.name} ${data.active ? 'activated' : 'deactivated'}`);
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('❌ Failed to toggle status');
    }
  };

  const statusCounts = {};
  allContent.forEach((c) => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 animate-slideUp">
        <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-0.5">System management & oversight</p>
      </div>

      {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm animate-slideDown flex items-center gap-2">{message}</div>}

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 animate-slideUp stagger-1">
          <div className="bg-white rounded-xl border p-4 card-hover">
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Users</p>
          </div>
          <div className="bg-white rounded-xl border p-4 card-hover">
            <p className="text-2xl font-bold text-gray-800">{allContent.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Content</p>
          </div>
          {['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED'].map((s) => (
            <div key={s} className="bg-white rounded-xl border p-4 card-hover">
              <p className="text-2xl font-bold text-gray-800">{statusCounts[s] || 0}</p>
              <p className={`text-xs mt-0.5 ${statusColors[s].split(' ')[1]}`}>{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2 mb-4 animate-fadeIn stagger-2">
        {[
          { key: 'users', label: '👥 User Management' },
          { key: 'content', label: '📄 All Content' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 btn-press ${activeSection === s.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* User Management */}
      {activeSection === 'users' && (
        <div className="animate-slideUp stagger-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{users.length} user(s)</p>
            <button onClick={() => { setShowCreateForm(!showCreateForm); setNewUser({ name: '', email: '', password: '', role: 'USER' }); }} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium btn-press transition-all duration-200 flex items-center gap-1.5">
              <span className="text-lg leading-none">{showCreateForm ? '−' : '+'}</span> {showCreateForm ? 'Cancel' : 'Create User'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 animate-slideDown">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Create New User</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="you@example.com" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                  <div className="relative">
                    <input type={showNewPassword ? 'text' : 'password'} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Min 8 characters" className="w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1" tabIndex={-1}>
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer">
                    <option value="USER">USER</option>
                    <option value="REVIEWER">REVIEWER</option>
                    <option value="VERIFIER">VERIFIER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={() => setShowCreateForm(false)} className="px-4 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-all btn-press">Cancel</button>
                <button onClick={createUser} disabled={creating || !newUser.name || !newUser.email || !newUser.password} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">
                  {creating ? (
                    <><span className="inline-block h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
                  ) : 'Create'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden card-hover">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Name</th>
                <th className="text-left p-3 font-semibold text-gray-600">Email</th>
                <th className="text-left p-3 font-semibold text-gray-600">Role</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                <th className="text-left p-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-fadeIn">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="p-3"><div className="skeleton h-5" style={{ maxWidth: j === 1 ? 200 : j === 4 ? 120 : 100 }} /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">No users found</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id} className="border-b hover:bg-blue-50/50 transition-all duration-150 animate-fadeIn" style={{ animationDelay: `${i * 0.04}s` }}>
                  <td className="p-3 font-medium text-gray-800 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center font-bold">{u.name[0]}</span>
                    {u.name}
                  </td>
                  <td className="p-3 text-gray-500">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleColors[u.role]} status-badge`}>{u.role}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-red-400'}`} />
                      <span className={`text-xs font-medium ${u.active ? 'text-green-700' : 'text-red-600'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className="text-xs border rounded-lg px-3 py-1.5 bg-white hover:border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="USER">USER</option>
                        <option value="REVIEWER">REVIEWER</option>
                        <option value="VERIFIER">VERIFIER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        onClick={() => toggleActive(u.id)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 btn-press border ${u.active ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* All Content View */}
      {activeSection === 'content' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden card-hover animate-slideUp stagger-3">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-600">Title</th>
                <th className="text-left p-3 font-semibold text-gray-600">Author</th>
                <th className="text-left p-3 font-semibold text-gray-600">Status</th>
                <th className="text-left p-3 font-semibold text-gray-600">Date</th>
                <th className="text-left p-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-fadeIn">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="p-3"><div className="skeleton h-5" style={{ maxWidth: j === 0 ? 200 : j === 4 ? 60 : 100 }} /></td>
                    ))}
                  </tr>
                ))
              ) : allContent.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-400">No content found</td></tr>
              ) : allContent.map((c, i) => (
                <tr key={c.id} className="border-b hover:bg-blue-50/50 transition-all duration-150 animate-fadeIn" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="p-3 font-medium text-gray-800">{c.title}</td>
                  <td className="p-3 text-gray-500">{c.user?.name}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[c.status]} status-badge`}>{c.status}</span>
                  </td>
                  <td className="p-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link to={`/content/${c.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-all duration-200 hover:underline inline-flex items-center gap-1">
                      View <span className="text-sm">→</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
