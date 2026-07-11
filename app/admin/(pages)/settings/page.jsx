import { redirect } from 'next/navigation';

// The settings index doesn't render its own screen — drop the admin on the
// default tab (General) so "Settings" always opens there.
export default function SettingsIndex() {
  redirect('/admin/settings/general');
}
