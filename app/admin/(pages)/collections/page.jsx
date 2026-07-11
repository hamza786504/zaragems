'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../../../_components/Admin/Sidebar';
import Header from '../../../_components/Admin/Header';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this collection? Products belonging to this collection will be updated to no collection.')) return;
    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCollections(collections.filter(c => c._id !== id));
      } else {
        alert('Failed to delete collection: ' + data.message);
      }
    } catch (err) {
      alert('Error deleting collection: ' + err.message);
    }
  };

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Sidebar />
      <Header />

      <main className="p-0 md:p-lg bg-surface-container-lowest min-h-screen text-on-surface">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Collections</h2>
            <p className="text-body-md text-on-surface-variant">Group products into collections for easier store browsing</p>
          </div>
          <Link href="/admin/collections/add" className="bg-primary hover:bg-primary-container text-on-primary font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
            <Plus size={18} />
            Add Collection
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-xl border border-outline-variant mb-lg shadow-sm">
          <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold block mb-2">Search Collections</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary bg-white text-on-surface"
              placeholder="Search collections..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Collections Table */}
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">
            Loading collections...
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">
            No collections found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <table className="w-full text-left overflow-x-auto">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Collection</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Slug</th>
                  <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Description</th>
                  <th className="p-4 text-right font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredCollections.map((col) => (
                  <tr key={col._id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container border border-outline-variant shrink-0">
                          <Image
                            className="w-full h-full object-cover"
                            alt={col.name}
                            src={col.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                            width={40}
                            height={40}
                          />
                        </div>
                        <span className="font-label-md text-on-surface font-bold group-hover:text-primary transition-colors">{col.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono bg-surface-container-high px-2.5 py-1 rounded text-on-surface-variant">{col.slug}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-body-sm text-on-surface-variant line-clamp-2">{col.description || '—'}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/collections/edit/${col._id}`}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(col._id)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
};

export default CollectionsPage;
