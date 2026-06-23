import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  CHANGES_REQUESTED: 'bg-orange-100 text-orange-800',
  PUBLISHED: 'bg-blue-100 text-blue-800',
};

function SkeletonRow() {
  return (
    <tr className="animate-fadeIn">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="p-3"><div className="skeleton h-5 w-full" style={{ maxWidth: i === 0 ? 200 : i === 4 ? 60 : 120 }} /></td>
      ))}
    </tr>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [allContents, setAllContents] = useState([]);
  const [tab, setTab] = useState('mine');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/content').then((r) => setContents(r.data)),
      ['REVIEWER', 'VERIFIER', 'ADMIN'].includes(user?.role)
        ? api.get('/content/all').then((r) => setAllContents(r.data))
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [user]);

  const displayList = tab === 'mine' ? contents : allContents;

  const canSeeAll = ['REVIEWER', 'VERIFIER', 'ADMIN'].includes(user?.role);
  const canCreate = ['USER', 'ADMIN'].includes(user?.role);

  const pendingReview = allContents.filter((c) =>
    ['REVIEWER', 'ADMIN'].includes(user?.role) ? c.status === 'SUBMITTED' : false
  );
  const pendingVerify = allContents.filter((c) =>
    ['VERIFIER', 'ADMIN'].includes(user?.role) ? c.status === 'APPROVED' : false
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6 animate-slideUp">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Here's your content overview</p>
        </div>
        {canCreate && (
          <Link to="/create" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium btn-press transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md">
            <span className="text-lg leading-none">+</span> New Content
          </Link>
        )}
      </div>

      {(pendingReview.length > 0 || pendingVerify.length > 0) && (
        <div className="flex gap-3 mb-6 animate-slideUp stagger-1">
          {pendingReview.length > 0 && (
            <div className="flex-1 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-xl p-4 animate-slideDown">
              <p className="text-yellow-800 font-medium flex items-center gap-2">
                <span className="inline-block h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
                {pendingReview.length} content(s) pending review
              </p>
            </div>
          )}
          {pendingVerify.length > 0 && (
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4 animate-slideDown">
              <p className="text-blue-800 font-medium flex items-center gap-2">
                <span className="inline-block h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                {pendingVerify.length} content(s) pending verification
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-4 animate-fadeIn stagger-2">
        <button onClick={() => setTab('mine')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 btn-press ${tab === 'mine' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>My Content</button>
        {canSeeAll && (
          <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 btn-press ${tab === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border hover:bg-gray-50'}`}>All Content</button>
        )}
      </div>

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
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : displayList.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <span className="text-3xl">📭</span>
                  <p className="font-medium">No content yet</p>
                  {canCreate && <Link to="/create" className="text-blue-600 hover:underline text-sm">Create your first piece</Link>}
                </div>
              </td></tr>
            ) : displayList.map((c, i) => (
              <tr key={c.id} className="border-b hover:bg-blue-50/50 transition-colors duration-150 animate-fadeIn" style={{ animationDelay: `${i * 0.04}s` }}>
                <td className="p-3 font-medium text-gray-800">{c.title}</td>
                <td className="p-3 text-gray-500">{c.user?.name}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[c.status]} status-badge inline-block`}>{c.status}</span>
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
    </div>
  );
}
