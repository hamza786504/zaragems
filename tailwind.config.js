/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Every token maps to a CSS variable injected at runtime by buildThemeVars().
                // The fallback after the comma is the DEFAULT_PALETTE value so the site looks
                // correct when no custom theme has been saved yet.
                'primary':                      'var(--color-primary, #00654b)',
                'on-primary':                   'var(--color-on-primary, #ffffff)',
                'primary-container':            'var(--color-primary-container, #008060)',
                'on-primary-container':         'var(--color-on-primary-container, #d6ffeb)',
                'primary-fixed':                'var(--color-primary-fixed, #92f6cf)',
                'primary-fixed-dim':            'var(--color-primary-fixed-dim, #75d9b3)',
                'on-primary-fixed':             'var(--color-on-primary-fixed, #002116)',
                'on-primary-fixed-variant':     'var(--color-on-primary-fixed-variant, #00513c)',
                'inverse-primary':              'var(--color-inverse-primary, #75d9b3)',

                'secondary':                    'var(--color-secondary, #5d5e60)',
                'on-secondary':                 'var(--color-on-secondary, #ffffff)',
                'secondary-container':          'var(--color-secondary-container, #dfdfe0)',
                'on-secondary-container':       'var(--color-on-secondary-container, #616364)',
                'secondary-fixed':              'var(--color-secondary-fixed, #e2e2e3)',
                'secondary-fixed-dim':          'var(--color-secondary-fixed-dim, #c6c6c7)',
                'on-secondary-fixed':           'var(--color-on-secondary-fixed, #1a1c1d)',
                'on-secondary-fixed-variant':   'var(--color-on-secondary-fixed-variant, #454748)',

                'tertiary':                     'var(--color-tertiary, #8f3f37)',
                'on-tertiary':                  'var(--color-on-tertiary, #ffffff)',
                'tertiary-container':           'var(--color-tertiary-container, #ae564d)',
                'on-tertiary-container':        'var(--color-on-tertiary-container, #fff2f1)',
                'tertiary-fixed':               'var(--color-tertiary-fixed, #ffdad6)',
                'tertiary-fixed-dim':           'var(--color-tertiary-fixed-dim, #ffb4ab)',
                'on-tertiary-fixed':            'var(--color-on-tertiary-fixed, #3f0303)',
                'on-tertiary-fixed-variant':    'var(--color-on-tertiary-fixed-variant, #7a2e28)',

                'error':                        'var(--color-error, #ba1a1a)',
                'on-error':                     'var(--color-on-error, #ffffff)',
                'error-container':              'var(--color-error-container, #ffdad6)',
                'on-error-container':           'var(--color-on-error-container, #93000a)',

                'background':                   'var(--color-background, #f6fafe)',
                'on-background':                'var(--color-on-background, #181c1f)',
                'surface':                      'var(--color-surface, #f6fafe)',
                'on-surface':                   'var(--color-on-surface, #181c1f)',
                'surface-bright':               'var(--color-surface-bright, #f6fafe)',
                'surface-dim':                  'var(--color-surface-dim, #d7dadf)',
                'surface-variant':              'var(--color-surface-variant, #dfe3e7)',
                'on-surface-variant':           'var(--color-on-surface-variant, #3e4944)',
                'surface-tint':                 'var(--color-surface-tint, #006c50)',
                'inverse-surface':              'var(--color-inverse-surface, #2d3134)',
                'inverse-on-surface':           'var(--color-inverse-on-surface, #eef1f5)',

                'surface-container-lowest':     'var(--color-surface-container-lowest, #ffffff)',
                'surface-container-low':        'var(--color-surface-container-low, #f1f4f8)',
                'surface-container':            'var(--color-surface-container, #ebeef3)',
                'surface-container-high':       'var(--color-surface-container-high, #e5e8ed)',
                'surface-container-highest':    'var(--color-surface-container-highest, #dfe3e7)',

                'outline':                      'var(--color-outline, #6e7a73)',
                'outline-variant':              'var(--color-outline-variant, #bdc9c2)',
            },

            borderRadius: {
                DEFAULT: '0.125rem',
                lg: '0.25rem',
                xl: '0.5rem',
                full: '0.75rem',
            },
            spacing: {
                // From the second config
                'margin-mobile': '20px',
                unit: '8px',
                'container-max': '1280px',
                'stack-sm': '12px',
                'margin-desktop': '64px',
                'stack-lg': '40px',
                gutter: '24px',
                'stack-md': '24px',
                
                // From the first config (dashboard)
                'gutter': '16px',
                'margin-desktop': '32px',
                'xl': '32px',
                'md': '16px',
                'base': '4px',
                'sm': '8px',
                'xs': '4px',
                'margin-mobile': '16px',
                'lg': '24px'
            },
            fontFamily: {
                // Heading font: maps to --font-eb-garamond which next/font sets to EB Garamond by
                // default. The public layout overrides it to whatever the admin picked via buildFontVars().
                'display-lg-mobile': ['var(--font-eb-garamond)', 'serif'],
                'headline-sm':        ['var(--font-eb-garamond)', 'serif'],
                'headline-md':        ['var(--font-eb-garamond)', 'serif'],
                'display-lg':         ['var(--font-eb-garamond)', 'serif'],

                // Body font: maps to --font-manrope (same runtime-override approach)
                'body-sm':    ['var(--font-manrope)', 'sans-serif'],
                'body-md':    ['var(--font-manrope)', 'sans-serif'],
                'body-lg':    ['var(--font-manrope)', 'sans-serif'],
                'label-sm':   ['var(--font-manrope)', 'sans-serif'],
                'label-md':   ['var(--font-manrope)', 'sans-serif'],

                // Admin-only sizes that have no storefront equivalent — use Inter directly.
                // The admin panel wraps content in .admin-layout { font-family: var(--font-jost) !important }
                // so these rarely render as Inter in the admin anyway.
                'headline-lg':        ['Inter', 'sans-serif'],
                'headline-lg-mobile': ['Inter', 'sans-serif'],
            },
            fontSize: {
                // From the second config
                'display-lg-mobile': [
                    '40px',
                    { lineHeight: '48px', letterSpacing: '-0.01em', fontWeight: '500' },
                ],
                'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
                'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '500' }],
                'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
                'label-md': [
                    '14px',
                    { lineHeight: '20px', letterSpacing: '0.1em', fontWeight: '600' },
                ],
                'headline-md': ['32px', { lineHeight: '40px', fontWeight: '500' }],
                'display-lg': [
                    '64px',
                    { lineHeight: '72px', letterSpacing: '-0.02em', fontWeight: '500' },
                ],
                'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
                
                // From the first config (dashboard)
                'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
                'headline-lg-mobile': ['20px', { lineHeight: '28px', fontWeight: '600' }],
                'display-lg': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
                'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
                'label-md': ['12px', { lineHeight: '16px', fontWeight: '600' }],
                'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }]
            },
        },
    },
    plugins: [],
};