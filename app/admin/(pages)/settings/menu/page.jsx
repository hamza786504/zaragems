// app/admin/(pages)/settings/menu/page.jsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
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

// ── Sortable Menu Item ────────────────────────────────────────────────────────
const SortableMenuItem = ({ item, onEdit, onDelete, onAddChild, depth = 0 }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="space-y-2">
        <div className="group bg-surface border border-outline-variant rounded-lg p-3 flex items-center justify-between hover:shadow-sm transition-all">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-surface-container-high rounded touch-none flex-shrink-0">
              <GripVertical size={18} className="text-on-surface-variant/50" />
            </button>
            <div className="flex-1 min-w-0">
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
            {depth < 2 && (
              <button onClick={(e) => { e.stopPropagation(); onAddChild && onAddChild(item.id); }}
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

        {item.children && item.children.length > 0 && (
          <div className="pl-8 space-y-2 border-l-2 border-outline-variant ml-6">
            <SortableContext items={item.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {item.children.map((child) => (
                <SortableMenuItem key={child.id} item={child} onEdit={onEdit} onDelete={onDelete}
                  onAddChild={depth < 1 ? onAddChild : null} depth={depth + 1} />
              ))}
            </SortableContext>
            {depth < 1 && (
              <button onClick={() => onAddChild && onAddChild(item.id)}
                className="flex items-center gap-2 text-primary hover:bg-primary-container/10 px-3 py-2 rounded-lg text-xs transition-colors w-full">
                <Plus size={14} /> Add item to {item.title}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Add/Edit Item Modal with Autocomplete ─────────────────────────────────────
const MenuItemModal = ({ isOpen, onClose, onSave, editingItem, parentId }) => {
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

  // Reset on open/editingItem change
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

  // Debounced search as title changes
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

  // Close suggestions on outside click
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

  // Group suggestions by type
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
          {/* Header */}
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
              {/* Title with autocomplete */}
              <div ref={suggestRef} className="relative">
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Title <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={titleRef}
                    className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-on-surface-variant/50 pr-10"
                    type="text"
                    placeholder="Type to search products, collections, pages…"
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

                {/* Autocomplete Dropdown */}
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

              {/* Selected resource badge */}
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

              {/* URL Field */}
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

              {/* Parent info */}
              {parentId && (
                <div className="bg-primary-container/5 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                  <Info size={14} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-on-surface-variant">This item will be added as a <strong>nested item</strong>.</p>
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal — pointer-events-none on wrapper, pointer-events-auto on card */}
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

      {/* Page header */}
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

      {/* Menus Table */}
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

// ── Menu Editor View ──────────────────────────────────────────────────────────
const MenuEditorView = ({ handle, onBack }) => {
  const [menu, setMenu]           = useState(null);
  const [menuName, setMenuName]   = useState('');
  const [menuHandle, setMenuHandle] = useState('');
  const [position, setPosition]   = useState('none');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [activeId, setActiveId]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [parentId, setParentId]   = useState(null);
  const [toast, setToast]         = useState(null);
  const toastTimer                = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  // Load menu
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findItem = (items, id, parentId = null) => {
    for (let item of items) {
      if (item.id === id) return { item, parentId };
      if (item.children) {
        const f = findItem(item.children, id, item.id);
        if (f) return f;
      }
    }
    return null;
  };

  // Reorders the array at the level identified by parentId (null = root)
  // by moving activeId to overId's position. Rebuilds the tree by id so it
  // works regardless of which arrays were cloned along the way.
  const moveInTree = (items, parentId, activeId, overId) => {
    if (parentId === null) {
      const oldIdx = items.findIndex(i => i.id === activeId);
      const newIdx = items.findIndex(i => i.id === overId);
      if (oldIdx === -1 || newIdx === -1) return items;
      return arrayMove(items, oldIdx, newIdx);
    }
    return items.map(i => {
      if (i.id === parentId) {
        const children = i.children || [];
        const oldIdx = children.findIndex(c => c.id === activeId);
        const newIdx = children.findIndex(c => c.id === overId);
        if (oldIdx === -1 || newIdx === -1) return i;
        return { ...i, children: arrayMove(children, oldIdx, newIdx) };
      }
      if (i.children && i.children.length) {
        return { ...i, children: moveInTree(i.children, parentId, activeId, overId) };
      }
      return i;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const aRes = findItem(menuItems, active.id);
    const oRes = findItem(menuItems, over.id);
    if (!aRes || !oRes || aRes.parentId !== oRes.parentId) return;
    setMenuItems(prev => moveInTree(prev, aRes.parentId, active.id, over.id));
  };

  const handleEdit = (item) => { setEditingItem(item); setParentId(null); setShowModal(true); };
  const handleAddChild = (pid) => { setParentId(pid); setEditingItem(null); setShowModal(true); };

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

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6">
      <Toast toast={toast} />

      {/* Header */}
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
        {/* Left: Menu Details */}
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
              Use the <strong>Title</strong> field in the item modal to search and auto-fill any product, collection, or page from your store.
            </p>
          </div>
        </div>

        {/* Right: Menu Items */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 min-h-[400px]">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-semibold text-on-surface text-sm">Menu Items</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{menuItems.length} {menuItems.length === 1 ? 'item' : 'items'}</p>
              </div>
              <Button onClick={() => { setParentId(null); setEditingItem(null); setShowModal(true); }} variant="text" icon={<Plus size={16} />}>
                Add item
              </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter}
              onDragStart={(e) => setActiveId(e.active.id)}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}>
              <SortableContext items={menuItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <SortableMenuItem key={item.id} item={item}
                      onEdit={handleEdit} onDelete={handleDelete} onAddChild={handleAddChild} depth={0} />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="bg-surface border-2 border-primary rounded-xl p-3 shadow-lg opacity-95 rotate-1">
                    <div className="flex items-center gap-3">
                      <GripVertical size={18} className="text-primary" />
                      <div>
                        <span className="font-medium text-sm block">{findItem(menuItems, activeId)?.item?.title || 'Moving…'}</span>
                        <span className="text-xs text-on-surface-variant font-mono">{findItem(menuItems, activeId)?.item?.url || ''}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>

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

      <MenuItemModal isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); setParentId(null); }}
        onSave={handleSaveItem}
        editingItem={editingItem}
        parentId={parentId}
      />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const [view, setView]           = useState('list');      // 'list' | 'editor'
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