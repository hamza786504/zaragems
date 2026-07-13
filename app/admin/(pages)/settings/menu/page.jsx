// app/admin/(pages)/settings/menu/page.jsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Search,
  ChevronRight,
  Info,
  HelpCircle,
  Layers,
  Save,
  X,
  ArrowLeft,
  Menu,
  Package,
  FolderOpen,
  FileText,
  Link2,
  Check,
  Loader2,
  RefreshCw,
  Globe,
  Navigation,
  CheckCheck,
} from 'lucide-react';
import Button from '../../../../_components/Admin/Button';

// ── helpers ───────────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

const TYPE_ICON = {
  product:    <Package    className="w-3.5 h-3.5" />,
  collection: <FolderOpen className="w-3.5 h-3.5" />,
  page:       <FileText   className="w-3.5 h-3.5" />,
  custom:     <Link2      className="w-3.5 h-3.5" />,
};

const TYPE_COLOR = {
  product:    'bg-blue-50 text-blue-600',
  collection: 'bg-purple-50 text-purple-600',
  page:       'bg-green-50 text-green-600',
  custom:     'bg-slate-50 text-slate-500',
};

const POSITION_OPTIONS = [
  { value: 'none',    label: 'None (hidden)',   color: 'text-on-surface-variant' },
  { value: 'header',  label: 'Header Nav',      color: 'text-blue-600' },
  { value: 'footer',  label: 'Footer',          color: 'text-green-600' },
  { value: 'sidebar', label: 'Sidebar',         color: 'text-purple-600' },
];

const POSITION_BADGE = {
  header:  { label: 'Header',  cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  footer:  { label: 'Footer',  cls: 'bg-green-50 text-green-600 border-green-200' },
  sidebar: { label: 'Sidebar', cls: 'bg-purple-50 text-purple-600 border-purple-200' },
  none:    { label: 'Hidden',  cls: 'bg-surface-container text-on-surface-variant border-outline-variant' },
};

const MAX_DEPTH = 2;

// ── Tree helpers ──────────────────────────────────────────────────────────────
function flattenTree(items, parentId = null, depth = 0) {
  const result = [];
  for (const item of items) {
    result.push({ ...item, parentId, depth, children: undefined });
    if (item.children && item.children.length > 0) {
      result.push(...flattenTree(item.children, item.id, depth + 1));
    }
  }
  return result;
}

function buildTree(flat) {
  const itemMap = {};
  const childIds = {};

  for (const item of flat) {
    itemMap[item.id] = { ...item, children: [] };
    childIds[item.id] = [];
  }

  for (const item of flat) {
    if (item.parentId && itemMap[item.parentId]) {
      childIds[item.parentId].push(item.id);
    }
  }

  const rootIds = flat.filter(i => !i.parentId || !itemMap[i.parentId]).map(i => i.id);

  const build = (ids) => ids.map(id => ({
    ...itemMap[id],
    children: build(childIds[id]),
  }));

  return build(rootIds);
}

function isDescendant(flat, parentId, childId) {
  const parentIdx = flat.findIndex(i => i.id === parentId);
  if (parentIdx === -1) return false;
  for (let i = parentIdx + 1; i < flat.length; i++) {
    if (flat[i].depth <= flat[parentIdx].depth) break;
    if (flat[i].id === childId) return true;
  }
  return false;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-20 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all duration-300 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
      {toast.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
      {toast.msg}
    </div>
  );
}

// ── Drag preview component ────────────────────────────────────────────────────
function DragPreview({ flat, activeId }) {
  const item = flat.find(i => i.id === activeId);
  if (!item) return null;
  return (
    <div className="bg-surface border-2 border-primary rounded-xl p-3 shadow-lg opacity-95 rotate-1">
      <div className="flex items-center gap-3">
        <GripVertical size={18} className="text-primary" />
        <div>
          <span className="font-medium text-sm block">{item.title}</span>
          <span className="text-xs text-on-surface-variant font-mono">{item.url}</span>
        </div>
      </div>
    </div>
  );
}

// ── Add/Edit Item Modal with Autocomplete ─────────────────────────────────────
const MenuItemModal = ({ isOpen, onClose, onSave, editingItem, parentId, parentDepth }) => {
  const [title, setTitle]           = useState('');
  const [url, setUrl]               = useState('');
  const [resourceType, setResourceType] = useState('custom');
  const [resourceId, setResourceId] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching]   = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const searchTimer                 = useRef(null);
  const titleRef                    = useRef(null);
  const suggestRef                  = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setTitle(editingItem.title);
        setUrl(editingItem.url);
        setResourceType(editingItem.resourceType || 'custom');
        setResourceId(editingItem.resourceId || '');
        setSelectedResult(null);
      } else {
        setTitle('');
        setUrl('');
        setResourceType('custom');
        setResourceId('');
        setSelectedResult(null);
      }
      setSuggestions([]);
      setShowSuggestions(false);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen, editingItem]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (title.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/menus/search?q=${encodeURIComponent(title)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setShowSuggestions((data.results || []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => clearTimeout(searchTimer.current);
  }, [title]);

  useEffect(() => {
    const handler = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelectSuggestion = (result) => {
    setTitle(result.label);
    setUrl(result.url);
    setResourceType(result.type);
    setResourceId(result.id || '');
    setSelectedResult(result);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const finalUrl = url.trim() || '/';
    onSave({ title: title.trim(), url: finalUrl, resourceType, resourceId });
  };

  const grouped = suggestions.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {});

  const typeOrder = ['collection', 'product', 'page'];
  const typeLabel = { collection: 'Collections', product: 'Products', page: 'Pages' };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 pointer-events-none">
        <div className="w-full max-w-[500px] pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
            <h3 className="font-semibold text-on-surface text-base">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              <div ref={suggestRef} className="relative">
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Title <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={titleRef}
                    className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/50 pr-10"
                    type="text"
                    placeholder="Type to search products, collections, pages\u2026"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setSelectedResult(null); setUrl(''); }}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searching
                      ? <Loader2 className="w-4 h-4 animate-spin text-on-surface-variant/50" />
                      : <Search className="w-4 h-4 text-on-surface-variant/40" />
                    }
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Type any keyword — matching products, collections, and pages will appear.
                </p>

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
                    {typeOrder.filter(t => grouped[t]?.length > 0).map((type) => (
                      <div key={type}>
                        <div className="px-3 py-1.5 bg-surface-container/60 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/40">
                          {typeLabel[type]}
                        </div>
                        {grouped[type].map((result) => (
                          <button
                            key={`${result.type}-${result.id}`}
                            type="button"
                            onClick={() => handleSelectSuggestion(result)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left"
                          >
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${TYPE_COLOR[type]}`}>
                              {TYPE_ICON[type]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-on-surface truncate">{result.label}</p>
                              <p className="text-[11px] text-on-surface-variant font-mono truncate">{result.url}</p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/40 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedResult && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${TYPE_COLOR[selectedResult.type]} border-transparent bg-opacity-50`}
                  style={{ backgroundColor: 'rgba(var(--color-primary-rgb, 99,102,241), 0.06)' }}>
                  <CheckCheck className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-on-surface">Auto-filled from <strong>{selectedResult.type}</strong>: {selectedResult.label}</span>
                  <button type="button" onClick={() => { setSelectedResult(null); setResourceType('custom'); setResourceId(''); }}
                    className="ml-auto text-on-surface-variant hover:text-on-surface">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  URL / Path <span className="text-error">*</span>
                </label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono placeholder:text-on-surface-variant/50"
                  type="text"
                  placeholder="/collection/example  or  https://..."
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setSelectedResult(null); }}
                />
                {url && (
                  <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wide">Slug:</span>
                    <code className="text-[11px] text-primary font-mono bg-primary/5 px-2 py-0.5 rounded-md">
                      {url.startsWith('/') ? url : `/${url}`}
                    </code>
                  </div>
                )}
              </div>

              {parentId && (
                <div className="bg-primary-container/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                  <Info size={14} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-on-surface-variant">This item will be added as a <strong>nested item</strong> (level {parentDepth + 1}).</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant bg-surface-container/30 rounded-b-2xl">
              <Button onClick={onClose} variant="outline" type="button">Cancel</Button>
              <Button type="submit" icon={editingItem ? <Pencil size={15} /> : <Plus size={15} />}>
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Create Menu Modal ─────────────────────────────────────────────────────────
const CreateMenuModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName]     = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError]   = useState('');
  const inputRef            = useRef(null);

  useEffect(() => {
    if (isOpen) { setName(''); setError(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [isOpen]);

  const handle = slugify(name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create menu');
      onCreate(data.menu);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 pointer-events-none">
        <div className="w-full max-w-[500px] pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-base">Create New Menu</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1.5">
                    Menu Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-400"
                    type="text"
                    placeholder="e.g., Main Menu, Footer Links, Sidebar Nav"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(''); }}
                  />
                  {name && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Handle: <code className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{handle}</code>
                    </p>
                  )}
                  {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500">
                    After creating the menu, you can add items and assign it to a position on your storefront (header, footer, etc.).
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || creating}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {creating ? 'Creating…' : 'Create Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Menus List View ───────────────────────────────────────────────────────────
const MenusListView = ({ onEditMenu }) => {
  const [menus, setMenus]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast]         = useState(null);
  const toastTimer                = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();
      setMenus(data.menus || []);
    } catch { showToast('Failed to load menus', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const handleDelete = async (handle, name) => {
    if (!window.confirm(`Delete menu "${name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/menus/${handle}`, { method: 'DELETE' });
      setMenus(prev => prev.filter(m => m.handle !== handle));
      showToast(`Menu "${name}" deleted`);
    } catch { showToast('Failed to delete menu', 'error'); }
  };

  const handleCreated = (menu) => {
    setShowCreate(false);
    onEditMenu(menu.handle, menu.name);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Toast toast={toast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <Navigation className="w-6 h-6 text-primary" />
            Navigation Menus
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Create and manage menus for different areas of your storefront.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchMenus} className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Create menu
          </Button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          <span>Menu</span>
          <span>Position</span>
          <span>Items</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="flex-1 h-4 bg-surface-container rounded" />
                <div className="w-20 h-4 bg-surface-container rounded" />
                <div className="w-10 h-4 bg-surface-container rounded" />
                <div className="w-20 h-4 bg-surface-container rounded" />
              </div>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="py-16 text-center">
            <Navigation className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
            <p className="font-medium text-on-surface">No menus yet</p>
            <p className="text-sm text-on-surface-variant mt-1">Create your first menu to get started.</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus size={16} /> Create menu
            </button>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {menus.map((menu) => {
              const badge = POSITION_BADGE[menu.position] || POSITION_BADGE.none;
              return (
                <div key={menu.handle} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-4 items-center hover:bg-surface-container/40 transition-colors">
                  <div>
                    <p className="font-medium text-on-surface text-sm">{menu.name}</p>
                    <p className="text-xs text-on-surface-variant font-mono mt-0.5">{menu.handle}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.cls} whitespace-nowrap`}>
                    {badge.label}
                  </span>
                  <span className="text-sm text-on-surface-variant text-center">
                    {menu.itemCount ?? (menu.items || []).length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEditMenu(menu.handle, menu.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors border border-primary/20">
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(menu.handle, menu.name)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-on-surface-variant hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateMenuModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreated} />
    </div>
  );
};

// ── Sortable Item with custom drag (no external library) ─────────────────────
const FlatMenuItem = ({ item, onEdit, onDelete, indicator, onPointerDown, isDragging, containerRef, childZoneRef }) => {
  const indent = item.depth * 36;
  const isOver = indicator?.id === item.id;
  const showChildLine = isOver && indicator?.asChild;
  const showSiblingLine = isOver && !indicator?.asChild;

  return (
    <div ref={containerRef} className="relative" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* Sibling drop indicator line (above the item) */}
      {showSiblingLine && (
        <div className="absolute left-0 right-0 top-0 z-10 pointer-events-none" style={{ marginLeft: indent }}>
          <div className="h-0.5 bg-primary rounded-full mx-3" />
        </div>
      )}

      {/* Indent connector lines */}
      {indent > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex pointer-events-none" style={{ width: indent }}>
          {Array.from({ length: item.depth }).map((_, i) => (
            <div key={i} className="flex-1 flex justify-center">
              <div className="w-px bg-outline-variant/40 h-full" />
            </div>
          ))}
        </div>
      )}

      {/* Depth badge */}
      {item.depth > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: 4 + (item.depth - 1) * 36 }}>
          <ChevronRight size={12} className="text-outline-variant" />
        </div>
      )}

      {/* Child drop indicator — left border highlight */}
      {showChildLine && (
        <div className="absolute left-0 top-0 bottom-0 rounded-l-lg pointer-events-none z-10" style={{ left: indent }}>
          <div className="w-1 bg-primary h-full rounded-l-lg" />
        </div>
      )}

      <div className={`group bg-surface border rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-all ${
        showChildLine ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline-variant'
      }`} style={{ marginLeft: indent }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag handle — triggers drag start */}
          <button
            onPointerDown={(e) => onPointerDown(e, item.id)}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-surface-container-high rounded touch-none flex-shrink-0"
          >
            <GripVertical size={18} className="text-on-surface-variant/50" />
          </button>

          {/* Content area — doubles as child-zone droppable */}
          <div ref={childZoneRef} className="flex-1 min-w-0 rounded-lg transition-colors px-2 py-1 -mx-2"
            style={{ cursor: item.depth < MAX_DEPTH ? 'copy' : 'default' }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate text-on-surface">{item.title}</span>
              {item.resourceType && item.resourceType !== 'custom' && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${TYPE_COLOR[item.resourceType]} border-transparent`}>
                  {TYPE_ICON[item.resourceType]}
                  {item.resourceType}
                </span>
              )}
            </div>
            <span className="text-xs text-on-surface-variant/70 truncate block font-mono mt-0.5">{item.url}</span>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-3 flex-shrink-0">
          {item.depth < MAX_DEPTH && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }}
              className="p-1.5 hover:bg-primary-container/20 rounded-lg text-primary transition-colors" title="Add child item">
              <Plus size={15} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
            className="p-1.5 hover:bg-error-container/20 rounded-lg text-error transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Menu Editor View ──────────────────────────────────────────────────────────
const MenuEditorView = ({ handle, onBack }) => {
  const [menu, setMenu]           = useState(null);
  const [menuName, setMenuName]   = useState('');
  const [menuHandle, setMenuHandle] = useState('');
  const [position, setPosition]   = useState('none');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [parentId, setParentId]   = useState(null);
  const [parentDepth, setParentDepth] = useState(0);
  const [toast, setToast]         = useState(null);
  const [dragState, setDragState] = useState(null);       // { activeId, startX, startY, offsetX, offsetY }
  const [indicator, setIndicator] = useState(null);       // { id, asChild }
  const toastTimer                = useRef(null);

  // Refs for custom drag
  const itemRefs = useRef({});
  const childZoneRefs = useRef({});
  const originalItemsRef = useRef(null);
  const menuItemsRef = useRef(menuItems);

  // Keep menuItemsRef in sync
  useEffect(() => {
    menuItemsRef.current = menuItems;
  }, [menuItems]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/menus/${handle}`);
        const data = await res.json();
        if (data.menu) {
          setMenu(data.menu);
          setMenuName(data.menu.name);
          setMenuHandle(data.menu.handle);
          setPosition(data.menu.position || 'none');
          setMenuItems(data.menu.items || []);
        }
      } catch { showToast('Failed to load menu', 'error'); }
      finally { setLoading(false); }
    })();
  }, [handle]);

  // ── Helper to get current bounding rects ─────────────────────────────────
  const getRects = useCallback(() => {
    const itemRects = {};
    const childRects = {};
    Object.keys(itemRefs.current).forEach(id => {
      const el = itemRefs.current[id];
      if (el) itemRects[id] = el.getBoundingClientRect();
    });
    Object.keys(childZoneRefs.current).forEach(id => {
      const el = childZoneRefs.current[id];
      if (el) childRects[id] = el.getBoundingClientRect();
    });
    return { itemRects, childRects };
  }, []);

  // ── Drag start handler ───────────────────────────────────────────────────
  const handleDragStart = useCallback((e, id) => {
    e.preventDefault();
    e.stopPropagation();
    // Save original tree for cancel/revert
    originalItemsRef.current = JSON.parse(JSON.stringify(menuItemsRef.current));
    setDragState({
      activeId: id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: 0,
      offsetY: 0,
    });
    setIndicator(null);
  }, []);

  // ── Global move/up handlers ──────────────────────────────────────────────
  useEffect(() => {
    if (!dragState) return;

    const onPointerMove = (e) => {
      e.preventDefault();
      const { startX, startY } = dragState;
      setDragState(prev => ({
        ...prev,
        offsetX: e.clientX - startX,
        offsetY: e.clientY - startY,
      }));

      // Determine drop indicator
      const { itemRects, childRects } = getRects();
      const flatItems = flattenTree(menuItemsRef.current);
      const pointerX = e.clientX;
      const pointerY = e.clientY;

      let newIndicator = null;

      // 1. Child zones
      for (const id of Object.keys(childRects)) {
        const rect = childRects[id];
        if (
          pointerX >= rect.left && pointerX <= rect.right &&
          pointerY >= rect.top && pointerY <= rect.bottom
        ) {
          const targetItem = flatItems.find(i => i.id === id);
          if (targetItem && targetItem.depth < MAX_DEPTH && id !== dragState.activeId) {
            newIndicator = { id, asChild: true };
            break;
          }
        }
      }

      // 2. Sibling drop
      if (!newIndicator) {
        let overId = null;
        for (const id of Object.keys(itemRects)) {
          const rect = itemRects[id];
          if (id === dragState.activeId) continue;
          if (
            pointerY >= rect.top && pointerY <= rect.bottom &&
            pointerX >= rect.left && pointerX <= rect.right
          ) {
            overId = id;
            break;
          }
        }
        if (overId) {
          newIndicator = { id: overId, asChild: false };
        } else {
          // Append at end if below all items
          const allRects = Object.values(itemRects);
          if (allRects.length > 0) {
            const bottomMost = Math.max(...allRects.map(r => r.bottom));
            if (pointerY > bottomMost) {
              newIndicator = { id: '__end__', asChild: false };
            }
          }
        }
      }

      setIndicator(newIndicator);
    };

    const onPointerUp = (e) => {
      if (!dragState) return;
      const { activeId } = dragState;
      const dropTarget = indicator; // capture current indicator
      setDragState(null);
      setIndicator(null);

      if (dropTarget) {
        applyDrop(activeId, dropTarget);
      } else {
        // No target, revert
        if (originalItemsRef.current) {
          setMenuItems(originalItemsRef.current);
          originalItemsRef.current = null;
        }
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDragState(null);
        setIndicator(null);
        if (originalItemsRef.current) {
          setMenuItems(originalItemsRef.current);
          originalItemsRef.current = null;
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [dragState, indicator, getRects]); // eslint-disable-line

  // ── Drop logic (uses ref for fresh menuItems) ────────────────────────────
  const applyDrop = useCallback((activeId, targetIndicator) => {
    const currentItems = menuItemsRef.current;
    const flatCopy = flattenTree(currentItems);
    const oldIdx = flatCopy.findIndex(i => i.id === activeId);
    if (oldIdx === -1) return;

    const [moved] = flatCopy.splice(oldIdx, 1);

    if (targetIndicator.id === '__end__') {
      moved.depth = 0;
      moved.parentId = null;
      flatCopy.push(moved);
      const newTree = buildTree(flatCopy);
      setMenuItems(newTree);
      showToast('Item moved — save to apply changes', 'success');
      return;
    }

    const targetIdx = flatCopy.findIndex(i => i.id === targetIndicator.id);
    if (targetIdx === -1) return;
    const targetItem = flatCopy[targetIdx];

    if (targetIndicator.asChild) {
      if (targetItem.depth >= MAX_DEPTH) {
        showToast('Maximum nesting depth reached', 'error');
        return;
      }
      if (isDescendant(flatCopy, activeId, targetItem.id)) {
        showToast('Cannot drop inside its own child', 'error');
        return;
      }
      moved.depth = targetItem.depth + 1;
      moved.parentId = targetItem.id;
      let insertIdx = targetIdx + 1;
      while (insertIdx < flatCopy.length && flatCopy[insertIdx].depth > targetItem.depth) {
        insertIdx++;
      }
      flatCopy.splice(insertIdx, 0, moved);
    } else {
      moved.depth = targetItem.depth;
      moved.parentId = targetItem.parentId;
      flatCopy.splice(targetIdx, 0, moved);
    }

    const newTree = buildTree(flatCopy);
    setMenuItems(newTree);
    showToast('Item moved — save to apply changes', 'success');
  }, [showToast]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setParentId(item.parentId || null);
    setParentDepth(item.depth);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    const remove = (items) => items
      .filter(i => i.id !== id)
      .map(i => ({ ...i, children: remove(i.children || []) }));
    setMenuItems(remove(menuItems));
    showToast('Item removed — save to apply changes', 'success');
  };

  const handleSaveItem = (formData) => {
    if (editingItem) {
      const update = (items) => items.map(i => {
        if (i.id === editingItem.id) return { ...i, ...formData };
        return { ...i, children: update(i.children || []) };
      });
      setMenuItems(update(menuItems));
      showToast('Item updated — save to apply changes');
    } else {
      const newItem = { id: `item-${Date.now()}`, ...formData, children: [] };
      if (parentId) {
        const addToParent = (items) => items.map(i => {
          if (i.id === parentId) return { ...i, children: [...(i.children || []), newItem] };
          return { ...i, children: addToParent(i.children || []) };
        });
        setMenuItems(addToParent(menuItems));
      } else {
        setMenuItems([...menuItems, newItem]);
      }
      showToast('Item added — save to apply changes');
    }
    setShowModal(false); setParentId(null); setEditingItem(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/menus/${handle}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: menuName, position, items: menuItems }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('Menu saved successfully!');
    } catch { showToast('Failed to save menu', 'error'); }
    finally { setIsSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant">Loading menu…</p>
      </div>
    );
  }

  const flat = flattenTree(menuItems);

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">
      <Toast toast={toast} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors text-on-surface-variant" title="Back to menus">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-on-surface">{menuName}</h1>
            <p className="text-xs text-on-surface-variant font-mono mt-0.5">/api/menus/{menuHandle}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} icon={isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}>
          {isSaving ? 'Saving…' : 'Save menu'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5">
            <h3 className="font-semibold text-on-surface mb-4 text-sm">Menu Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Name</label>
                <input
                  className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  Handle <HelpCircle size={12} className="inline ml-1 text-on-surface-variant/60" />
                </label>
                <input
                  className="w-full bg-surface-container border border-outline-variant rounded-xl px-3 py-2.5 text-sm font-mono text-on-surface-variant outline-none"
                  value={menuHandle}
                  readOnly
                />
                <p className="text-[11px] text-on-surface-variant/60 mt-1">Used in code to reference this menu</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                  <Globe size={12} className="inline mr-1" />
                  Display Position
                </label>
                <select
                  className="w-full bg-surface border border-outline-variant rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none cursor-pointer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  {POSITION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-on-surface-variant/60 mt-1">
                  Only one menu per position is shown on the frontend.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
            <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant">
              Use the <strong>Title</strong> field to search and auto-fill any product, collection, or page.
              Drag an item and drop it on another item’s content area to nest it as a child (up to 3 levels).
              Drag the handle to reorder as siblings.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 min-h-[400px]">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-semibold text-on-surface text-sm">Menu Items</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}</p>
              </div>
              <Button onClick={() => { setParentId(null); setParentDepth(0); setEditingItem(null); setShowModal(true); }} variant="text" icon={<Plus size={16} />}>
                Add item
              </Button>
            </div>

            {/* Custom drag zone – no external library */}
            <div className="space-y-1 relative">
              {flat.map((item) => (
                <FlatMenuItem
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  indicator={indicator}
                  isDragging={dragState?.activeId === item.id}
                  onPointerDown={handleDragStart}
                  containerRef={el => (itemRefs.current[item.id] = el)}
                  childZoneRef={el => (childZoneRefs.current[item.id] = el)}
                />
              ))}
            </div>

            {menuItems.length === 0 && (
              <div className="mt-8 border-2 border-dashed border-outline-variant rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <Layers size={40} className="text-on-surface-variant/20 mb-4" />
                <p className="font-medium text-on-surface text-sm">No menu items yet</p>
                <p className="text-xs text-on-surface-variant mt-1 max-w-[400px] mb-5">
                  Add your first item. Type a keyword to search products, collections, and pages.
                </p>
                <Button onClick={() => { setParentId(null); setEditingItem(null); setShowModal(true); }} variant="text" icon={<Plus size={16} />}>
                  Add First Item
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom drag overlay (fixed, follows pointer) */}
      {dragState && (
        <div
          style={{
            position: 'fixed',
            left: dragState.startX + dragState.offsetX,
            top: dragState.startY + dragState.offsetY,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <DragPreview flat={flat} activeId={dragState.activeId} />
        </div>
      )}

      <MenuItemModal isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); setParentId(null); }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        parentId={parentId}
        parentDepth={parentDepth}
      />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const [view, setView]           = useState('list');
  const [activeHandle, setActiveHandle] = useState('');
  const [activeMenuName, setActiveMenuName] = useState('');

  const openEditor = (handle, name) => {
    setActiveHandle(handle);
    setActiveMenuName(name);
    setView('editor');
  };

  return (
    <div className="min-h-screen">
      {view === 'list' ? (
        <MenusListView onEditMenu={openEditor} />
      ) : (
        <MenuEditorView
          handle={activeHandle}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
}