// app/settings/general/page.jsx
'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

// Components
import Header from '../../../../_components/Admin/Header';
import Sidebar from '../../../../_components/Admin/Sidebar';
import Button from '../../../../_components/Admin/Button';

// Settings Card Component
const SettingsCard = ({ icon: Icon, title, children, className = '' }) => {
  return (
    <div className={`bg-white border border-[#E1E3E5] rounded-lg p-6 hover:shadow-[0px_1px_3px_rgba(0,0,0,0.05)] transition-shadow ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Icon className="text-primary w-5 h-5" />
        <h3 className="font-headline-md text-headline-md">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// Main Settings Page
const GeneralSettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'

  // Form state
  const [formData, setFormData] = useState({
    storeName: 'The Artisan Collective',
    legalName: 'Artisan Collective Retail Group LLC',
    industry: 'Art & Crafts',
    senderEmail: 'hello@artisan-collective.com',
    accountEmail: 'alex.rivera@artisan-collective.com',
    timezone: '(GMT-05:00) Eastern Time (US & Canada)',
    unitSystem: 'Metric system (kg, cm, etc.)',
    orderPrefix: '#ART-',
    orderSuffix: '',
    address: '742 Evergreen Terrace',
    apartment: '',
    city: 'Springfield',
    zipCode: '62704',
    country: 'United States',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save logic here
      console.log('Saving settings:', formData);
      
      setSaveStatus('saved');
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setIsSaving(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('idle');
      setIsSaving(false);
    }
  };

 

  return (
    <>
      <Sidebar />
      <Header />

      {/* Main Content */}
      <main className="ml-[240px] mt-16 p-8 bg-[#f6fafe] min-h-screen">
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
                disabled={isSaving}
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

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column (8 columns) */}
            <div className="col-span-12 md:col-span-8 space-y-6">
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
                  </div>
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
                      Example: #ART-1001. Used to identify orders for you and your customers.
                    </p>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* Right Column (4 columns) */}
            <div className="col-span-12 md:col-span-4 space-y-6">
              <div className="bg-white border border-[#E1E3E5] rounded-lg p-6 sticky top-6">
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

         
        </div>
      </main>
    </>
  );
};

export default GeneralSettingsPage;