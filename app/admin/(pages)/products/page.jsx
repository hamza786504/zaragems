'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../../_components/Admin/Button';
import Sidebar from '../../../_components/Admin/Sidebar';
import Header from '../../../_components/Admin/Header';
import { Eye, Edit2, Trash2, Search, Plus, Archive } from 'lucide-react';

const PAGE_SIZE = 20;

const ProductsPage = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal]           = useState(0);
  const [offset, setOffset]         = useState(0);
  const [hasMore, setHasMore]       = useState(true);

  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('All Statuses');
  const [vendor, setVendor]   = useState('All Vendors');
  const [type, setType]       = useState('All Types');

  const [selectAll, setSelectAll]     = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Unique filter options — derived from all loaded products
  const [allVendors, setAllVendors] = useState([]);
  const [allTypes, setAllTypes]     = useState([]);

  // Sentinel div at the bottom — IntersectionObserver watches this
  const sentinelRef = useRef(null);
  // Debounce timer for search input
  const searchTimer = useRef(null);
  // Track the current query so stale responses are discarded
  const queryKey = useRef('');

  // ── Build URL params ──────────────────────────────────────────────────
  const buildParams = useCallback((currentOffset) => {
    const p = new URLSearchParams({ limit: PAGE_SIZE, offset: currentOffset });
    if (search)                         p.set('q', search);
    if (status !== 'All Statuses')      p.set('status', status);
    if (vendor !== 'All Vendors')       p.set('vendor', vendor);
    if (type   !== 'All Types')         p.set('type', type);
    return p.toString();
  }, [search, status, vendor, type]);

  // ── Initial / filter-change load (resets the list) ───────────────────
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setProducts([]);
    setOffset(0);
    setHasMore(true);
    setSelectedIds([]);
    setSelectAll(false);

    const key = buildParams(0);
    queryKey.current = key;

    try {
      const res  = await fetch(`/api/products?${key}`);
      const data = await res.json();
      if (queryKey.current !== key) return; // stale — discard
      if (data.success) {
        setProducts(data.products);
        setTotal(data.pagination?.total ?? data.products.length);
        setHasMore(data.pagination?.hasMore ?? false);
        setOffset(PAGE_SIZE);
        // Seed filter dropdowns from the first page (good enough for most stores)
        setAllVendors(['All Vendors', ...new Set(data.products.map(p => p.vendor).filter(Boolean))]);
        setAllTypes(['All Types', ...new Set(data.products.map(p => p.productType).filter(Boolean))]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // ── Load next chunk (infinite scroll) ────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const key = buildParams(offset);
    try {
      const res  = await fetch(`/api/products?${key}`);
      const data = await res.json();
      if (data.success) {
        setProducts(prev => [...prev, ...data.products]);
        setHasMore(data.pagination?.hasMore ?? false);
        setOffset(prev => prev + PAGE_SIZE);
        // Merge new vendors/types into dropdowns
        setAllVendors(prev => {
          const merged = new Set([...prev, ...data.products.map(p => p.vendor).filter(Boolean)]);
          return Array.from(merged);
        });
        setAllTypes(prev => {
          const merged = new Set([...prev, ...data.products.map(p => p.productType).filter(Boolean)]);
          return Array.from(merged);
        });
      }
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, buildParams]);

  // ── Re-fetch when filters change (debounce search) ───────────────────
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(loadInitial, search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, vendor, type]);

  // ── IntersectionObserver on the sentinel div ──────────────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '200px' }  // start loading 200px before the bottom
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Mutation helpers ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        setTotal(prev => prev - 1);
      } else alert('Failed to delete: ' + data.message);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    setSelectedIds(e.target.checked ? products.map(p => p._id) : []);
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds(checked ? [...selectedIds, id] : selectedIds.filter(x => x !== id));
    if (!checked) setSelectAll(false);
  };

  const handleBulkArchive = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Archive ${selectedIds.length} products?`)) return;
    try {
      for (const id of selectedIds) {
        await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' }),
        });
      }
      setSelectedIds([]); setSelectAll(false); loadInitial();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Permanently delete ${selectedIds.length} products?`)) return;
    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]); setSelectAll(false); loadInitial();
      } else alert('Failed: ' + data.message);
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <>
      <Sidebar />
      <Header />

      <main className="mt-0 p-0 md:p-lg bg-surface-container-lowest min-h-screen">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Products</h2>
            <p className="text-body-md text-on-surface-variant">
              Manage your inventory and variants
              {!loading && (
                <span className="ml-2 text-primary font-semibold">({total} total)</span>
              )}
            </p>
          </div>
          <Button href="/admin/products/add" icon={<Plus size={18} />}>Add product</Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-12 gap-4 mb-lg">
          <div className="col-span-12 lg:col-span-4 bg-white p-4 rounded-xl border border-outline-variant flex flex-col gap-2 shadow-sm">
            <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Search Inventory</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary bg-white text-on-surface"
                placeholder="Filter by product name, SKU..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8 bg-white p-4 rounded-xl border border-outline-variant flex flex-wrap gap-4 items-end shadow-sm">
            <div className="flex-1 min-w-[140px]">
              <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Status</label>
              <select className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>All Statuses</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Vendor</label>
              <select className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface" value={vendor} onChange={(e) => setVendor(e.target.value)}>
                {allVendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Type</label>
              <select className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface" value={type} onChange={(e) => setType(e.target.value)}>
                {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-surface-container-low p-3 mb-base flex items-center gap-4 rounded-t-xl border border-outline-variant">
            <div className="flex items-center gap-2">
              <input className="rounded text-primary focus:ring-primary w-5 h-5 ml-2 cursor-pointer" id="selectAll" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              <label className="text-label-md font-bold text-on-surface-variant uppercase" htmlFor="selectAll">
                {selectedIds.length} selected
              </label>
            </div>
            <div className="h-6 w-px bg-outline-variant mx-2" />
            <Button onClick={handleBulkArchive} variant="text" size="sm" icon={<Archive size={16} />}>Archive Selected</Button>
            <Button onClick={handleBulkDelete}  variant="danger" size="sm" icon={<Trash2 size={16} />}>Delete Selected</Button>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="w-12 p-4">
                      <input className="rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer" type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                    </th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Image</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Title</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Status</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Inventory</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Collection</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-4">
                        <input className="rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer" type="checkbox" checked={selectedIds.includes(product._id)} onChange={(e) => handleSelectOne(product._id, e.target.checked)} />
                      </td>
                      <td className="p-4">
                        <div className="w-12 h-12 rounded bg-surface-container border border-outline-variant overflow-hidden">
                          <Image
                            className="w-full h-full object-cover"
                            alt={product.title}
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            width={48} height={48}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-on-surface">{product.title}</p>
                        <span className="text-body-sm text-on-surface-variant">SKU: {product.SKU || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-body-sm uppercase ${
                          product.status === 'active'   ? 'bg-primary-container/20 text-primary' :
                          product.status === 'draft'    ? 'bg-surface-container-high text-on-surface-variant' :
                                                          'bg-error-container/20 text-error'
                        }`}>{product.status}</span>
                      </td>
                      <td className="p-4">
                        {product.inventory === null || product.inventory === undefined ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                            Untracked
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            product.inventory === 0
                              ? 'bg-error-container/20 text-error'
                              : product.inventory <= 5
                              ? 'bg-warning-container/20 text-warning'
                              : 'bg-primary-container/20 text-primary'
                          }`}>
                            {product.inventory} in stock
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-body-md text-on-surface">
                        {product.collectionId?.name ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-container/20 text-primary">
                            {product.collectionId.name}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/40">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-on-surface-variant hover:text-primary transition-colors" title="View on store">
                            <Eye size={16} />
                          </Link>
                          <Link href={`/admin/products/edit/${product._id}`} className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                            <Edit2 size={16} />
                          </Link>
                          <button onClick={() => handleDelete(product._id)} className="p-2 text-on-surface-variant hover:text-error transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="py-4 text-center text-on-surface-variant text-body-sm">
                {loadingMore && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading more…</span>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <span className="opacity-50">All {total} products loaded</span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ProductsPage;