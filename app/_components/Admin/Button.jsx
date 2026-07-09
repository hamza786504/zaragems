'use client';

import React from 'react';
import Link from 'next/link';

export default function Button({
  children,
  onClick,
  href,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  ...props
}) {
  // Base classes
  let baseClass = 'inline-flex items-center justify-center gap-2 font-bold transition-all rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none';

  // Variant classes
  let variantClass = '';
  switch (variant) {
    case 'primary':
      variantClass = 'bg-primary text-on-primary hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] border border-transparent';
      break;
    case 'secondary':
      variantClass = 'bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high hover:scale-[1.01] active:scale-[0.99]';
      break;
    case 'outline':
      variantClass = 'border border-outline text-on-surface hover:bg-surface-container-high hover:scale-[1.01] active:scale-[0.99]';
      break;
    case 'danger':
      variantClass = 'bg-error text-on-error hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] border border-transparent';
      break;
    case 'text':
      variantClass = 'text-primary hover:bg-primary-container/10 shadow-none border border-transparent';
      break;
    default:
      variantClass = 'bg-primary text-on-primary hover:opacity-90 border border-transparent';
  }

  // Size classes
  let sizeClass = '';
  switch (size) {
    case 'sm':
      sizeClass = 'px-3 py-1.5 text-xs';
      break;
    case 'md':
      sizeClass = 'px-5 py-2.5 text-sm';
      break;
    case 'lg':
      sizeClass = 'px-8 py-3 text-base';
      break;
    default:
      sizeClass = 'px-5 py-2.5 text-sm';
  }

  const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName} {...props}>
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
}
