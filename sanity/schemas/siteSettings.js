import { defineField, defineType } from 'sanity';

// Drop this file into your Sanity Studio `schemas/` folder and add `siteSettings`
// to your `schemaTypes` array (usually in sanity.config.ts / schema.js).
//
// Without this type registered in the Studio, the /api/settings/general PUT
// (and the seed route) will be rejected by Sanity with "unknown document type".
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton: only ever one document of this type.
  fields: [
    defineField({ name: 'storeName', title: 'Store name', type: 'string' }),
    defineField({ name: 'legalName', title: 'Legal name of company', type: 'string' }),
    defineField({
      name: 'industry',
      title: 'Store industry',
      type: 'string',
      options: {
        list: ['Art & Crafts', 'Home & Garden', 'Fashion', 'Electronics', 'Food & Beverage', 'Health & Beauty'],
      },
    }),
    defineField({ name: 'senderEmail', title: 'Sender email', type: 'string' }),
    defineField({ name: 'accountEmail', title: 'Account email', type: 'string' }),
    defineField({ name: 'timezone', title: 'Time zone', type: 'string' }),
    defineField({ name: 'unitSystem', title: 'Unit system', type: 'string' }),
    defineField({ name: 'orderPrefix', title: 'Order ID prefix', type: 'string' }),
    defineField({ name: 'orderSuffix', title: 'Order ID suffix', type: 'string' }),
    defineField({ name: 'address', title: 'Address', type: 'string' }),
    defineField({ name: 'apartment', title: 'Apartment, suite, etc.', type: 'string' }),
    defineField({ name: 'city', title: 'City', type: 'string' }),
    defineField({ name: 'zipCode', title: 'ZIP code', type: 'string' }),
    defineField({ name: 'country', title: 'Country/region', type: 'string' }),
    defineField({
      name: 'logo',
      title: 'Store logo',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt text', type: 'string' }],
    }),
    defineField({ name: 'logoAlt', title: 'Logo alt text (plaintext fallback)', type: 'string' }),
    defineField({
      name: 'typography',
      title: 'Typography',
      type: 'object',
      description: 'Storefront heading + body fonts. Managed from the admin General tab.',
      fields: [
        defineField({ name: 'headingFont', title: 'Heading font', type: 'string' }),
        defineField({ name: 'bodyFont', title: 'Body font', type: 'string' }),
      ],
    }),
    defineField({
      name: 'theme',
      title: 'Color palette (theme)',
      type: 'object',
      description: 'Storefront color token → hex map. Managed from the admin General tab.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
