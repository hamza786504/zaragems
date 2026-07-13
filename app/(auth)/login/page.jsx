'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../store/authContext';
export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitText, setSubmitText] = useState('Sign In');
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFocus = (fieldName) => {
        setFocusedField(fieldName);
    };

    const handleBlur = () => {
        setFocusedField(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmitText('Authenticating...');
        setError('');

        try {
            await login(formData.email, formData.password);

            setIsSuccess(true);
            setSubmitText('Welcome');
            router.push('/dashboard');
        } catch (err) {
            setIsSubmitting(false);
            setSubmitText('Sign In');
            setError(err.message || 'Invalid email or password');
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md overflow-x-hidden">
            {/* Global Styles */}
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                }
                .form-underline:focus-within .underline-bar {
                    width: 100%;
                }
                .underline-bar {
                    width: 0%;
                    height: 1px;
                    background-color: #775a19;
                    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .fade-in {
                    animation: fadeIn 1.2s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
            `}</style>

         
            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-stack-md px-margin-mobile">
                <div className="max-w-[450px] w-full grid grid-cols-1 gap-gutter fade-in">
                    {/* Login Form Container */}
                    <div className="bg-surface-container-lowest p-stack-sm md:p-stack-md border border-secondary/20 relative overflow-hidden">
                        {/* Decorative top bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />

                        <div className="text-center mb-stack-md">
                            <h2 className="font-headline-md text-headline-md text-primary mb-2">
                                Welcome Back
                            </h2>
                            <p className="font-body-md text-on-surface-variant">
                                Sign in to your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-gutter">
                            {/* Email Field */}
                            <div className="space-y-1 group">
                                <label
                                    className="font-label-sm text-label-sm uppercase tracking-widest transition-colors duration-300"
                                    htmlFor="email"
                                    style={{
                                        color: focusedField === 'email' ? '#00251e' : '#775a19',
                                    }}
                                >
                                    Email Address
                                </label>
                                <div className="relative form-underline">
                                    <input
                                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 font-body-md text-on-surface placeholder:text-on-surface-variant/40"
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="atelier@nasishexample.com"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onFocus={() => handleFocus('email')}
                                        onBlur={handleBlur}
                                    />
                                    <div className="underline-bar absolute bottom-0 left-0" />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1 group">
                                <div className="flex justify-between items-end">
                                    <label
                                        className="font-label-sm text-label-sm uppercase tracking-widest transition-colors duration-300"
                                        htmlFor="password"
                                        style={{
                                            color: focusedField === 'password' ? '#00251e' : '#775a19',
                                        }}
                                    >
                                        Password
                                    </label>
                                    
                                </div>
                                <div className="relative form-underline">
                                    <input
                                        className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:ring-0 font-body-md text-on-surface placeholder:text-on-surface-variant/40"
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={handleBlur}
                                    />
                                    <div className="underline-bar absolute bottom-0 left-0" />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <p className="font-body-sm text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                                    {error}
                                </p>
                            )}

                            {/* Actions */}
                            <div className="pt-unit">
                                <button
                                    className={`w-full text-white py-4 font-label-md text-label-md uppercase tracking-widest border transition-all duration-300 active:scale-[0.98] ${
                                        isSuccess
                                            ? 'bg-secondary border-secondary'
                                            : 'bg-primary border-secondary hover:bg-primary-container hover:scale-[1.01]'
                                    }`}
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                                >
                                    {submitText}
                                </button>
                            </div>
                        </form>

                        {/* Alternative Action */}
                        <div className="mt-stack-md text-center border-t border-secondary/10 pt-stack-sm">
                            <p className="font-body-md text-on-surface-variant">
                                Don't have an account?{' '}
                                <Link
                                    className="text-secondary font-bold hover:underline transition-all underline-offset-4"
                                    href="/register"
                                >
                                    Register
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Brand Footer */}
                    <div className="text-center opacity-60">
                        <p className="font-label-sm text-label-sm tracking-tighter">
                            ESTABLISHED IN THE HEART OF HERITAGE
                        </p>
                    </div>
                </div>
            </main>


            {/* Footer */}
            <footer className="w-full py-unit border-t border-secondary/10 px-margin-mobile text-center">
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                    © 2026 Zaragems. All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}