'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../store/authContext';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const toggleConfirmPassword = () => {
        setShowConfirmPassword((prev) => !prev);
    }
    const imageRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setError('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
            });

            router.push('/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.message || 'Registration failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Parallax effect on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const img = imageRef.current;
            if (img) {
                img.style.transform = `translateY(${scrolled * 0.05}px) scale(1.05)`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="font-body-md text-on-surface">
            {/* Global Styles */}
            <style jsx global>{`
                body {
                    background-color: #fcf9f8;
                    color: #1c1b1b;
                    -webkit-font-smoothing: antialiased;
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                    vertical-align: middle;
                }
                .text-shadow-subtle {
                    text-shadow: 0 2px 4px rgba(2, 60, 50, 0.05);
                }
                .input-elegant {
                    border: none;
                    border-bottom: 1px solid #c0c8c4;
                    background: transparent;
                    transition: border-color 0.3s ease;
                }
                .input-elegant:focus {
                    outline: none;
                    border-bottom-color: #775a19;
                    box-shadow: none;
                }
            `}</style>


            {/* Main Content */}
            <main className="min-h-screen flex items-center justify-center px-margin-mobile">
                <div className="max-w-container-max w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
                    {/* Left Side: Editorial Image */}
                    <div className="hidden lg:block lg:col-span-6 relative overflow-hidden h-[600px]">
                        <div className="absolute inset-0 z-10 bg-primary/10" />
                        <Image
                            ref={imageRef}
                            className="object-cover"
                            alt="Model wearing a deep emerald silk Eastern garment with gold embroidery"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG39NaoKBaI7IHWqMle0pe08FdX5qhhV75mPlXW0G9EtqP92P1JpxZNF10zCpUcBspGpo3s14iYExV7SExxivYulVtJEmcou9AQM1RZJH0Zp17JG9NE6zH0Q9MGSGA3ydfzOxUDsvyqzhwxa3DYPH3iBOtt2iDWumDmR-Zdhm7MWOP-2hTvOP5idD-PK8HPjZgRy6b5elIl5darnVayg98C4lLdSB56fQTvtd_WjK5PBUtgJFuojUDrE45wUZfZSqgReuObl8oaRc2"
                            fill
                            sizes="(max-width: 1024px) 0px, 50vw"
                            priority
                        />
                        <div className="absolute bottom-margin-desktop left-margin-desktop z-20 text-white max-w-[400px]">
                            <h2 className="font-display-lg text-headline-md text-white mb-stack-sm leading-tight">
                                Crafting Heritage for the Modern Connoisseur.
                            </h2>
                            <p className="font-body-lg text-body-lg text-white/90">
                                Join our community to access exclusive collections, bespoke services,
                                and the finest artistry in Eastern attire.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Registration Form */}
                    <div className="lg:col-span-6 flex flex-col justify-center bg-white p-3 md:p-5 border border-secondary/20 relative">
                        <div className="max-w-[500px] w-full mx-auto">
                            <header className="mb-stack-md text-center lg:text-left">
                                <h1 className="font-display-base text-headline-md md:text-display-base text-primary mb-2">
                                    Create Account
                                </h1>
                                <p className="font-body-md text-on-surface-variant">
                                    Step into the world of Zaragems.
                                </p>
                            </header>

                            <form onSubmit={handleSubmit} className="space-y-stack-sm">
                                {/* Name Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                            htmlFor="first_name"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            className="input-elegant font-body-md py-2"
                                            id="first_name"
                                            name="firstName"
                                            type="text"
                                            placeholder="Ayaan"
                                            required
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                            htmlFor="last_name"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            className="input-elegant font-body-md py-2"
                                            id="last_name"
                                            name="lastName"
                                            type="text"
                                            placeholder="Khan"
                                            required
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                        htmlFor="email"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        className="input-elegant font-body-md py-2"
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="ayaan@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                                    {/* Password */}
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                            htmlFor="password"
                                        >
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="input-elegant font-body-md py-2 w-full pr-10"
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                            />
                                            <button
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                                onClick={togglePassword}
                                                type="button"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                <span className="material-symbols-outlined" id="eye_icon">
                                                    {showPassword ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                     {/* Confirm Password */}
                                    <div className="flex flex-col gap-2">
                                        <label
                                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest"
                                            htmlFor="confirm_password"
                                        >
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="input-elegant font-body-md py-2 w-full pr-10"
                                                id="confirm_password"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                required
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                            />
                                            <button
                                                className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                                onClick={toggleConfirmPassword}
                                                type="button"
                                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            >
                                                <span className="material-symbols-outlined" id="eye_icon">
                                                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <p className="font-body-sm text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                                        {error}
                                    </p>
                                )}

                                {/* Submit Button */}
                                <div className="pt-stack-sm">
                                    <button
                                        className="w-full bg-primary text-white py-stack-sm font-label-md text-label-md uppercase tracking-[0.2em] hover:scale-[1.01] transition-transform duration-300 border border-secondary shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>

                                <div className="text-center pt-unit">
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                                        Already have an account?{' '}
                                        <Link
                                            className="text-secondary font-bold hover:underline transition-all underline-offset-4"
                                            href="/login"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </div>
                            </form>


                        </div>
                    </div>
                </div>
            </main>


        </div>
    );
}