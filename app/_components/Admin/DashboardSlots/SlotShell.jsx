'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function SlotShell({ title, subtitle, loading, refreshing, lastUpdated, onRefresh, actionLink, actionLabel, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-outline-variant p-3 md:p-lg shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-xl">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h6 className="font-headline-md text-headline-md text-on-surface truncate">{title}</h6>
            {refreshing && <RefreshCw size={14} className="animate-spin text-on-surface-variant shrink-0" />}
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            {subtitle}
            {lastUpdated && <span className="ml-2 opacity-70">Updated: {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              onClick={() => onRefresh(false)}
              className="bg-surface-container text-on-surface hover:bg-surface-container-high px-3 py-2 rounded-lg font-label-md text-label-sm transition-all flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
          {actionLink && actionLabel && (
            <Link
              href={actionLink}
              className="text-primary font-label-md hover:underline flex items-center gap-1"
            >
              {actionLabel}
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-surface-container-high rounded animate-pulse" />
          ))}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
