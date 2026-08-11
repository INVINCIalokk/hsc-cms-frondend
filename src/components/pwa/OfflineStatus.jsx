"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineStatus() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      {isOffline ? (
        <div className="flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/90 px-4 py-1.5 text-xs font-semibold text-destructive-foreground shadow-lg backdrop-blur-md">
          <WifiOff className="h-3.5 w-3.5 animate-pulse" />
          <span>You are offline. Viewing cached content.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-600/90 px-4 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
          <Wifi className="h-3.5 w-3.5" />
          <span>Back online!</span>
        </div>
      )}
    </div>
  );
}
