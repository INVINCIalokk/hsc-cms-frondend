"use client";

import React, { useEffect, useState } from "react";
import { Trophy, BookOpen, PenTool, Award, Loader2, Flame } from "lucide-react";
import qs from "qs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LeaderboardCard() {
  const { user } = useAuth();

  // Extract the batchId safely from the nested user object (supports documentId or id)
  const batchId = user?.batch?.documentId || user?.batch?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("theory"); // 'theory' | 'entrance'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!batchId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const query = qs.stringify({ batchId }, { encodeValuesOnly: true });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/leaderboard?${query}`
        );
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [batchId]);

  // Safely extract the current active list
  const currentList = data?.leaderboards?.[activeTab] || [];

  // Dynamically find the logged-in user's stats
  const userRankIndex = currentList.findIndex(
    (item) =>
      item.userId === user?.id ||
      item.documentId === user?.documentId ||
      (user?.id && String(item.userId) === String(user?.id))
  );

  // Helper for rendering rank badge/number
  const getBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <CardHeader className="p-4 border-b border-border/50 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <CardTitle className="text-base sm:text-lg font-bold">
              Leaderboard
            </CardTitle>
          </div>
        </div>

        {/* Minimal Tabs: Theory & Entrance matching TimetableCard */}
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            size="sm"
            variant={activeTab === "theory" ? "default" : "outline"}
            onClick={() => setActiveTab("theory")}
            className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold py-1.5 px-4 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory</span>
          </Button>

          <Button
            type="button"
            size="sm"
            variant={activeTab === "entrance" ? "default" : "outline"}
            onClick={() => setActiveTab("entrance")}
            className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold py-1.5 px-4 cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Entrance</span>
          </Button>
        </div>
      </CardHeader>

      {/* Content View matching TimetableCard */}
      <CardContent className="p-2 flex-1 flex flex-col justify-between">
        <div className="max-h-62.5 min-h-57.5 overflow-y-auto pr-1 space-y-2 animate-in fade-in duration-200">
          {loading ? (
            <div className="flex items-center justify-center h-50 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading standings...
            </div>
          ) : !batchId ? (
            <div className="flex items-center justify-center h-50">
              <p className="text-xs text-muted-foreground font-medium">
                No batch assigned to user.
              </p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="flex items-center justify-center h-50">
              <p className="text-xs text-muted-foreground font-medium">
                No standings posted yet.
              </p>
            </div>
          ) : (
            currentList.map((item, index) => {
              const isCurrentUser =
                item.userId === user?.id ||
                item.documentId === user?.documentId ||
                (user?.id && String(item.userId) === String(user?.id));

              return (
                <div
                  key={item.documentId || item.userId || index}
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-between gap-2 ${isCurrentUser
                    ? "bg-primary/10 border-primary/30"
                    : "bg-secondary/30 border-border/40 hover:border-primary/30"
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-md bg-background border border-border shrink-0 w-8 h-8 flex items-center justify-center text-xs font-bold text-foreground">
                      {getBadge(index)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-foreground truncate leading-snug flex items-center gap-1.5">
                        <span>{item.username || "Student"}</span>
                        {isCurrentUser && (
                          <span className="text-xs font-medium px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rank #{index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded border flex items-center gap-1 ${isCurrentUser
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-background border-border text-foreground"
                        }`}
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {item.averageMarks} Avg
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pinned Logged-in User summary bar */}
        {userRankIndex !== -1 && (
          <div className="pt-2 mt-2 border-t border-border/50">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-bold">
                  #{userRankIndex + 1}
                </span>
                <span className="text-foreground font-bold">Your Standing</span>
              </div>
              <span className="text-primary font-extrabold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {currentList[userRankIndex]?.averageMarks} Avg
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}