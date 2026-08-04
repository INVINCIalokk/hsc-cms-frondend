"use client"
import React, { useState, useRef, useEffect } from 'react'
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOutIcon, User, ChevronDown } from 'lucide-react'

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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

  // Close profile menu when clicking outside
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
    <nav className="sticky top-0 z-50 flex py-4 w-full justify-center">
      <div className="flex flex-row items-center justify-between w-full max-w-7xl rounded-md px-4 py-2.5 bg-secondary/15 shadow-lg shadow-neutral-600/5 backdrop-blur-lg border border-border">
        <Link href="/" className="flex flex-row gap-2.5 items-center group">
          <img
            src="https://lh3.googleusercontent.com/a/ACg8ocJmrogIzisIQF_fcnlCAA9H2kLHJL7FqiJOse0Oh5PAUPwZhlqK=s200-c"
            alt="GyanLab Logo"
            className="rounded-full"
            width={38}
            height={38}
          />
          <span className="text-2xl font-bold hidden sm:block">
            GyanLab
          </span>
        </Link>

        <div className="flex flex-row gap-4 items-center">
          <Link
            href="/resources"
            className="font-medium text-sm sm:text-base text-foreground/80 hover:text-foreground hover:bg-accent/20 px-3 py-1.5 rounded-md transition-all cursor-pointer"
          >
            Resources
          </Link>

          <ModeToggle />

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
                  {/* User details header inside dropdown */}
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

                  {/* Dropdown Menu Links & Actions */}
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
  );
};
