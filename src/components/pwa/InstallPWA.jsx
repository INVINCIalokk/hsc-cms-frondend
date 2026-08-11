"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed PWA / standalone
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    if (isInStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed install banner recently (within 3 days)
    const dismissedTime = localStorage.getItem('pwa_install_dismissed');
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show banner after brief delay on iOS Safari
      const timer = setTimeout(() => setShowInstallBanner(true), 2500);
      return () => clearTimeout(timer);
    }

    // Listen for Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIOSModal(false);
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  };

  if (isStandalone || (!showInstallBanner && !showIOSModal)) return null;

  return (
    <>
      {/* Floating Bottom Installation Banner */}
      {showInstallBanner && !showIOSModal && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-6 duration-300">
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/90 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            {/* Glow background accent */}
            <div className="absolute -top-12 -left-12 h-28 w-28 rounded-full bg-primary/20 blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5">
              {/* App Icon */}
              <div className="relative flex-shrink-0">
                <img
                  src="/icons/icon-192x192.png"
                  alt="GyanLab Icon"
                  className="h-12 w-12 rounded-xl shadow-md border border-primary/20 object-cover"
                />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              </div>

              {/* Info text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate tracking-tight">
                  Install GyanLab App
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Fast, offline-ready & seamless native app experience.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="h-8 px-3 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 cursor-pointer"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Install
                </Button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/60 transition-colors cursor-pointer"
                  aria-label="Dismiss installation banner"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/icon-192x192.png"
                  alt="GyanLab"
                  className="h-10 w-10 rounded-xl border border-primary/20"
                />
                <div>
                  <h3 className="font-bold text-foreground">Install on iPhone/iPad</h3>
                  <p className="text-xs text-muted-foreground">Add to Home Screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-full text-muted-foreground hover:bg-accent cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ol className="space-y-3 text-sm text-foreground/90 my-4">
              <li className="flex items-center gap-3 bg-accent/40 p-2.5 rounded-xl border border-border/50">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-xs">
                  1
                </span>
                <span>
                  Tap the <strong className="text-primary">Share</strong> button in Safari toolbar{' '}
                  <Share className="inline h-4 w-4 text-primary ml-0.5" />
                </span>
              </li>
              <li className="flex items-center gap-3 bg-accent/40 p-2.5 rounded-xl border border-border/50">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold text-xs">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="text-primary">Add to Home Screen</strong>{' '}
                  <PlusSquare className="inline h-4 w-4 text-primary ml-0.5" />
                </span>
              </li>
            </ol>

            <Button
              className="w-full mt-2 font-semibold cursor-pointer"
              onClick={handleDismiss}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
