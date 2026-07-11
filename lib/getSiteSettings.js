import { unstable_cache } from 'next/cache';
import { publicClient } from './sanityClientPublic';

const DEFAULT_SETTINGS = {
  storeName: 'Zaragems',
  legalName: 'Zaragems Fashion House',
  industry: 'Fashion',
  senderEmail: 'hello@zaragems.com',
  accountEmail: 'info@zaragems.com',
  timezone: '(GMT+05:00) Pakistan Standard Time',
  unitSystem: 'Metric system (kg, cm, etc.)',
  orderPrefix: '#ZAR-',
  orderSuffix: '',
  address: '',
  apartment: '',
  city: '',
  zipCode: '',
  country: 'Pakistan',
  logo: null,
  logoUrl: null,
  logoAlt: '',
  typography: null,
  theme: null,
};

// Cached fetcher for storefront settings. Wrapped in unstable_cache so reads are
// served from the Next.js data cache (tagged 'site-settings') and we also lean on
// the Sanity CDN (publicClient.useCdn = true). The admin PUT handler calls
// revalidateTag('site-settings') to purge this on every save.
export const getSiteSettings = unstable_cache(
  async () => {
    try {
      const settings = await publicClient.fetch(
        `*[_type == "siteSettings"][0]{
          ...,
          "logoUrl": select(logo.asset._ref != null => logo.asset->url),
          "logoAlt": coalesce(logo.alt, "")
        }`
      );
      return settings || DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error fetching site settings:', error);
      return DEFAULT_SETTINGS;
    }
  },
  ['site-settings'],
  { revalidate: 300, tags: ['site-settings'] }
);
