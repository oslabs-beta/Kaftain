import React, { useState } from 'react';

interface AddClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, url: string) => void;
}

export default function AddClusterModal({ isOpen, onClose, onAdd }: AddClusterModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !url.trim()) {
      setError('Both fields are required');
      return;
    }
    setLoading(true);
    try {
      await onAdd(name.trim(), url.trim());
      setName('');
      setUrl('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Cluster</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1" htmlFor="cluster-name">Cluster Name</label>
            <input
              id="cluster-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1" htmlFor="cluster-url">Cluster URL</label>
            <input
              id="cluster-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 text-white p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-rose-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Cluster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 