import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const statusIcons = {
  DRAFT: '📄', SUBMITTED: '📤', APPROVED: '✅', REJECTED: '❌', CHANGES_REQUESTED: '🔄', PUBLISHED: '🚀',
};

function SkeletonBlock() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="skeleton h-8 w-3/4" />
      <div className="skeleton h-4 w-1/3" />
      <div className="flex gap-2"><div className="skeleton h-6 w-16" /><div className="skeleton h-6 w-16" /></div>
      <div className="skeleton h-32 w-full" />
    </div>
  );
}

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    api.get(`/content/${id}`).then((res) => setContent(res.data)).catch(() => navigate('/dashboard'));
  }, [id]);

  if (!content) return <div className="max-w-3xl mx-auto pt-6"><SkeletonBlock /></div>;

  const handleAction = async (url, body = {}) => {
    setActionLoading(url);
    setError('');
    try {
      const { data } = await api.post(url, body);
      setContent({ ...content, ...data });
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this content? This cannot be undone.')) return;
    setActionLoading('delete');
    try {
      await api.delete(`/content/${id}`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Delete failed');
    } finally {
      setActionLoading('');
    }
  };

  const isOwner = user?.id === content.userId;
  const isAdmin = user?.role === 'ADMIN';
  const isReviewer = user?.role === 'REVIEWER' || isAdmin;
  const isVerifier = user?.role === 'VERIFIER' || isAdmin;
  const canDelete = (isOwner || isAdmin) && content.status !== 'PUBLISHED';

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm border p-6 card-hover animate-slideUp">
        <div className="flex items-start justify-between mb-4">
          <div className="animate-fadeIn stagger-1">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{content.title}</h1>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <span>By <strong className="text-gray-700">{content.user?.name}</strong></span>
              <span className="text-gray-300">·</span>
              <span>{new Date(content.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[content.status]} status-badge inline-flex items-center gap-1.5 animate-scaleIn`}>
            {statusIcons[content.status]} {content.status}
          </span>
        </div>

        {content.tags && (
          <div className="flex gap-2 mb-5 flex-wrap animate-fadeIn stagger-2">
            {content.tags.split(',').map((t, i) => (
              <span key={t.trim()} className="text-xs px-3 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-full border animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>{t.trim()}</span>
            ))}
          </div>
        )}

        <div className="bg-gray-50/50 rounded-lg p-5 mb-6 animate-fadeIn stagger-3">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{content.description}</p>
        </div>

        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm animate-slideDown flex items-center gap-2"><span>⚠️</span>{error}</div>}

        <div className="flex gap-3 flex-wrap animate-slideUp stagger-4">
          {isOwner && content.status === 'DRAFT' && (
            <>
              <button onClick={() => handleAction(`/content/${id}/submit`)} disabled={actionLoading === `/content/${id}/submit`} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2 shadow-sm hover:shadow-md">
                {actionLoading === `/content/${id}/submit` ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📤'} Submit for Review
              </button>
              <button onClick={() => navigate(`/content/${id}/edit`)} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium btn-press transition-all duration-200 flex items-center gap-2">✏️ Edit</button>
            </>
          )}

          {isOwner && content.status === 'CHANGES_REQUESTED' && (
            <>
              <button onClick={() => handleAction(`/content/${id}/submit`)} disabled={actionLoading === `/content/${id}/submit`} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2 shadow-sm hover:shadow-md">
                {actionLoading === `/content/${id}/submit` ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📤'} Resubmit for Review
              </button>
              <button onClick={() => navigate(`/content/${id}/edit`)} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-200 text-sm font-medium btn-press transition-all duration-200 flex items-center gap-2">✏️ Edit</button>
            </>
          )}

          {isReviewer && content.status === 'SUBMITTED' && (
            <>
              <button onClick={() => handleAction(`/content/${id}/review`, { decision: 'APPROVED' })} disabled={actionLoading === `/content/${id}/review`} className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2 shadow-sm hover:shadow-md">
                {actionLoading === `/content/${id}/review` ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✅'} Approve
              </button>
              <button onClick={() => handleAction(`/content/${id}/review`, { decision: 'CHANGES_REQUESTED' })} disabled={actionLoading === `/content/${id}/review`} className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2">🔄 Request Changes</button>
              <button onClick={() => handleAction(`/content/${id}/review`, { decision: 'REJECTED' })} disabled={actionLoading === `/content/${id}/review`} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2">❌ Reject</button>
            </>
          )}

          {isVerifier && content.status === 'APPROVED' && (
            <>
              <button onClick={() => handleAction(`/content/${id}/verify`, { decision: 'PUBLISHED' })} disabled={actionLoading === `/content/${id}/verify`} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2 shadow-sm hover:shadow-md">
                {actionLoading === `/content/${id}/verify` ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🚀'} Publish
              </button>
              <button onClick={() => handleAction(`/content/${id}/verify`, { decision: 'REJECTED' })} disabled={actionLoading === `/content/${id}/verify`} className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2">❌ Reject</button>
            </>
          )}

          {canDelete && (
            <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="text-red-600 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-50 text-sm font-medium btn-press transition-all duration-200 disabled:opacity-60 flex items-center gap-2">
              {actionLoading === 'delete' ? <span className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /> : '🗑️'} Delete
            </button>
          )}

          <button onClick={() => navigate('/dashboard')} className="text-gray-500 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-sm font-medium btn-press transition-all duration-200 flex items-center gap-2">← Back</button>
        </div>
      </div>

      {content.logs?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-6 card-hover animate-slideUp">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📋 Activity Log</h2>
          <div className="relative">
            <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {content.logs.map((log, i) => (
                <div key={log.id} className="flex items-start gap-3 text-sm animate-fadeIn" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 relative z-10 flex-shrink-0" />
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-semibold text-gray-700">{log.action}</span>
                    <span className="text-gray-600">by <strong>{log.performedBy?.name}</strong></span>
                    <span className="text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
