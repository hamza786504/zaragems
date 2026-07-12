'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { adminNavItems, SETTINGS_DEFAULT_HREF } from './adminNav';
import SettingsSubNav from './SettingsSubNav';
import Image from 'next/image';
import { useSiteSettings } from '../../store/siteSettingsContext';

function Sidebar() {
  const pathname = usePathname();
    const settings = useSiteSettings();
    const logoSrc = settings?.logoUrl || '/logo.png';
    const storeName = settings?.storeName || 'Zaragems';

  // While on any /admin/settings/* route we reveal the Settings sub-menu
  // instead of the main nav (with a cross-slide animation).
  const inSettings = pathname.startsWith('/admin/settings');

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  // Separate settings from other nav items
  const mainNavItems = adminNavItems.filter(item => !item.isSettings);
  const settingsItem = adminNavItems.find(item => item.isSettings);

  const activeClass =
    'flex items-center gap-md text-primary font-bold bg-primary-container/10 border-r-4 border-primary px-4 py-3 transition-all duration-200 ease-in-out';
  const inactiveClass =
    'flex items-center gap-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-4 py-3 transition-colors';

  return (
    <>
      {/* SideNavBar — desktop only (hidden on mobile, revealed via the hamburger drawer in Header) */}
      <aside className="hidden lg:flex w-60 h-screen fixed left-0 top-0 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant flex-col z-50">
        <div className="p-lg">
          <Image src={logoSrc} width="80" height="40" alt={storeName}  />
        </div>

        {/* Nav area — two stacked layers that cross-slide when toggling the
            Settings section. The outer container clips the horizontal motion so
            it reads as the menu hiding and the Settings menu revealing. */}
        <div className="relative flex-1 overflow-hidden">
          {/* Main menu layer */}
          <div
            className={
              'absolute inset-0 flex flex-col transition-all duration-300 ease-in-out ' +
              (inSettings
                ? 'opacity-0 -translate-x-6 pointer-events-none'
                : 'opacity-100 translate-x-0')
            }
          >
            <nav className="flex-1 px-sm py-2 overflow-y-auto">
              <ul className="space-y-base">
                {mainNavItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} className={active ? activeClass : inactiveClass}>
                        <Icon size={20} />
                        <span className="font-body-md text-body-md">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Settings — pinned at the bottom of the main menu */}
            {settingsItem && (
              <div className="px-sm py-3 border-t border-outline-variant bg-surface-container-low dark:bg-surface-container-lowest">
                {(() => {
                  const active = isActive(SETTINGS_DEFAULT_HREF);
                  const Icon = settingsItem.icon;
                  return (
                    <Link
                      href={SETTINGS_DEFAULT_HREF}
                      className={active ? activeClass : inactiveClass}
                    >
                      <Icon size={20} />
                      <span className="font-body-md text-body-md">{settingsItem.label}</span>
                    </Link>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Settings sub-menu layer */}
          <div
            className={
              'absolute inset-0 transition-all duration-300 ease-in-out ' +
              (inSettings
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-6 pointer-events-none')
            }
          >
            <nav className="h-full px-sm py-2 overflow-y-auto">
              <SettingsSubNav variant="desktop" />
            </nav>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
