'use client';

import { createContext, useContext } from 'react';

const SiteSettingsContext = createContext(null);

// Populated server-side (see app/(public_pages)/layout.jsx) so the real store
// name + logo are present in the very first render — no client fetch, no flash.
export function SiteSettingsProvider({ settings, children }) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
