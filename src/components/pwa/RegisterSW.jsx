"use client";

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA ServiceWorker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.error('PWA ServiceWorker registration failed:', err);
          });
      });
    } else if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register in dev mode if explicitly wanted or register sw.js quietly
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('PWA ServiceWorker registered in dev mode:', registration.scope);
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
