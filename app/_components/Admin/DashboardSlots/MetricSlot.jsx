'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';

export default function MetricSlot({ title, fetchKey, icon: Icon, bgColor, textColor, formatValue, getSubtitle, getChange, getSparkData, intervalMs = 15000 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch {
      // silently fail for background refreshes
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(true);
    const iv = setInterval(() => fetchData(false), intervalMs);
    return () => clearInterval(iv);
  }, [fetchData, intervalMs]);

  if (loading) {
    return (
      <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm animate-pulse">
        <div className="flex justify-between items-start mb-md">
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-surface-container-high rounded w-20" />
            <div className="h-6 bg-surface-container-high rounded w-28" />
            <div className="h-3 bg-surface-container-high rounded w-36" />
          </div>
          <div className={`p-sm rounded-lg ${bgColor}`}>
            <div className="w-5 h-5 bg-surface-container-high rounded" />
          </div>
        </div>
        <div className="h-12 bg-surface-container-high rounded" />
      </div>
    );
  }

  const value = data ? formatValue(data) : '—';
  const subtitle = data ? getSubtitle(data) : '';
  const change = data ? getChange(data) : 0;
  const positive = change >= 0;
  const sparkData = data ? getSparkData(data) : [];

  return (
    <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all group cursor-pointer relative">
      <div className="flex justify-between items-start mb-md">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant">{title}</p>
          <h5 className="font-headline-lg text-headline-lg text-on-surface mt-xs">{value}</h5>
          <p className="text-body-sm text-on-surface-variant mt-xs">{subtitle}</p>
        </div>
        <div className={`p-sm rounded-lg ${bgColor} ${textColor}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-xs">
        {positive ? (
          <TrendingUp size={16} className="text-primary" />
        ) : (
          <TrendingDown size={16} className="text-error" />
        )}
        <span className={`font-label-md ${positive ? 'text-primary' : 'text-error'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
        <span className="text-on-surface-variant text-body-sm ml-xs">vs last 30 days</span>
        {refreshing && <RefreshCw size={12} className="animate-spin text-on-surface-variant ml-auto" />}
      </div>

      {/* Mini sparkline */}
      <div className="mt-lg h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData.length > 0 ? sparkData.slice(-8) : []}>
            <defs>
              <linearGradient id={`grad-${fetchKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={positive ? '#006c50' : '#ba1a1a'} stopOpacity={0.3} />
                <stop offset="95%" stopColor={positive ? '#006c50' : '#ba1a1a'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="sales"
              stroke={positive ? '#006c50' : '#ba1a1a'}
              fill={`url(#grad-${fetchKey})`}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
