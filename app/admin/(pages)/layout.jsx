import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import '../../globals.css';
import Sidebar from '../../_components/Admin/Sidebar';
import Header from '../../_components/Admin/Header';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
        redirect('/admin/login');
    }

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (error) {
        redirect('/admin/login');
    }

    return (
        <div style={{ "backgroundColor": "#f6fafe" }} className="admin-layout bg-surface text-on-surface selection:bg-secondary-container selection:text-on-secondary-container min-h-screen">
            <Sidebar />
            <Header />
            <main className="ml-0 lg:ml-60 pt-20 min-h-screen px-3 md:pt-20 md:p-sm bg-surface-container-lowest">
              {children}
            </main>
        </div>
    );
}