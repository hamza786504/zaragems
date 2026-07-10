'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { adminNavItems } from './adminNav';

function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
         {/* SideNavBar — desktop only (hidden on mobile, revealed via the hamburger drawer in Header) */}
      <aside className="hidden lg:flex w-60 h-screen fixed left-0 top-0 bg-surface-container-low dark:bg-surface-container-lowest border-r border-outline-variant flex-col z-50">
        <div className="p-lg">
          <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
            Merchant Admin
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Manage your store
          </p>
        </div>
        
        <nav className="flex-1 px-sm">
          <ul className="space-y-base">
            {adminNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href} className={item.isSettings ? 'pt-lg' : ''}>
                  <Link
                    href={item.href}
                    className={
                      active
                        ? 'flex items-center gap-md text-primary font-bold bg-primary-container/10 border-r-4 border-primary px-4 py-3 transition-all duration-200 ease-in-out'
                        : 'flex items-center gap-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-4 py-3 transition-colors'
                    }
                  >
                    <Icon size={20} />
                    <span className="font-body-md text-body-md">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-lg mt-auto border-t border-outline-variant flex items-center gap-md">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">
            M
          </div>
          <div className="overflow-hidden">
            <p className="font-label-md text-label-md font-bold truncate text-on-surface">
              Modern Store
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Premium Account
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar