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
