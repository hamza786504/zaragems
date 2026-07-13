import {
  MdHome,
  MdShoppingCart,
  MdInventory,
  MdFolderOpen,
  MdGroup,
  MdRateReview,
  MdAnalytics,
  MdSettings,
  MdNotifications,
  MdTune,
  MdMenu,
  MdLocalShipping,
} from 'react-icons/md';

// Single source of truth for admin navigation.
// Used by both the desktop sidebar (Sidebar.jsx) and the mobile drawer (Header.jsx).
export const adminNavItems = [
  { href: '/admin', label: 'Home', icon: MdHome },
  { href: '/admin/orders', label: 'Orders', icon: MdShoppingCart },
  { href: '/admin/products', label: 'Products', icon: MdInventory },
  { href: '/admin/collections', label: 'Collections', icon: MdFolderOpen },
  { href: '/admin/customers', label: 'Customers', icon: MdGroup },
  { href: '/admin/reviews', label: 'Reviews', icon: MdRateReview },
  { href: '/admin/analytics', label: 'Analytics', icon: MdAnalytics },
  { href: '/admin/notifications', label: 'Notifications', icon: MdNotifications },
  { href: '/admin/settings', label: 'Settings', icon: MdSettings, isSettings: true },
];

// Settings sub-navigation — shown inside the sidebar while the admin is on any
// /admin/settings/* route. To add a new settings tab later, create its folder
// under app/admin/(pages)/settings/ and append one entry here. It will appear
// automatically, in order, after "Return to menu".
export const adminSettingsNavItems = [
  { href: '/admin/settings/general', label: 'General', icon: MdTune },
  { href: '/admin/settings/menu', label: 'Menus', icon: MdMenu },
  { href: '/admin/settings/shipping', label: 'Shipping', icon: MdLocalShipping },
];

// Where "Settings" drops the admin on first open (and the default tab).
export const SETTINGS_DEFAULT_HREF = '/admin/settings/general';

// Where "Return to menu" sends the admin back to (the main menu).
export const SETTINGS_EXIT_HREF = '/admin';
