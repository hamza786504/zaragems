'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  ShoppingCart,
  AlertTriangle,
  Star,
  CreditCard,
  Info,
  CheckCheck,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const now = Date.now();
  const diff = Math.max(0, now - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const TYPE_META = {
  new_order:  { icon: ShoppingCart, color: 'text-blue-500',   bg: 'bg-blue-100',   label: 'New Order'  },
  low_stock:  { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100',  label: 'Low Stock'  },
  new_review: { icon: Star,          color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Review'     },
  payment:    { icon: CreditCard,    color: 'text-green-500',  bg: 'bg-green-100',  label: 'Payment'    },
  system:     { icon: Info,          color: 'text-slate-500',  bg: 'bg-slate-100',  label: 'System'     },
};

function NotifIcon({ type, size = 'md' }) {
  const meta = TYPE_META[type] || TYPE_META.system;
  const Icon = meta.icon;
  const sz = size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const iconSz = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className={`${sz} rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${iconSz} ${meta.color}`} />
    </div>
  );
}

const TYPE_OPTIONS = [
  { value: 'all',        label: 'All Types'  },
  { value: 'new_order',  label: 'New Order'  },
  { value: 'low_stock',  label: 'Low Stock'  },
  { value: 'new_review', label: 'Review'     },
  { value: 'payment',    label: 'Payment'    },
  { value: 'system',     label: 'System'     },
];

const READ_TABS = [
  { value: '',      label: 'All'    },
  { value: 'false', label: 'Unread' },
  { value: 'true',  label: 'Read'   },
];
// ───────────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();

  // ── filter / pagination state ─────────────────────────────────────────────
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [readFilter, setReadFilter] = useState('');        // '' | 'true' | 'false'
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage]           = useState(1);
  const LIMIT = 15;

  // ── data state ────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── selection state ───────────────────────────────────────────────────────
  const [selected, setSelected]   = useState(new Set());

  // ── toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast]         = useState(null);  // { msg, type }
  const toastTimer                = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ── debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (readFilter !== '') params.set('isRead', readFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setSelected(new Set());
    } catch (err) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, debouncedSearch, readFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── selection helpers ─────────────────────────────────────────────────────
  const allSelected = notifications.length > 0 && notifications.every(n => selected.has(n._id));
  const someSelected = selected.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(notifications.map(n => n._id)));
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── actions ───────────────────────────────────────────────────────────────
  const markSelectedRead = async (isRead = true) => {
    if (!someSelected) return;
    const ids = [...selected];
    setNotifications(prev => prev.map(n => ids.includes(n._id) ? { ...n, isRead } : n));
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, isRead }),
      });
      if (!res.ok) throw new Error();
      showToast(`Marked ${ids.length} notification${ids.length !== 1 ? 's' : ''} as ${isRead ? 'read' : 'unread'}`);
      setSelected(new Set());
    } catch {
      showToast('Failed to update notifications', 'error');
      fetchData(true);
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, isRead: true }),
      });
      if (!res.ok) throw new Error();
      showToast('All notifications marked as read');
    } catch {
      showToast('Failed to update notifications', 'error');
      fetchData(true);
    }
  };

  const deleteSelected = async () => {
    if (!someSelected) return;
    const ids = [...selected];
    setNotifications(prev => prev.filter(n => !ids.includes(n._id)));
    setTotal(prev => Math.max(0, prev - ids.length));
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error();
      showToast(`Deleted ${ids.length} notification${ids.length !== 1 ? 's' : ''}`);
      setSelected(new Set());
    } catch {
      showToast('Failed to delete notifications', 'error');
      fetchData(true);
    }
  };

  const markOneRead = async (notif) => {
    const newVal = !notif.isRead;
    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: newVal } : n));
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [notif._id], isRead: newVal }),
    }).catch(() => {});
  };

  const deleteOne = async (id) => {
    setNotifications(prev => prev.filter(n => n._id !== id));
    setTotal(prev => Math.max(0, prev - 1));
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
    showToast('Notification deleted');
  };

  const resetFilters = () => {
    setSearch('');
    setReadFilter('');
    setTypeFilter('all');
    setPage(1);
  };

  const hasFilters = search || readFilter !== '' || typeFilter !== 'all';
  const unreadCountOnPage = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}
        >
          {toast.type === 'error' ? <X className="w-4 h-4" /> : <CheckCheck className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notifications
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {total} notification{total !== 1 ? 's' : ''} total
            {unreadCountOnPage > 0 && ` · ${unreadCountOnPage} unread on this page`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {unreadCountOnPage > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── Search + Filters ──────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            id="notif-search"
            type="text"
            placeholder="Search notifications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-on-surface-variant" />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Read status tabs */}
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 gap-0.5">
            {READ_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setReadFilter(tab.value); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  readFilter === tab.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              id="notif-type-filter"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="text-xs bg-surface-container border border-outline-variant rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-on-surface cursor-pointer"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-error hover:underline"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk Action Bar ───────────────────────────────────────────────── */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-primary">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => markSelectedRead(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <CheckCheck className="w-3.5 h-3.5 text-green-600" />
              Mark read
            </button>
            <button
              onClick={() => markSelectedRead(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              Mark unread
            </button>
            <button
              onClick={deleteSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2.5 bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider items-center">
          <button onClick={toggleSelectAll} className="flex items-center">
            {allSelected
              ? <CheckSquare className="w-4 h-4 text-primary" />
              : <Square className="w-4 h-4 text-on-surface-variant/50" />
            }
          </button>
          <span>Notification</span>
          <span className="hidden sm:block">Date</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="divide-y divide-outline-variant/40">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3.5 items-start animate-pulse">
                <div className="w-4 h-4 bg-surface-container rounded mt-1" />
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-full bg-surface-container flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3.5 bg-surface-container rounded w-2/3" />
                    <div className="h-2.5 bg-surface-container rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-surface-container rounded w-24 hidden sm:block mt-2" />
                <div className="h-3 bg-surface-container rounded w-16 mt-2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="w-14 h-14 text-on-surface-variant/15 mx-auto mb-4" />
            <p className="text-base font-semibold text-on-surface">No notifications found</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {hasFilters ? 'Try adjusting or clearing your filters.' : 'Notifications will appear here when orders are placed.'}
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="mt-4 text-sm text-primary hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-3.5 items-start transition-colors hover:bg-surface-container/40 group ${
                  !notif.isRead ? 'bg-primary/[0.03]' : ''
                } ${selected.has(notif._id) ? 'bg-primary/5' : ''}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleSelect(notif._id)}
                  className="mt-1 flex items-center"
                >
                  {selected.has(notif._id)
                    ? <CheckSquare className="w-4 h-4 text-primary" />
                    : <Square className="w-4 h-4 text-on-surface-variant/30 group-hover:text-on-surface-variant/60" />
                  }
                </button>

                {/* Content */}
                <div className="flex gap-3 items-start min-w-0">
                  <NotifIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm leading-snug ${!notif.isRead ? 'font-semibold text-on-surface' : 'text-on-surface'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide">
                          New
                        </span>
                      )}
                      {/* Type badge */}
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_META[notif.type]?.bg || 'bg-slate-100'} ${TYPE_META[notif.type]?.color || 'text-slate-500'}`}>
                        {TYPE_META[notif.type]?.label || notif.type}
                      </span>
                    </div>
                    {notif.message && (
                      <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notif.message}</p>
                    )}
                    {/* Mobile date */}
                    <p className="text-[11px] text-on-surface-variant/60 mt-1 sm:hidden">{fmtDate(notif.createdAt)}</p>
                  </div>
                </div>

                {/* Date — desktop */}
                <div className="hidden sm:block text-right pt-1">
                  <p className="text-xs text-on-surface-variant whitespace-nowrap">{timeAgo(notif.createdAt)}</p>
                  <p className="text-[11px] text-on-surface-variant/60 mt-0.5 whitespace-nowrap">{fmtDate(notif.createdAt)}</p>
                </div>

                {/* Row actions */}
                <div className="flex items-center gap-1 pt-0.5">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => !notif.isRead && markOneRead(notif)}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                      title="Go to resource"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => markOneRead(notif)}
                    className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant"
                    title={notif.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    <CheckCheck className={`w-3.5 h-3.5 ${notif.isRead ? 'text-green-500' : 'text-on-surface-variant/40'}`} />
                  </button>
                  <button
                    onClick={() => deleteOne(notif._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-on-surface-variant hover:text-red-500"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Page {page} of {totalPages} &nbsp;·&nbsp; {total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                      p === page
                        ? 'bg-primary text-white font-semibold'
                        : 'hover:bg-surface-container border border-outline-variant text-on-surface-variant'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
