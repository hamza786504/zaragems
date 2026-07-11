'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../../../_components/Admin/Sidebar';
import Header from '../../../../_components/Admin/Header';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

const AddCustomerPage = () => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !email) {
      alert('First name and email are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          status,
          address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Customer added successfully!');
        router.push('/admin/customers');
      } else {
        alert('Error adding customer: ' + data.error);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sidebar />
      <Header />

      <main className="p-0 md:p-lg bg-surface-container-lowest min-h-screen text-on-surface">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/admin/customers" className="text-label-md hover:text-primary transition-colors flex items-center gap-1 mb-2">
              <ArrowLeft size={14} /> Back to Customers
            </Link>
            <h2 className="text-headline-lg font-headline-lg font-bold">Add New Customer</h2>
            <p className="text-body-md text-on-surface-variant">Create a customer profile for your store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Info Card */}
            <div className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-headline-md text-headline-md font-bold mb-2">General Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                    First Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="john.doe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-label-md font-bold text-on-surface-variant mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-2">Status</label>
                <select
                  className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white border border-outline-variant p-3 md:p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-headline-md text-headline-md font-bold mb-2">Address</h3>
              <div>
                <label className="block text-label-md font-bold text-on-surface-variant mb-2">Shipping & Billing Address</label>
                <textarea
                  className="w-full border border-outline-variant rounded-lg p-3 bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  rows="3"
                  placeholder="123 Main St, Apt 4B, New York, NY 10001"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <Link
                href="/admin/customers"
                className="px-6 py-2.5 border border-outline text-on-surface font-bold text-label-md hover:bg-surface-container-high transition-colors rounded-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-primary text-on-primary font-bold text-label-md hover:opacity-90 transition-all rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                Save Customer
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default AddCustomerPage;