'use client';

import { createContext, useContext } from 'react';

const NavMenuContext = createContext(null);

// Populated server-side (see app/layout.jsx) so the real nav items are
// present in the very first render — no client fetch, no fallback flash.
export function NavMenuProvider({ items, children }) {
  return (
    <NavMenuContext.Provider value={items}>
      {children}
    </NavMenuContext.Provider>
  );
}

export function useNavMenu() {
  const items = useContext(NavMenuContext);
  if (!items) {
    throw new Error('useNavMenu must be used within a NavMenuProvider');
  }
  return items;
}
