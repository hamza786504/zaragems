'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../../_components/Admin/Sidebar';
import Header from '../../../_components/Admin/Header';
import { Trash2, CheckCircle, XCircle, Star, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
        setSelectedReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => r._id !== id));
        setSelectedReviews(selectedReviews.filter(sid => sid !== id));
      } else {
        alert('Failed to delete review: ' + data.message);
      }
    } catch (err) {
      alert('Error deleting review: ' + err.message);
    }
  };

  // ─── Bulk Actions ───
  const toggleSelect = (id) => {
    setSelectedReviews(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r._id));
    }
  };

  const handleBulkApprove = async () => {
    if (!confirm(`Approve ${selectedReviews.length} selected review(s)?`)) return;
    setBulkProcessing(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-approve', ids: selectedReviews })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.map(r =>
          selectedReviews.includes(r._id) ? { ...r, status: 'approved' } : r
        ));
        setSelectedReviews([]);
      } else {
        alert('Failed to bulk approve: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Permanently delete ${selectedReviews.length} selected review(s)? This cannot be undone.`)) return;
    setBulkProcessing(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-delete', ids: selectedReviews })
      });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => !selectedReviews.includes(r._id)));
        setSelectedReviews([]);
      } else {
        alert('Failed to bulk delete: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? 'currentColor' : 'none'}
            className={star > rating ? 'text-gray-300' : ''}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') {
      return 'bg-primary-container/20 text-primary';
    } else if (s === 'rejected') {
      return 'bg-error-container/20 text-error';
    }
    return 'bg-surface-container-high text-on-surface-variant';
  };

  const allSelected = reviews.length > 0 && selectedReviews.length === reviews.length;
  const someSelected = selectedReviews.length > 0 && !allSelected;

  return (
    <>
      <Sidebar />
      <Header />

      <main className="p-0 md:p-lg bg-surface-container-lowest min-h-screen text-on-surface">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Product Reviews</h2>
            <p className="text-body-md text-on-surface-variant">Moderate and manage reviews submitted by customers</p>
          </div>
        </div>

        {/* Filters + Bulk Actions */}
        <div className="bg-white p-4 rounded-xl border border-outline-variant mb-lg shadow-sm flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-64">
            <label className="text-label-md text-on-surface-variant block mb-1 font-bold">Status Filter</label>
            <select
              className="w-full p-2 border border-outline-variant rounded-lg bg-white text-on-surface"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Reviews</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Bulk Actions Bar */}
          {selectedReviews.length > 0 && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-label-md text-on-surface-variant font-bold">
                {selectedReviews.length} selected
              </span>
              <button
                onClick={handleBulkApprove}
                disabled={bulkProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-container/10 text-primary font-label-md hover:bg-primary-container/20 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={16} />
                Bulk Approve
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error-container/10 text-error font-label-md hover:bg-error-container/20 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                Bulk Delete
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant">
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant">
              No reviews found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="p-4 w-10">
                      <button onClick={toggleSelectAll} className="text-on-surface-variant hover:text-primary transition-colors">
                        {allSelected ? <CheckSquare size={18} className="text-primary" /> : someSelected ? <CheckSquare size={18} className="text-primary opacity-50" /> : <Square size={18} />}
                      </button>
                    </th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Product</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Reviewer</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Rating</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold w-1/3">Review Message</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold">Status</th>
                    <th className="p-4 text-label-md text-on-surface-variant uppercase font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {reviews.map((review) => (
                    <tr key={review._id} className={`hover:bg-surface-container-low transition-colors ${selectedReviews.includes(review._id) ? 'bg-primary-container/5' : ''}`}>
                      <td className="p-4">
                        <button onClick={() => toggleSelect(review._id)} className="text-on-surface-variant hover:text-primary transition-colors">
                          {selectedReviews.includes(review._id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded bg-surface-container border border-outline-variant overflow-hidden shrink-0">
                            <Image
                              className="object-cover"
                              alt={review.productId?.title || 'Product'}
                              src={review.productId?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                              fill
                              sizes="40px"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-on-surface line-clamp-1">{review.productId?.title || 'Unknown Product'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-on-surface">{review.customerName}</p>
                        <p className="text-body-sm text-on-surface-variant">{review.customerEmail || 'No Email'}</p>
                      </td>
                      <td className="p-4">{renderStars(review.rating)}</td>
                      <td className="p-4 text-body-md text-on-surface whitespace-pre-wrap">{review.reviewText}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full font-bold text-body-sm uppercase ${getStatusBadge(review.status)}`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {review.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(review._id, 'approved')}
                              className="p-2 text-primary hover:bg-primary-container/10 rounded transition-colors"
                              title="Approve Review"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(review._id, 'rejected')}
                              className="p-2 text-error hover:bg-error-container/10 rounded transition-colors"
                              title="Reject Review"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded transition-colors"
                            title="Delete Review"
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

export default ReviewsPage;
