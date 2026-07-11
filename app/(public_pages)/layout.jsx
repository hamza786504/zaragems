import Footer from '../_components/Footer';
import Navbar from '../_components/Navbar';
import RecentPurchasePopup from '../_components/RecentPurchasePopup';
import '../globals.css';
import { getSiteSettings } from '@/lib/getSiteSettings';
import { SiteSettingsProvider } from '../store/siteSettingsContext';
import { buildThemeCss, buildGoogleFontsHref } from '@/lib/theme';

// ISR: cache the layout for 5 minutes. Theme/font data rarely changes.
// Admin saves immediately purge this via revalidateTag('site-settings') in the
// PUT handler, so visitors always see the latest after an admin save — not after
// 5 minutes. Bumping from 60s → 300s cuts Sanity CDN requests by 5×.
export const revalidate = 300;

export default async function PublicLayout({ children }) {
    const settings = await getSiteSettings();

    // Produce a minified CSS string like:
    //   .storefront-theme{--color-primary:#00654b;--font-eb-garamond:'Playfair Display',serif}
    // Injected as a <style> tag so the CSS engine applies it before any paint —
    // zero FOUC and zero React hydration cost (unlike inline style on a div).
    const themeCss = buildThemeCss(settings.theme, settings.typography);

    // Only populated when the admin picks a non-default (non-preloaded) font.
    const fontHref = buildGoogleFontsHref(settings.typography);

    return (
        <SiteSettingsProvider settings={settings}>
            {/* ── Theme CSS vars — injected in <head> before any element renders ── */}
            {themeCss && (
                <style
                    id="storefront-theme"
                    // dangerouslySetInnerHTML is safe here: the string comes from our
                    // own buildThemeCss() which only emits CSS custom property declarations.
                    dangerouslySetInnerHTML={{ __html: themeCss }}
                />
            )}

            {/* ── Custom Google Font — only when a non-default font is selected ── */}
            {fontHref && (
                <link rel="stylesheet" href={fontHref} precedence="theme-fonts" />
            )}

            <div className="storefront-theme min-h-screen bg-surface text-on-surface">
                <Navbar />
                {children}
                <Footer />
                <RecentPurchasePopup />
            </div>
        </SiteSettingsProvider>
    );
}