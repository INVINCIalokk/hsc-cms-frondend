"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  TrendingUp,
  Clock,
  Calendar,
  Search,
  ArrowLeft,
  Loader2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Percent,
  XCircle,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/apiClient";
import UnauthenticatedCard from "@/components/profile/UnauthenticatedCard";

export default function ScoresPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("theory"); // 'theory' | 'entrance'
  const [searchTerm, setSearchTerm] = useState("");
  const [scoresData, setScoresData] = useState({
    summary: { theory_avg_marks: 0, entrance_avg_percentile: 0, total_exams: 0, absent_count: 0 },
    theory_scores: [],
    entrance_scores: [],
  });

  const batchName =
    user?.batch?.name || user?.batch?.Name || user?.batch?.attributes?.name;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchScores();
  }, [user]);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/exams/my-scores");
      const data = res.data?.data || {};
      setScoresData({
        summary: data.summary || { theory_avg_marks: 0, entrance_avg_percentile: 0, total_exams: 0, absent_count: 0 },
        theory_scores: data.theory_scores || [],
        entrance_scores: data.entrance_scores || [],
      });
    } catch (err) {
      console.error("Failed to fetch scores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_STRAPI_URL
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/connect/google`
      : "http://localhost:1337/api/connect/google";
  };

  if (!user) {
    return <UnauthenticatedCard onLogin={handleLogin} />;
  }

  const currentScoresList =
    activeTab === "theory"
      ? scoresData.theory_scores
      : scoresData.entrance_scores;

  const filteredScores = currentScoresList.filter((item) => {
    const title = item.title || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (item) => {
    if (item.is_absent || item.status === "absent") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Absent
        </span>
      );
    }
    if (item.status === "submitted") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Evaluation Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Evaluated
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-2 py-4 animate-in fade-in duration-300 space-y-6">
      {/* Header Banner */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-teal-500/10 border border-border shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full cursor-pointer hover:bg-background/80"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              <BarChart3 className="w-3.5 h-3.5" />
              Performance Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Exam Scores & Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your Theory exam marks and Entrance percentile standings across your batch assessments.
            {batchName && (
              <span className="ml-1 font-semibold text-primary">
                (Batch: {batchName})
              </span>
            )}
          </p>
        </div>

        <Button
          onClick={fetchScores}
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer shrink-0"
        >
          Refresh Scores
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border bg-card shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Batch Exams
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {scoresData.summary.total_exams}
            </span>
            <BookOpen className="w-5 h-5 text-primary opacity-80" />
          </div>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Theory Average
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {scoresData.summary.theory_avg_marks}
            </span>
            <Award className="w-5 h-5 text-emerald-500 opacity-80" />
          </div>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Entrance Percentile
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {scoresData.summary.entrance_avg_percentile}%
            </span>
            <Percent className="w-5 h-5 text-amber-500 opacity-80" />
          </div>
        </Card>

        <Card className="p-4 border-border bg-card shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Absent Count
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {scoresData.summary.absent_count}
            </span>
            <XCircle className="w-5 h-5 text-rose-500 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant={activeTab === "theory" ? "default" : "outline"}
            onClick={() => setActiveTab("theory")}
            className="flex-1 sm:flex-initial gap-2 cursor-pointer font-bold"
          >
            <BookOpen className="w-4 h-4" />
            <span>Theory Exams</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-background/20">
              {scoresData.theory_scores.length}
            </span>
          </Button>

          <Button
            type="button"
            variant={activeTab === "entrance" ? "default" : "outline"}
            onClick={() => setActiveTab("entrance")}
            className="flex-1 sm:flex-initial gap-2 cursor-pointer font-bold"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Entrance Exams</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-background/20">
              {scoresData.entrance_scores.length}
            </span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${activeTab} exams...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading scores & percentile analytics...</p>
        </div>
      ) : filteredScores.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border bg-card">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-full bg-secondary/50 text-muted-foreground">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No {activeTab === "theory" ? "Theory" : "Entrance"} Scores Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm
                ? "No exam titles match your search criteria."
                : `No ${activeTab} exams have been published for your batch yet.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScores.map((item) => {
            const isTheory = activeTab === "theory";
            const formattedDate = item.date
              ? new Date(item.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
              : "N/A";

            return (
              <Card
                key={item.exam_id}
                className={`flex flex-col justify-between border bg-card shadow-xs transition-all duration-200 ${item.is_absent
                  ? "border-rose-500/30 opacity-80"
                  : isTheory
                    ? "border-border hover:border-emerald-500/40"
                    : "border-border hover:border-amber-500/40"
                  }`}
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-secondary text-secondary-foreground border-border">
                      {isTheory ? "Theory" : "Entrance"}
                    </span>
                    {getStatusBadge(item)}
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground line-clamp-1">
                    {item.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Score KPI Box */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50 text-center">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Obtained Score
                      </p>
                      <p
                        className={`text-base font-extrabold flex items-center justify-center gap-1 ${item.is_absent
                          ? "text-rose-500"
                          : item.obtained_marks < 0
                            ? "text-rose-500"
                            : "text-emerald-600 dark:text-emerald-400"
                          }`}
                      >
                        {item.obtained_marks !== null && item.obtained_marks !== undefined
                          ? item.obtained_marks
                          : "Pending"}{" "}
                        / {item.total_marks}
                      </p>
                    </div>

                    <div className="space-y-0.5 border-l border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        {isTheory ? "Mark Weight" : "Percentile"}
                      </p>
                      {isTheory ? (
                        <p className="text-base font-extrabold text-foreground flex items-center justify-center gap-1">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          {item.total_marks}
                        </p>
                      ) : (
                        <p className="text-base font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {item.percentile}%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date & Exam Info */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>Date: {formattedDate}</span>
                    </p>
                  </div>
                </CardContent>

                <div className="p-4 pt-0 border-t border-border/40 mt-2 pt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {item.is_absent
                      ? "Counted as 0 marks"
                      : item.status === "submitted"
                        ? "Pending teacher evaluation"
                        : "Evaluation complete"}
                  </span>

                  <Link href={`/exams/${item.exam_id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 cursor-pointer font-bold text-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View Exam</span>
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
