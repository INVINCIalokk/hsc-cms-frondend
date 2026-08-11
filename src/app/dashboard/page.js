"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Modular Dashboard Sub-components
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import LeaderboardCard from "@/components/dashboard/LeaderboardCard";
import TimetableCard from "@/components/dashboard/TimetableCard";
import QuickLinksSection from "@/components/dashboard/QuickLinksSection";

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
    <div className="flex flex-col w-full max-w-7xl mb-4 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Grid Row: Leaderboard & Minimal 2-Tab Timetable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
        <LeaderboardCard user={user} />
        <TimetableCard />
      </div>

      {/* Quick Access Shortcuts Section */}
      <QuickLinksSection />
    </div>
  );
}
