import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import client from '@/lib/sanityClient';
import { withTimestamps } from '@/lib/sanityHelpers';
import { verifyAdminToken } from '@/lib/auth';

// Fields we allow admins to edit (whitelist — everything else is ignored)
const EDITABLE_FIELDS = [
  'storeName',
  'legalName',
  'industry',
  'senderEmail',
  'accountEmail',
  'timezone',
  'unitSystem',
  'orderPrefix',
  'orderSuffix',
  'address',
  'apartment',
  'city',
  'zipCode',
  'country',
  'logo',
  'logoAlt',
  'typography',
  'theme',
  'shipping',
];

// GROQ projection that returns a stable, cacheable shape for the storefront.
// `logoUrl` is dereferenced so the public client never needs a second query.
const SETTINGS_PROJECTION = `{
  ...,
  "logoUrl": select(logo.asset._ref != null => logo.asset->url),
  "logoAlt": coalesce(logo.alt, ""),
  "createdAt": _createdAt,
  "updatedAt": _updatedAt
}`;

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
  typography: { headingFont: 'EB Garamond', bodyFont: 'Manrope' },
  theme: null,
  shipping: {
    cod: true,
    bankDeposit: false,
    bankDetails: { accountTitle: '', accountNumber: '', bankName: '', iban: '' },
    standardCharge: 250,
    freeShippingThreshold: 10000,
  },
};

// GET /api/settings/general — public read used by the storefront (cached via CDN + ISR)
export async function GET() {
  try {
    const settings = await client.fetch(`*[_type == "siteSettings"][0] ${SETTINGS_PROJECTION}`);

    if (!settings) {
      return NextResponse.json({ success: true, settings: DEFAULT_SETTINGS });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/settings/general — admin-only update
export async function PUT(request) {
  try {
    const authResult = verifyAdminToken(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();

    // Whitelist + sanitize incoming fields
    const patchData = {};
    for (const field of EDITABLE_FIELDS) {
      if (field in body) patchData[field] = body[field];
    }

    const existing = await client.fetch(`*[_type == "siteSettings"][0]{ _id }`);
    let settings;

    if (existing) {
      settings = await client.patch(existing._id).set(patchData).commit({ autoGenerateArrayKeys: true });
    } else {
      settings = await client.create({ _type: 'siteSettings', ...patchData });
    }

    // Purge caches so the new logo/name show up on the storefront immediately.
    revalidateTag('site-settings');

    // Return the same projected shape as GET
    const refetched = await client.fetch(
      `*[_type == "siteSettings" && _id == $id][0] ${SETTINGS_PROJECTION}`,
      { id: settings._id }
    );

    return NextResponse.json({ success: true, settings: refetched });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
