"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Protect route: redirect to landing page if not logged in
  useEffect(() => {
    if (!user && typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        router.push("/");
      }
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-base text-muted-foreground">
          Welcome back, <strong className="text-foreground">{user.username || "Student"}</strong>!
        </p>
      </div>
    </div>
  );
}
