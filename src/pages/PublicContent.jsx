import { useState, useEffect } from 'react';
import api from '../api/axios';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 space-y-3 animate-fadeIn">
      <div className="skeleton h-6 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="flex gap-2"><div className="skeleton h-5 w-12" /><div className="skeleton h-5 w-16" /></div>
      <div className="skeleton h-12 w-full" />
    </div>
  );
}

export default function PublicContent() {
  const [contents, setContents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/content/published').then((r) => setContents(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = contents.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.tags?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-slideUp">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Published Content</h1>
          <p className="text-gray-500 mt-1">Explore community published articles</p>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none hover:border-blue-300 transition-all text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16 animate-fadeIn">
          <span className="text-5xl block mb-4">📚</span>
          <p className="text-gray-400 text-lg font-medium">{search ? 'No results match your search' : 'No published content yet'}</p>
          <p className="text-gray-400 text-sm mt-1">{search ? 'Try different keywords' : 'Check back later for new content'}</p>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((c, i) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border p-6 card-hover animate-slideUp" style={{ animationDelay: `${i * 0.07}s` }}>
              <h2 className="text-lg font-bold text-gray-800 mb-1">{c.title}</h2>
              <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                <span>By <strong>{c.user?.name}</strong></span>
                <span className="text-gray-300">·</span>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </p>
              {c.tags && (
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {c.tags.split(',').map((t, j) => (
                    <span key={t.trim()} className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 rounded-full border border-blue-100 animate-fadeIn" style={{ animationDelay: `${i * 0.07 + j * 0.03}s` }}>{t.trim()}</span>
                  ))}
                </div>
              )}
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
