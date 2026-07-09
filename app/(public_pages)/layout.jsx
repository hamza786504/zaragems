import Footer from '../_components/Footer';
import Navbar from '../_components/Navbar';
import RecentPurchasePopup from '../_components/RecentPurchasePopup';
import '../globals.css';

export default function PublicLayout({ children }) {
    return (
        <>
            <Navbar />
            {children}
            <Footer />
            <RecentPurchasePopup />
        </>
    );
}