'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../_components/Admin/Button';
import Sidebar from '../../../_components/Admin/Sidebar';
import Header from '../../../_components/Admin/Header';
import { Search, Plus, Trash2, Edit2, ShieldAlert } from 'lucide-react';

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState([]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (statusFilter !== 'All Statuses') params.append('status', statusFilter);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter]);

  const handleDeleteCustomer = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`/api/customers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] })
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(customers.filter(c => c._id !== id));
        setSelectedCustomers(selectedCustomers.filter(cId => cId !== id));
      } else {
        alert('Failed to delete customer: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting customer: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCustomers.length} selected customers?`)) return;

    try {
      const res = await fetch('/api/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCustomers })
      });
      const data = await res.json();

      if (data.success) {
        setCustomers(customers.filter(c => !selectedCustomers.includes(c._id)));
        setSelectedCustomers([]);
      } else {
        alert('Failed to delete customers: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting customers: ' + err.message);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(customers.map(c => c._id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter(cId => cId !== id));
    } else {
      setSelectedCustomers([...selectedCustomers, id]);
    }
  };

  const getStatusBadge = (status) => {
    const formatted = (status || 'active').toLowerCase();
    if (formatted === 'active') {
      return 'bg-primary-container/20 text-primary';
    } else if (formatted === 'blocked') {
      return 'bg-error-container/20 text-error';
    }
    return 'bg-surface-container-high text-on-surface-variant';
  };

  return (
    <>
      <Sidebar />
      <Header />

      <main className="p-0 md:p-lg bg-surface-container-lowest min-h-screen text-on-surface">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Customers</h2>
            <p className="text-body-md text-on-surface-variant">View and manage your customer accounts</p>
          </div>
          <Button href="/admin/customers/add" icon={<Plus size={18} />}>
            Add Customer
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-12 gap-4 mb-lg">
          <div className="col-span-12 lg:col-span-6 bg-white p-4 rounded-xl border border-outline-variant flex flex-col gap-2 shadow-sm">
            <label className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Search Customers</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary bg-white text-on-surface"
                placeholder="Search by name, email or phone..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 bg-white p-4 rounded-xl border border-outline-variant flex flex-wrap gap-4 items-end shadow-sm">
            <div className="flex-1 min-w-[140px]">
              <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Status Filter</label>
              <select
                className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCustomers.length > 0 && (
          <div className="bg-primary-container/20 border border-primary/20 rounded-xl p-4 mb-lg flex justify-between items-center shadow-sm">
            <div className="text-on-surface font-bold">
              {selectedCustomers.length} customer(s) selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="bg-error text-white px-4 py-2 rounded-lg text-label-md font-bold hover:bg-error/90 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">
              Loading customers...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              No customers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                        checked={customers.length > 0 && selectedCustomers.length === customers.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Name</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Email</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Phone</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Location</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Status</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold text-center">Orders</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold text-right">Total Spent</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                          checked={selectedCustomers.includes(customer._id)}
                          onChange={() => handleSelectOne(customer._id)}
                        />
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        {customer.firstName} {customer.lastName}
                      </td>
                      <td className="p-4 text-body-md text-on-surface">{customer.email}</td>
                      <td className="p-4 text-body-md text-on-surface">{customer.phone || 'N/A'}</td>
                      <td className="p-4 text-body-md text-on-surface">{customer.address || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-body-sm uppercase ${getStatusBadge(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="p-4 text-center text-body-md text-on-surface">{customer.ordersCount || 0}</td>
                      <td className="p-4 text-right font-bold text-on-surface">Rs {customer.totalSpent?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDeleteCustomer(customer._id)}
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

export default CustomersPage;