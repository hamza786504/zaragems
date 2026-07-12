import './globals.css';
import { EB_Garamond, Manrope, Jost } from 'next/font/google';
import { CartProvider } from './store/cartContext';
import { NavMenuProvider } from './store/navMenuContext';
import { getHeaderMenuItems } from '@/lib/getHeaderMenu';
import { getSiteSettings } from '..//lib/getSiteSettings';
import { SiteSettingsProvider } from './store/siteSettingsContext';

const ebGaramond = EB_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-eb-garamond',
    display: 'swap',
});

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    variable: '--font-manrope',
    display: 'swap',
});

const jost = Jost({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-jost',
    display: 'swap',
});

// Revalidate periodically so header menu edits made in the admin panel
// show up without requiring a full rebuild/redeploy.
export const revalidate = 60;

export const metadata = {
    title: 'Zaragems | Heritage Meets Luxury',
    description: 'Premium Eastern wear blending centuries-old traditions with modern silhouettes.',
    keywords: 'lawn, chiffon, 3pc, eastern wear, luxury fashion, Pakistan',
};

export default async function RootLayout({ children }) {
    const headerNavItems = await getHeaderMenuItems();
    const settings = await getSiteSettings();


    return (
        <html
            lang="en"
            className={`scroll-smooth ${ebGaramond.variable} ${manrope.variable} ${jost.variable}`}
            suppressHydrationWarning
        >
            <head>
                {/* Preconnect to Google's font servers — establishes DNS + TCP + TLS early,
                    saving 100–300 ms on cold connections before any font download begins. */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {/* Material Symbols icon font */}
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                />
            </head>
            <body className="bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container">
                <SiteSettingsProvider  settings={settings}>
                    <CartProvider>
                        <NavMenuProvider items={headerNavItems}>
                            {children}
                        </NavMenuProvider>
                    </CartProvider>
                </SiteSettingsProvider>
            </body>
        </html>
    );
}