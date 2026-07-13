// Layout for the (auth) route group.
//
// Only login and register live here now, and they intentionally render WITHOUT
// the site Navbar or the account Sidebar (they are standalone auth screens).
// Customer account pages were moved to the (account) group, which provides the
// Navbar + reusable Sidebar chrome via its own layout.
export default function AuthLayout({ children }) {
    return <>{children}</>;
}
