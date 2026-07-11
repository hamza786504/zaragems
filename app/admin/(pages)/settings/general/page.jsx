// app/settings/general/page.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Store,
  Mail,
  Globe,
  MapPin,
  Search,
  Bell,
  User,
  Home,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Tag,
  AppWindow,
  Settings,
  Clock,
  Check,
  HelpCircle,
  Loader2,
  Image as ImageIcon,
  Type,
  Palette,
} from 'lucide-react';

// Components
import Button from '../../../../_components/Admin/Button';
import {
  GOOGLE_FONTS,
  THEME_TOKENS,
  THEME_GROUPS,
  THEME_PRESETS,
  presetPrimaryHex,
  resolvePalette,
  resolveTypography,
  buildThemeVars,
  buildFontVars,
  buildGoogleFontsHref,
  buildPreset,
  extractBaseControls,
  buildThemeFromControls,
} from '@/lib/theme';

// Settings Card Component
const SettingsCard = ({ icon: Icon, title, children, className = '' }) => {
  return (
    <div className={`bg-white border border-[#E1E3E5] rounded-lg p-3 md:p-6 hover:shadow-[0px_1px_3px_rgba(0,0,0,0.05)] transition-shadow ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Icon className="text-primary w-5 h-5" />
        <h3 className="font-headline-md text-headline-md">{title}</h3>
      </div>
      {children}
    </div>
  );
};

const EMPTY_FORM = {
  storeName: '',
  legalName: '',
  industry: 'Fashion',
  senderEmail: '',
  accountEmail: '',
  timezone: '(GMT+05:00) Pakistan Standard Time',
  unitSystem: 'Metric system (kg, cm, etc.)',
  orderPrefix: '#ZAR-',
  orderSuffix: '',
  address: '',
  apartment: '',
  city: '',
  zipCode: '',
  country: 'Pakistan',
  logoAlt: '',
  typography: { headingFont: 'EB Garamond', bodyFont: 'Manrope' },
  theme: null,
};

// Main Settings Page
const GeneralSettingsPage = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [formErrors, setFormErrors] = useState({});
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);

  // logoRef holds the Sanity image reference to persist; logoPreview is a URL for display
  const [logoRef, setLogoRef] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const fileInputRef = useRef(null);

  // Load existing settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings/general', { credentials: 'include' });
        const result = await res.json();
        if (result.success && result.settings) {
          const s = result.settings;
          setFormData((prev) => ({
            ...prev,
            ...s,
            typography: { ...prev.typography, ...(s.typography || {}) },
            theme: s.theme ?? null
          }));
          setLogoRef(s.logo || null);
          setLogoPreview(s.logoUrl || '');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setFormErrors({ general: 'Failed to load settings' });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.storeName?.trim()) errors.storeName = 'Store name is required';
    if (!formData.legalName?.trim()) errors.legalName = 'Legal name is required';
    if (!formData.senderEmail?.trim()) errors.senderEmail = 'Sender email is required';
    if (!formData.accountEmail?.trim()) errors.accountEmail = 'Account email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size should be under 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLogoRef({
          _type: 'image',
          asset: { _type: 'reference', _ref: data.public_id },
          alt: formData.logoAlt || '',
        });
        setLogoPreview(data.url);
      } else {
        alert('Logo upload failed: ' + (data.message || 'unknown error'));
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      alert('Logo upload error');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeLogo = () => {
    setLogoRef(null);
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveStatus('saving');

    const body = {
      storeName: formData.storeName,
      legalName: formData.legalName,
      industry: formData.industry,
      senderEmail: formData.senderEmail,
      accountEmail: formData.accountEmail,
      timezone: formData.timezone,
      unitSystem: formData.unitSystem,
      orderPrefix: formData.orderPrefix,
      orderSuffix: formData.orderSuffix,
      address: formData.address,
      apartment: formData.apartment,
      city: formData.city,
      zipCode: formData.zipCode,
      country: formData.country,
      logo: logoRef,
      logoAlt: formData.logoAlt,
      typography: formData.typography,
      theme: formData.theme,
    };

    try {
      const res = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const result = await res.json();
      if (result.success && result.settings) {
        const s = result.settings;
        setFormData((prev) => ({
          ...prev,
          ...s,
          typography: { ...prev.typography, ...(s.typography || {}) },
          theme: s.theme ?? null
        }));
        setLogoRef(s.logo || null);
        setLogoPreview(s.logoUrl || '');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setFormErrors({ general: result.error || 'Failed to save settings' });
        setSaveStatus('idle');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setFormErrors({ general: 'Network error occurred while saving' });
      setSaveStatus('idle');
    } finally {
      setIsSaving(false);
    }
  };

  // Color palette helpers — base controls (primary, secondary, etc.) + derived full theme
  const currentTheme = formData.theme || resolvePalette();
  const baseControls = extractBaseControls(currentTheme);

  const handleBaseControlChange = (key, value) => {
    const nextBase = { ...baseControls, [key]: value };
    setFormData((prev) => ({
      ...prev,
      theme: buildThemeFromControls(nextBase)
    }));
  };

  return (
    <>
      {/* Main Content — Sidebar + Header come from the (pages) layout */}
      <main className="p-0 md:p-8 min-h-screen">
        <div className="max-w-[1200px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface">
                General Settings
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                Manage your store's identity, contact information, and regional preferences.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                icon={
                  (saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />) ||
                  (saveStatus === 'saved' && <Check className="w-4 h-4" />)
                }
              >
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved!'}
                {saveStatus === 'idle' && 'Save changes'}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="text-body-md text-on-surface-variant mb-6">Loading settings…</div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column (8 columns) */}
            <div className="col-span-12 md:col-span-8 space-y-6">
              {/* Typography Settings */}
              <SettingsCard icon={Type} title="Typography">
                <div className="space-y-4">
                  {/* Heading Font */}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Heading font</label>
                    <input
                      list="heading-font-options"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
                      value={formData.typography?.headingFont || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          typography: { ...prev.typography, headingFont: value }
                        }));
                      }}
                    />
                    <datalist id="heading-font-options">
                      {GOOGLE_FONTS.map(font => (
                        <option key={font} value={font} />
                      ))}
                    </datalist>
                  </div>
                  {/* Body Font */}
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Body font</label>
                    <input
                      list="body-font-options"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
                      value={formData.typography?.bodyFont || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          typography: { ...prev.typography, bodyFont: value }
                        }));
                      }}
                    />
                    <datalist id="body-font-options">
                      {GOOGLE_FONTS.map(font => (
                        <option key={font} value={font} />
                      ))}
                    </datalist>
                  </div>
                  {/* Live typography preview */}
                  <div className="mt-4 p-3 bg-surface-container-low rounded border border-[#C9CCCF]">
                    <p className="text-xs text-on-surface-variant mb-1">Live preview</p>
                    <div
                      style={buildFontVars(formData.typography)}
                      className="space-y-1"
                    >
                      <p style={{ fontFamily: 'var(--font-eb-garamond)', fontWeight: '500' }} className="font-headline-md">
                        Heading text sample
                      </p>
                      <p style={{ fontFamily: 'var(--font-manrope)', fontWeight: '400' }} className="font-body-md">
                        Body text sample
                      </p>
                    </div>
                  </div>
                </div>
              </SettingsCard>

              {/* Store Details */}
              <SettingsCard icon={Store} title="Store details">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Store name
                    </label>
                    <input
                      name="storeName"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      type="text"
                      value={formData.storeName}
                      onChange={handleInputChange}
                    />
                    {formErrors.storeName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.storeName}</p>
                    )}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Legal name of company
                    </label>
                    <input
                      name="legalName"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      type="text"
                      value={formData.legalName}
                      onChange={handleInputChange}
                    />
                    {formErrors.legalName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.legalName}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Store industry
                    </label>
                    <select
                      name="industry"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
                      value={formData.industry}
                      onChange={handleInputChange}
                    >
                      <option>Art & Crafts</option>
                      <option>Home & Garden</option>
                      <option>Fashion</option>
                      <option>Electronics</option>
                      <option>Food & Beverage</option>
                      <option>Health & Beauty</option>
                    </select>
                  </div>
                </div>
              </SettingsCard>

              {/* Contact Information */}
              <SettingsCard icon={Mail} title="Contact information">
                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Sender email
                    </label>
                    <input
                      name="senderEmail"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      type="email"
                      value={formData.senderEmail}
                      onChange={handleInputChange}
                    />
                    <p className="text-body-sm text-on-surface-variant mt-2 italic">
                      This is the email address your customers see when they receive emails from you.
                    </p>
                    {formErrors.senderEmail && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.senderEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Account email
                    </label>
                    <input
                      name="accountEmail"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      type="email"
                      value={formData.accountEmail}
                      onChange={handleInputChange}
                    />
                    <p className="text-body-sm text-on-surface-variant mt-2 italic">
                      We'll use this address if we need to contact you about your account.
                    </p>
                    {formErrors.accountEmail && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.accountEmail}</p>
                    )}
                  </div>
                </div>
              </SettingsCard>

              {/* Brand & Logo */}
              <SettingsCard icon={ImageIcon} title="Brand & logo">
                <div className="flex items-center gap-4">
                  <div className="w-40 h-24 border border-[#C9CCCF] rounded flex items-center justify-center overflow-hidden bg-surface-container-low">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="Store logo preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-on-surface-variant text-sm">No logo</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-4 py-2 text-body-md rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {uploadingLogo ? 'Uploading…' : 'Upload logo'}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="px-4 py-2 text-body-md rounded border border-[#C9CCCF] text-on-surface-variant hover:bg-surface-container-high transition-colors"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      PNG, JPG or WebP. Recommended 200×60px, under 5MB.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block font-label-md text-on-surface-variant mb-2">
                    Logo alt text
                  </label>
                  <input
                    name="logoAlt"
                    className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                    type="text"
                    value={formData.logoAlt}
                    onChange={handleInputChange}
                  />
                </div>
              </SettingsCard>

              {/* Regional Settings */}
              <SettingsCard icon={Globe} title="Regional settings">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Time zone
                    </label>
                    <select
                      name="timezone"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
                      value={formData.timezone}
                      onChange={handleInputChange}
                    >
                      <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                      <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                      <option>(GMT+00:00) London</option>
                      <option>(GMT+01:00) Central European Time</option>
                      <option>(GMT+05:00) Pakistan Standard Time</option>
                      <option>(GMT+08:00) Singapore Time</option>
                    </select>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Unit system
                    </label>
                    <select
                      name="unitSystem"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
                      value={formData.unitSystem}
                      onChange={handleInputChange}
                    >
                      <option>Metric system (kg, cm, etc.)</option>
                      <option>Imperial system (lb, in, etc.)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block font-label-md text-on-surface-variant mb-2">
                      Order ID format
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        name="orderPrefix"
                        className="w-24 px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                        placeholder="Prefix"
                        type="text"
                        value={formData.orderPrefix}
                        onChange={handleInputChange}
                      />
                      <span className="text-on-surface-variant font-bold">1001</span>
                      <input
                        name="orderSuffix"
                        className="w-24 px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                        placeholder="Suffix"
                        type="text"
                        value={formData.orderSuffix}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="text-body-sm text-on-surface-variant mt-2 italic">
                      Example: #ZAR-1001. Used to identify orders for you and your customers.
                    </p>
                  </div>
                </div>
              </SettingsCard>

              {/* Color Palette */}
              <SettingsCard icon={Palette} title="Color palette">
                <div className="space-y-4">
                  {/* Base color controls (primary, secondary, etc.) — these drive the whole palette */}
                  <div>
                    <p className="font-label-md text-on-surface-variant mb-2">
                      Theme base colors — change these to update buttons, surfaces, text across the storefront
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Primary (buttons, links)</label>
                        <input
                          type="color"
                          value={baseControls.primary}
                          onChange={(e) => handleBaseControlChange('primary', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Secondary</label>
                        <input
                          type="color"
                          value={baseControls.secondary}
                          onChange={(e) => handleBaseControlChange('secondary', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Tertiary</label>
                        <input
                          type="color"
                          value={baseControls.tertiary}
                          onChange={(e) => handleBaseControlChange('tertiary', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Error</label>
                        <input
                          type="color"
                          value={baseControls.error}
                          onChange={(e) => handleBaseControlChange('error', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Page background</label>
                        <input
                          type="color"
                          value={baseControls.background}
                          onChange={(e) => handleBaseControlChange('background', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Surface (cards)</label>
                        <input
                          type="color"
                          value={baseControls.surface}
                          onChange={(e) => handleBaseControlChange('surface', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Text (on-surface)</label>
                        <input
                          type="color"
                          value={baseControls.onSurface}
                          onChange={(e) => handleBaseControlChange('onSurface', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-on-surface-variant mb-1">Outline / borders</label>
                        <input
                          type="color"
                          value={baseControls.outline}
                          onChange={(e) => handleBaseControlChange('outline', e.target.value)}
                          className="w-full h-10 rounded border border-[#C9CCCF] p-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Presets — quick starting points */}
                  <div>
                    <p className="font-label-md text-on-surface-variant mb-2">
                      Or choose a preset palette
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {THEME_PRESETS.map(preset => {
                        const isBaseline = preset.baseline;
                        const primaryHex = presetPrimaryHex(preset);
                        return (
                          <button
                            key={preset.name}
                            onClick={() => {
                              if (isBaseline) {
                                setFormData(prev => ({ ...prev, theme: null }));
                              } else {
                                setFormData(prev => ({ ...prev, theme: buildPreset(preset.anchors) }));
                              }
                            }}
                            className={`relative aspect-square rounded border border-[#C9CCCF] hover:border-primary/50 transition-colors cursor-pointer ${
                              (isBaseline && !formData.theme) ||
                              (!isBaseline && formData.theme &&
                               Object.keys(formData.theme || {}).length > 0 &&
                               JSON.stringify(formData.theme) === JSON.stringify(buildPreset(preset.anchors)))
                                ? 'border-primary ring-2 ring-primary/20'
                                : ''
                            }`}
                          >
                            <div style={{ background: primaryHex }} className="absolute inset-0 opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-on-surface">
                              {preset.label}
                            </div>
                            <div style={{ background: primaryHex }} className="absolute bottom-0 left-0 h-2 w-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced per-token editor */}
                  <div className="flex items-center justify-between">
                    <p className="font-label-md text-on-surface-variant mb-0">
                      Advanced: customize individual tokens
                    </p>
                    <button
                      onClick={() => setShowCustomize(!showCustomize)}
                      className={`text-body-sm text-on-surface-variant hover:text-primary transition-colors ${
                        showCustomize ? 'font-medium' : ''
                      }`}
                    >
                      {showCustomize ? 'Hide advanced' : 'Advanced editor'}
                    </button>
                  </div>

                  {showCustomize && (
                    <>
                      <div className="space-y-3">
                        {THEME_GROUPS.map(group => (
                          <div key={group}>
                            <p className="font-label-sm text-on-surface-variant/70 mb-1">{group}</p>
                            <div className="grid grid-cols-3 gap-2">
                              {THEME_TOKENS
                                .filter(t => t.group === group)
                                .map(token => {
                                  const currentValue = (formData.theme || resolvePalette())[token.key] || '#000000';
                                  return (
                                    <div key={token.key}>
                                      <label className="block text-xs text-on-surface-variant mb-1">
                                        {token.label}
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="color"
                                          value={currentValue}
                                          onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({
                                              ...prev,
                                              theme: {
                                                ...(prev.theme || resolvePalette()),
                                                [token.key]: value
                                              }
                                            }));
                                          }}
                                          className="w-full h-10 rounded border border-[#C9CCCF] focus:border-primary focus:ring-2 focus:ring-primary/10 p-0"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-xs">
                                          {currentValue}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Live preview — updates instantly as you edit */}
                  <div className="mt-4 p-3 bg-surface-container-low rounded border border-[#C9CCCF]">
                    <p className="text-xs text-on-surface-variant mb-1">Live preview (updates instantly)</p>
                    <div
                      style={{
                        ...buildThemeVars(formData.theme),
                        ...buildFontVars(formData.typography)
                      }}
                      className="space-y-2 p-3 bg-surface rounded border border-[#C9CCCF]"
                    >
                      {/* Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-1 text-xs rounded bg-primary text-white hover:bg-primary/90">
                          Primary button
                        </button>
                        <button className="px-3 py-1 text-xs rounded bg-secondary text-white hover:bg-secondary/90">
                          Secondary button
                        </button>
                        <button className="px-3 py-1 text-xs rounded bg-tertiary text-white hover:bg-tertiary/90">
                          Tertiary button
                        </button>
                        <button className="px-3 py-1 text-xs rounded bg-error text-white hover:bg-error/90">
                          Error button
                        </button>
                        <button className="px-3 py-1 text-xs rounded bg-surface text-on-surface border border-[#C9CCCF] hover:bg-surface-container-high">
                          Outlined
                        </button>
                      </div>
                      {/* Card */}
                      <div className="p-3 bg-surface rounded border border-[#C9CCCF]">
                        <p className="font-body-md text-on-surface mb-1">Card title</p>
                        <p className="text-xs text-on-surface-variant">
                          This is a sample card showing surface and text colors.
                        </p>
                      </div>
                      {/* Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Sample input"
                          className="flex-1 px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                        <button className="px-3 py-2 text-xs rounded bg-primary text-white hover:bg-primary/90">
                          Go
                        </button>
                      </div>
                      {/* Text */}
                      <div className="space-y-1">
                        <p className="font-headline-md text-on-surface">
                          Heading
                        </p>
                        <p className="font-body-md text-on-surface">
                          Body text
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-primary text-white">
                          Tag
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-error text-white">
                          Error
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* Right Column (4 columns) */}
            <div className="col-span-12 md:col-span-4 space-y-6">
              <div className="bg-white border border-[#E1E3E5] rounded-lg p-3 md:p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="text-primary w-5 h-5" />
                  <h3 className="font-headline-md text-headline-md">Store address</h3>
                </div>

                {/* Map Preview */}
                <div className="mb-6 rounded-lg overflow-hidden border border-[#C9CCCF] h-40 bg-surface-container-low relative group">
                  <Image
                    className="object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiIZG5oiwS9D2FfIHyqOf9g7jHrI98RCuLExOsotuGuG33IU34bip09n0vKja5sLCEn-UM6a_JAqoNGeVQBzLVlwD_ETNgs37kr4Oemg-OjjXXwP8pqVOHWQW7WRXXp7JVjgGykuwSesEX7eT6wJDsjBM_A1CdRRuPnk8uu7q7KHygaxiaYcmeo5Q7rZQVH1XC_4ncMxQ4QHS0-FQsgFizr7VFIGwROHLqmTHUUIYl9HyOb5HkQlYGKux-IxWJUtuH-44QADhjfLWQ"
                    alt="Map showing the store's physical location"
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                  <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors pointer-events-none"></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">
                      Address
                    </label>
                    <input
                      name="address"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">
                      Apartment, suite, etc.
                    </label>
                    <input
                      name="apartment"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="Optional"
                      type="text"
                      value={formData.apartment}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label-md text-on-surface-variant mb-1">
                        City
                      </label>
                      <input
                        name="city"
                        className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-on-surface-variant mb-1">
                        ZIP code
                      </label>
                      <input
                        name="zipCode"
                        className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">
                      Country/region
                    </label>
                    <select
                      name="country"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all bg-white"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      <option>Pakistan</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Germany</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#E1E3E5]">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-dashed border-[#C9CCCF]">
                    <HelpCircle className="text-secondary w-5 h-5 flex-shrink-0" />
                    <p className="text-body-sm text-on-surface-variant leading-tight">
                      Your address is used for billing and shipping calculations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validation / general errors */}
          {Object.keys(formErrors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              {Object.values(formErrors).map((msg, i) => (
                <p key={i} className="mb-1 text-sm text-red-600">{msg}</p>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default GeneralSettingsPage;