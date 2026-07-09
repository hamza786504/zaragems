// components/Newsletter.jsx
import { Mail } from 'lucide-react';

export default function Newsletter() {
    return (
        <section className="py-20 bg-primary text-white relative overflow-hidden">
            <div className="relative z-10 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
                <Mail className="text-white w-16 h-16 mx-auto mb-6" strokeWidth={1.5} />
                <h2 className="text-headline-md font-headline-md mb-4">Join Our Inner Circle</h2>
                <p className="text-body-lg font-body-lg max-w-[500px] mx-auto mb-10 text-white/90">
                    Sign up to stay updated with our latest arrivals and exclusive offers delivered
                    straight to your inbox.
                </p>
                <form className="max-w-[400px] mx-auto flex flex-col md:flex-row gap-4 focus-within:ring-1 focus-within:ring-secondary">
                    <input
                        className="flex-grow bg-white/5 text-white px-6 py-4 outline-none focus:border-secondary transition-colors font-label-md border-white/40 placeholder:text-white/60"
                        placeholder="Your Email Address"
                        type="email"
                    />
                    <button
                        className="bg-white text-primary font-label-md px-10 py-4 hover:bg-surface-container transition-all uppercase tracking-widest font-bold"
                        type="submit"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
}