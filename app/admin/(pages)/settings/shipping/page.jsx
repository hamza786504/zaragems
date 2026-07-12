'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, Building2, Check, Loader2, Info } from 'lucide-react';
import Button from '../../../../_components/Admin/Button';

const DEFAULT_SHIPPING = {
  cod: true,
  bankDeposit: false,
  bankDetails: { accountTitle: '', accountNumber: '', bankName: '', iban: '' },
  standardCharge: 250,
  freeShippingThreshold: 10000,
};

const SettingsCard = ({ icon: Icon, title, subtitle, children }) => (
  <div className="bg-white border border-[#E1E3E5] rounded-lg p-4 md:p-6">
    <div className="flex items-start gap-3 mb-6">
      <Icon className="text-primary w-5 h-5 mt-0.5 shrink-0" />
      <div>
        <h3 className="font-headline-md text-headline-md leading-tight">{title}</h3>
        {subtitle && <p className="text-body-sm text-on-surface-variant mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

export default function ShippingSettingsPage() {
  const [shipping, setShipping] = useState(DEFAULT_SHIPPING);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/settings/general', { credentials: 'include' });
        const data = await res.json();
        if (data.success && data.settings?.shipping) {
          setShipping({ ...DEFAULT_SHIPPING, ...data.settings.shipping });
        }
      } catch (err) {
        console.error('Error loading shipping settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/settings/general', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ shipping }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        alert('Failed to save: ' + data.error);
        setSaveStatus('idle');
      }
    } catch (err) {
      alert('Network error: ' + err.message);
      setSaveStatus('idle');
    }
  };

  const setBank = (field, value) =>
    setShipping(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));

  const atLeastOneMethod = shipping.cod || shipping.bankDeposit;

  return (
    <main className="p-0 md:p-8 min-h-screen">
      <div className="max-w-[900px] mx-auto">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-headline-lg font-headline-lg text-on-surface">Shipping Settings</h2>
            <p className="text-body-md text-on-surface-variant mt-1">
              Configure payment methods, delivery charges, and free shipping rules.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || isLoading || !atLeastOneMethod}
            icon={
              saveStatus === 'saving'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : saveStatus === 'saved'
                ? <Check className="w-4 h-4" />
                : null
            }
          >
            {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-on-surface-variant py-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading shipping settings…</span>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Payment Methods ─────────────────────────────────────────── */}
            <SettingsCard
              icon={CreditCard}
              title="Payment Methods"
              subtitle="Choose which payment methods customers can use at checkout."
            >
              <div className="space-y-4">
                {!atLeastOneMethod && (
                  <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-lg text-error text-body-sm">
                    <Info className="w-4 h-4 shrink-0" />
                    At least one payment method must be enabled.
                  </div>
                )}

                {/* Cash on Delivery */}
                <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  shipping.cod ? 'border-primary bg-primary/5' : 'border-[#E1E3E5] hover:border-primary/30'
                }`}>
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 text-primary focus:ring-primary rounded"
                    checked={shipping.cod}
                    onChange={e => setShipping(prev => ({ ...prev, cod: e.target.checked }))}
                  />
                  <div className="flex-1">
                    <p className="font-label-md text-on-surface">Cash on Delivery (COD)</p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Customer pays in cash when the order is delivered to their door.
                    </p>
                  </div>
                  {shipping.cod && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  )}
                </label>

                {/* Bank Deposit */}
                <label className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  shipping.bankDeposit ? 'border-primary bg-primary/5' : 'border-[#E1E3E5] hover:border-primary/30'
                }`}>
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 text-primary focus:ring-primary rounded"
                    checked={shipping.bankDeposit}
                    onChange={e => setShipping(prev => ({ ...prev, bankDeposit: e.target.checked }))}
                  />
                  <div className="flex-1">
                    <p className="font-label-md text-on-surface">Bank Deposit</p>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">
                      Customer deposits to your bank account. Orders are fulfilled only after payment is confirmed.
                    </p>
                  </div>
                  {shipping.bankDeposit && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                      <Check className="w-3 h-3" /> Enabled
                    </span>
                  )}
                </label>
              </div>
            </SettingsCard>

            {/* ── Bank Account Details (shown only when Bank Deposit is on) ── */}
            {shipping.bankDeposit && (
              <SettingsCard
                icon={Building2}
                title="Bank Account Details"
                subtitle="These details will be shown to the customer at checkout when they select Bank Deposit."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1.5">Account Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="e.g. Zaragems Fashion House"
                      value={shipping.bankDetails.accountTitle}
                      onChange={e => setBank('accountTitle', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1.5">Account Number</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="e.g. 0123456789"
                      value={shipping.bankDetails.accountNumber}
                      onChange={e => setBank('accountNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1.5">Bank Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="e.g. Meezan Bank"
                      value={shipping.bankDetails.bankName}
                      onChange={e => setBank('bankName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1.5">
                      IBAN <span className="text-on-surface-variant/60 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      placeholder="e.g. PK36SCBL0000001123456702"
                      value={shipping.bankDetails.iban}
                      onChange={e => setBank('iban', e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 p-3 bg-surface-container-low rounded-lg text-body-sm text-on-surface-variant">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  Orders paid via Bank Deposit stay <strong className="text-on-surface">Unfulfilled</strong> until you manually confirm payment and fulfil the order.
                </div>
              </SettingsCard>
            )}

            {/* ── Delivery Charges ─────────────────────────────────────────── */}
            <SettingsCard
              icon={Truck}
              title="Delivery Charges"
              subtitle="Set shipping costs shown at checkout. Free shipping triggers automatically when the order total meets the threshold."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1.5">
                    Standard Shipping <span className="text-on-surface-variant/60 font-normal">(PKR)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full pl-10 pr-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      value={shipping.standardCharge}
                      onChange={e => setShipping(prev => ({ ...prev, standardCharge: Number(e.target.value) }))}
                    />
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-1">3–5 business days</p>
                </div>

                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1.5">
                    Free Shipping Above <span className="text-on-surface-variant/60 font-normal">(PKR)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      className="w-full pl-10 pr-3 py-2 text-body-md border border-[#C9CCCF] rounded focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                      value={shipping.freeShippingThreshold}
                      onChange={e => setShipping(prev => ({ ...prev, freeShippingThreshold: Number(e.target.value) }))}
                    />
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-1">Set to 0 to disable free shipping</p>
                </div>
              </div>

              {/* Live preview */}
              <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-[#E1E3E5] space-y-2">
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Preview (what customer sees)</p>
                <div className="flex justify-between text-body-md">
                  <span>Standard Shipping (3–5 days)</span>
                  <span className="font-semibold text-primary">Rs. {shipping.standardCharge.toLocaleString()}</span>
                </div>
                {shipping.freeShippingThreshold > 0 && (
                  <div className="flex justify-between text-body-md border-t border-[#E1E3E5] pt-2 mt-2">
                    <span className="text-on-surface-variant">Free shipping on orders above</span>
                    <span className="font-semibold text-primary">Rs. {shipping.freeShippingThreshold.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </SettingsCard>

          </div>
        )}
      </div>
    </main>
  );
}
