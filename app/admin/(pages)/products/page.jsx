'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../../../_components/Admin/Button';
import Sidebar from '../../../_components/Admin/Sidebar';
import Header from '../../../_components/Admin/Header';
import { Eye, Edit2, Trash2, Search, Filter, Plus, ArrowUpDown, ChevronLeft, ChevronRight, Archive, Check } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All Statuses');
  const [vendor, setVendor] = useState('All Vendors');
  const [type, setType] = useState('All Types');
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('q', search);
      if (status !== 'All Statuses') queryParams.append('status', status);
      if (vendor !== 'All Vendors') queryParams.append('vendor', vendor);
      if (type !== 'All Types') queryParams.append('type', type);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, status, vendor, type]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== id));
      } else {
        alert('Failed to delete product: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    }
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id));
      setSelectAll(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to archive ${selectedIds.length} selected products?`)) return;

    try {
      for (const id of selectedIds) {
        await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' })
        });
      }
      alert('Selected products archived successfully.');
      setSelectedIds([]);
      setSelectAll(false);
      fetchProducts();
    } catch (err) {
      alert('Error in bulk archive: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete these ${selectedIds.length} products?`)) return;

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Selected products deleted successfully.');
        setSelectedIds([]);
        setSelectAll(false);
        fetchProducts();
      } else {
        alert('Failed to delete products: ' + data.message);
      }
    } catch (err) {
      alert('Error in bulk delete: ' + err.message);
    }
  };

  // Get unique vendors and types for filters
  const uniqueVendors = ['All Vendors', ...new Set(products.map(p => p.vendor).filter(Boolean))];
  const uniqueTypes = ['All Types', ...new Set(products.map(p => p.productType).filter(Boolean))];

  return (
    <>
      <Sidebar />
      <Header />
      
      {/* Main Content Canvas */}
      <main className="mt-0 p-0 md:p-lg bg-surface-container-lowest min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Products</h2>
            <p className="text-body-md text-on-surface-variant">Manage your inventory and variants</p>
          </div>
          <Button href="/admin/products/add" icon={<Plus size={18} />}>
            Add product
          </Button>
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
              <select 
                className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>All Statuses</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Vendor</label>
              <select 
                className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              >
                {uniqueVendors.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Type</label>
              <select 
                className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-surface-container-low p-3 mb-base flex items-center gap-4 rounded-t-xl border border-outline-variant">
            <div className="flex items-center gap-2">
              <input
                className="rounded text-primary focus:ring-primary w-5 h-5 ml-2 cursor-pointer"
                id="selectAll"
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <label className="text-label-md font-bold text-on-surface-variant uppercase" htmlFor="selectAll">
                Selected {selectedIds.length} items
              </label>
            </div>
            <div className="h-6 w-px bg-outline-variant mx-2"></div>
            <Button 
              onClick={handleBulkArchive}
              variant="text"
              size="sm"
              icon={<Archive size={16} />}
            >
              Archive Selected
            </Button>
            <Button 
              onClick={handleBulkDelete}
              variant="danger"
              size="sm"
              icon={<Trash2 size={16} />}
            >
              Delete Selected
            </Button>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="w-12 p-4">
                      <input 
                        className="rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer" 
                        type="checkbox" 
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Image</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Title</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Status</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Inventory</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Type</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Vendor</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-4">
                        <input 
                          className="rounded text-primary focus:ring-primary w-5 h-5 cursor-pointer" 
                          type="checkbox" 
                          checked={selectedIds.includes(product._id)}
                          onChange={(e) => handleSelectOne(product._id, e.target.checked)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="w-12 h-12 rounded bg-surface-container border border-outline-variant overflow-hidden">
                          <Image
                            className="w-full h-full object-cover"
                            alt={product.title}
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                            width={48}
                            height={48}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-on-surface">{product.title}</p>
                        <span className="text-body-sm text-on-surface-variant">SKU: {product.SKU || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-body-sm uppercase ${
                          product.status === 'active' ? 'bg-primary-container/20 text-primary' :
                          product.status === 'draft' ? 'bg-surface-container-high text-on-surface-variant' :
                          'bg-error-container/20 text-error'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4 text-body-md text-on-surface">
                        {product.inventory} in stock for {product.variants?.length || 1} variants
                      </td>
                      <td className="p-4 text-body-md text-on-surface">{product.productType || 'N/A'}</td>
                      <td className="p-4 text-body-md text-on-surface">{product.vendor || 'N/A'}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                            title="View on store"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors"
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
        </div>
      </main>
    </>
  );
};

export default ProductsPage;