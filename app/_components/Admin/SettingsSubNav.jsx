// app/_components/Admin/SettingsSubNav.jsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdArrowBack, MdChevronRight, MdExpandMore } from 'react-icons/md';
import { useState } from 'react';
import { adminSettingsNavItems, SETTINGS_EXIT_HREF } from './adminNav';

export default function SettingsSubNav({ variant = 'desktop', onNavigate } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [openItems, setOpenItems] = useState({});

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  const toggleOpen = (label) => {
    setOpenItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleReturn = () => {
    if (onNavigate) onNavigate();
    router.push(SETTINGS_EXIT_HREF);
  };

  const s =
    variant === 'mobile'
      ? {
          active: 'flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold bg-primary-container/10 transition-colors',
          inactive: 'flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors',
          returnItem: 'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors text-left font-semibold',
          section: 'px-4 pt-2 pb-1',
        }
      : {
          active: 'flex items-center gap-md text-primary font-bold bg-primary-container/10 border-r-4 border-primary px-4 py-3 transition-all duration-200 ease-in-out',
          inactive: 'flex items-center gap-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-4 py-3 transition-colors',
          returnItem: 'w-full flex items-center gap-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-4 py-3 transition-colors text-left font-semibold',
          section: 'px-4 pt-2 pb-1',
        };

  const renderItem = (item) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems[item.label];

    return (
      <li key={item.href}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleOpen(item.label)}
              className={`${active ? s.active : s.inactive} w-full flex items-center justify-between`}
            >
              <div className="flex items-center gap-md">
                <Icon size={20} />
                <span className="font-body-md text-body-md">{item.label}</span>
              </div>
              {isOpen ? <MdExpandMore size={20} /> : <MdChevronRight size={20} />}
            </button>
            {isOpen && (
              <ul className="pl-6 space-y-1 mt-1">
                {item.children.map((child) => renderItem(child))}
              </ul>
            )}
          </div>
        ) : (
          <Link
            href={item.href}
            onClick={onNavigate}
            className={active ? s.active : s.inactive}
          >
            <Icon size={20} />
            <span className="font-body-md text-body-md">{item.label}</span>
          </Link>
        )}
      </li>
    );
  };

  return (
    <ul className="space-y-base">
      <li>
        <button type="button" onClick={handleReturn} className={s.returnItem}>
          <MdArrowBack size={20} />
          <span className="font-body-md text-body-md">Return to menu</span>
        </button>
      </li>
      <li className={s.section}>
        <span className="text-xs uppercase tracking-wider text-on-surface-variant/70 font-semibold">
          Settings
        </span>
      </li>
      {adminSettingsNavItems.map((item) => renderItem(item))}
    </ul>
  );
}
