'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../store/authContext';

export default function AccountDetailsPage() {
    const { customer, loading, isAuthenticated, refresh } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
    });

    // Load user data when authenticated
    useEffect(() => {
        if (isAuthenticated && customer) {
            setFormData(prev => ({
                ...prev,
                firstName: customer.firstName || '',
                lastName: customer.lastName || '',
                email: customer.email || '',
                phone: customer.phone || '',
            }));
        }
    }, [isAuthenticated, customer]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Call the profile update API
            const res = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Update failed');
            }

            // Refresh the auth context so the sidebar/header reflect the new details.
            if (refresh) await refresh();

            setIsSubmitting(false);
            setSubmitStatus('success');

            // Reset success message after 2 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 2000);
        } catch (error) {
            setIsSubmitting(false);
            setSubmitStatus('error');

            // Reset error message after 3 seconds
            setTimeout(() => {
                setSubmitStatus(null);
            }, 3000);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        setFormData((prev) => ({
            ...prev,
            firstName: customer?.firstName || '',
            lastName: customer?.lastName || '',
            email: customer?.email || '',
            phone: customer?.phone || '',
            currentPassword: '',
            newPassword: '',
        }));
        router.push('/dashboard');
    };

    // Get submit button text
    const getSubmitButtonText = () => {
        if (isSubmitting) return 'Processing...';
        if (submitStatus === 'success') return 'Changes Saved';
        return 'Save Changes';
    };

    // Get submit button styles
    const getSubmitButtonStyles = () => {
        if (submitStatus === 'success') {
            return 'bg-secondary text-primary border-secondary';
        }
        return 'bg-primary text-on-primary border-secondary hover:scale-105';
    };

    return (
        <div className="max-w-3xl">
            {/* Header */}
            <div className="mb-stack-sm border-b premium-border pb-4">
                <h1 className="font-display-lg text-headline-md text-primary mb-2">
                    Account Details
                </h1>
                <p className="font-body-md text-on-surface-variant">
                    Update your personal information and security preferences below to maintain your exclusive profile.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-stack-sm">
                {/* Personal Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                    {/* First Name */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="font-label-md text-label-md text-primary uppercase tracking-wider"
                            htmlFor="first_name"
                        >
                            First Name
                        </label>
                        <input
                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                            id="first_name"
                            name="firstName"
                            type="text"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Last Name */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="font-label-md text-label-md text-primary uppercase tracking-wider"
                            htmlFor="last_name"
                        >
                            Last Name
                        </label>
                        <input
                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                            id="last_name"
                            name="lastName"
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="font-label-md text-label-md text-primary uppercase tracking-wider"
                            htmlFor="email"
                        >
                            Email Address
                        </label>
                        <input
                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@address.com"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label
                            className="font-label-md text-label-md text-primary uppercase tracking-wider"
                            htmlFor="phone"
                        >
                            Phone Number
                        </label>
                        <input
                            className="input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none"
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+92 XXX XXXXXXX"
                            value={formData.phone}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                {/* Password Update Section */}
                <div className="mt-stack-md pt-stack-sm border-t premium-border">
                    <h3 className="font-headline-sm text-headline-sm text-primary mb-6">
                        Password Security
                    </h3>
                    <div className="space-y-6">
                        {/* Current Password */}
                        <div className="flex flex-col gap-2">
                            <label
                                className="font-label-md text-label-md text-primary uppercase tracking-wider"
                                htmlFor="current_password"
                            >
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none pr-12"
                                    id="current_password"
                                    name="currentPassword"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-symbols-outlined">
                                        {showCurrentPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-2">
                            <label
                                className="font-label-md text-label-md text-primary uppercase tracking-wider"
                                htmlFor="new_password"
                            >
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    className="w-full input-transition bg-surface-container-low border border-secondary/30 focus:border-secondary focus:ring-0 rounded-none px-4 py-3 font-body-md text-on-surface outline-none pr-12"
                                    id="new_password"
                                    name="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Min. 8 characters"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-symbols-outlined">
                                        {showNewPassword ? 'visibility' : 'visibility_off'}
                                    </span>
                                </button>
                            </div>
                            <p className="text-[10px] text-on-surface-variant/60 font-label-sm italic">
                                Include at least one uppercase letter and one special character.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {submitStatus === 'error' && (
                    <div className="flex items-center gap-2 text-error bg-error-container/20 px-4 py-3 border border-error/30">
                        <span className="material-symbols-outlined text-error">error</span>
                        <p className="text-label-sm font-label-sm">
                            Failed to update profile. Please try again.
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-stack-sm flex flex-col sm:flex-row items-center gap-gutter">
                    <button
                        className={`w-full sm:w-auto font-label-md text-label-md uppercase tracking-[0.2em] px-12 py-4 border transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${getSubmitButtonStyles()}`}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {getSubmitButtonText()}
                    </button>
                    <button
                        className="w-full sm:w-auto border border-secondary text-primary font-label-md text-label-md uppercase tracking-[0.2em] px-12 py-4 hover:bg-surface-container-low transition-all duration-300"
                        type="button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
