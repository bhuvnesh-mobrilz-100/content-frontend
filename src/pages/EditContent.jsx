import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function EditContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalStatus, setOriginalStatus] = useState('');

  useEffect(() => {
    api.get(`/content/${id}`).then((res) => {
      setTitle(res.data.title);
      setDescription(res.data.description);
      setTags(res.data.tags);
      setOriginalStatus(res.data.status);
    }).catch(() => navigate('/dashboard')).finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/content/${id}`, { title, description, tags });
      navigate(`/content/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto pt-6 animate-fadeIn">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <div className="space-y-5">
            <div><div className="skeleton h-4 w-16 mb-1.5" /><div className="skeleton h-11 w-full" /></div>
            <div><div className="skeleton h-4 w-20 mb-1.5" /><div className="skeleton h-32 w-full" /></div>
            <div><div className="skeleton h-4 w-10 mb-1.5" /><div className="skeleton h-11 w-full" /></div>
            <div className="flex gap-3"><div className="skeleton h-11 w-32" /><div className="skeleton h-11 w-24" /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="mb-6 animate-slideUp">
        <h1 className="text-2xl font-bold text-gray-800">Edit Content</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {originalStatus === 'CHANGES_REQUESTED'
            ? 'Reviewer requested changes — update your content and resubmit'
            : 'Update your draft'}
        </p>
      </div>

      {originalStatus === 'CHANGES_REQUESTED' && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 animate-slideDown flex items-center gap-2 text-sm text-orange-800">
          <span>🔄</span> Changes were requested. Edit your content and resubmit for review.
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-sm border card-hover animate-slideUp">
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm animate-slideDown flex items-center gap-2"><span>⚠️</span>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="animate-fadeIn stagger-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-300 transition-all" />
          </div>
          <div className="animate-fadeIn stagger-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={6} className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-300 transition-all resize-y" />
          </div>
          <div className="animate-fadeIn stagger-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-300 transition-all" />
          </div>
          <div className="flex gap-3 pt-2 animate-fadeIn stagger-4">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium btn-press transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md">
              {loading ? <><span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : '💾 Save Changes'}
            </button>
            <button type="button" onClick={() => navigate(`/content/${id}`)} className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 font-medium btn-press transition-all duration-200">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
