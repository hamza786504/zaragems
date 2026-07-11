// app/_components/Admin/SettingsSubNav.jsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import { adminSettingsNavItems, SETTINGS_EXIT_HREF } from './adminNav';

// Rendered inside the sidebar (desktop + mobile drawer) whenever the admin is on a
// /admin/settings/* route. First item is always "Return to menu"; the rest come
// from adminSettingsNavItems and can be extended freely.
//   variant: 'desktop' | 'mobile'  — matches the surrounding nav's styling.
//   onNavigate: called before navigating (e.g. close the mobile drawer).
export default function SettingsSubNav({ variant = 'desktop', onNavigate } = {}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

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

  return (
    <ul className="space-y-base">
      {/* 1st item — exit the Settings section back to the main menu */}
      <li>
        <button type="button" onClick={handleReturn} className={s.returnItem}>
          <MdArrowBack size={20} />
          <span className="font-body-md text-body-md">Return to menu</span>
        </button>
      </li>

      {/* Section label */}
      <li className={s.section}>
        <span className="text-xs uppercase tracking-wider text-on-surface-variant/70 font-semibold">
          Settings
        </span>
      </li>

      {/* Settings sub-routes (General, Menus, …) */}
      {adminSettingsNavItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={active ? s.active : s.inactive}
            >
              <Icon size={20} />
              <span className="font-body-md text-body-md">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
