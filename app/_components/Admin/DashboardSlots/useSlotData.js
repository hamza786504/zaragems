'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export default function useSlotData(endpoint, intervalMs = 15000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(endpoint);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setError(null);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError(json.error || 'Failed to fetch');
      }
    } catch (err) {
      if (showLoading) setError('Failed to connect');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData(true);
    const iv = setInterval(() => fetchData(false), intervalMs);
    return () => clearInterval(iv);
  }, [fetchData, intervalMs]);

  return { data, loading, error, refreshing, lastUpdated, refetch: fetchData };
}
