"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOutIcon, User, ChevronDown, Menu, X, LayoutDashboard, BookOpen, BookOpenText, Layers } from 'lucide-react'

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuRef = useRef(null);

  const handleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_STRAPI_URL
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/connect/google`
      : 'http://localhost:1337/api/connect/google';
  };

  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || 'User'
    )}&background=ffeb3b&color=000`;
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 flex py-4 w-full justify-center">
        <div className="flex flex-row items-center justify-between w-full max-w-7xl rounded-md px-4 py-2.5 bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-border">

          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - ONLY for Logged-In Users (Small & Large Screens) */}
            {user && (
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="p-1.5 rounded-md hover:bg-accent/50 text-foreground transition-colors cursor-pointer"
                aria-label="Open Sidebar Navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Brand Logo */}
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex flex-row gap-2.5 items-center group"
            >
              <img
                src="https://lh3.googleusercontent.com/a/ACg8ocJmrogIzisIQF_fcnlCAA9H2kLHJL7FqiJOse0Oh5PAUPwZhlqK=s200-c"
                alt="GyanLab Logo"
                className="rounded-full group-hover:scale-105 transition-transform duration-200"
                width={38}
                height={38}
              />
              <span className="text-2xl font-bold hidden sm:block tracking-tight text-foreground group-hover:text-primary transition-colors">
                GyanLab
              </span>
            </Link>
          </div>

          <div className="flex flex-row gap-4 items-center">
            {/* Top Nav Resources link ONLY for NON-LOGGED-IN Users */}

            <ModeToggle />
            {/* Logged-In User Profile Avatar Dropdown */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 focus:outline-none rounded-full p-0.5 transition-transform active:scale-95 cursor-pointer"
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={getAvatarUrl(user.username)}
                    alt={`${user.username || 'User'}'s profile`}
                    className="rounded-full ring-2 ring-primary/20 hover:ring-primary transition-all duration-200 object-cover"
                    width={38}
                    height={38}
                  />
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180 text-primary' : ''
                      }`}
                  />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-52 rounded-lg border border-border bg-popover/95 p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in-80 zoom-in-95">
                    {/* User details header */}
                    <div className="px-3 py-2 mb-1 border-b border-border/60">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.username || 'User'}
                      </p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    {/* Profile & Logout actions */}
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/90 hover:bg-accent hover:text-accent-foreground transition-all duration-150 cursor-pointer"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                          window.location.href = "/";
                        }}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-150 cursor-pointer text-left"
                      >
                        <LogOutIcon className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                className="px-5 py-2 font-bold cursor-pointer transition-all hover:scale-[1.02]"
                onClick={handleLogin}
              >
                LOGIN
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* LEFT HAMBURGER SIDEBAR DRAWER (Only when Logged In - Small & Large Screens) */}
      {user && isDrawerOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Left Slide-Over Drawer Container */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl p-5 flex flex-col justify-between transition-transform duration-300 animate-in slide-in-from-left">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <Link
                  href="/dashboard"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-2.5 group"
                >
                  <img
                    src="https://lh3.googleusercontent.com/a/ACg8ocJmrogIzisIQF_fcnlCAA9H2kLHJL7FqiJOse0Oh5PAUPwZhlqK=s200-c"
                    alt="GyanLab Logo"
                    className="rounded-full"
                    width={32}
                    height={32}
                  />
                  <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    GyanLab
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links / Tabs */}
              <nav className="flex flex-col gap-1.5 mt-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-foreground/90 hover:bg-accent/50 hover:text-accent-foreground transition-all cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/textbook-solution"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-foreground/90 hover:bg-accent/50 hover:text-accent-foreground transition-all cursor-pointer"
                >
                  <BookOpenText className="h-4 w-4 text-primary" />
                  <span>Textbook Solution</span>
                </Link>

                <Link
                  href="/revision-deck"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-foreground/90 hover:bg-accent/50 hover:text-accent-foreground transition-all cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Revision Deck</span>
                </Link>

                <Link
                  href="/resources"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold text-foreground/90 hover:bg-accent/50 hover:text-accent-foreground transition-all cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Resource</span>
                </Link>
              </nav>
            </div>

            {/* Drawer Footer - Logout Button */}
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  logout();
                  window.location.href = "/";
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <LogOutIcon className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
