"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Award,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  Loader2,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Lock,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/apiClient";
import UnauthenticatedCard from "@/components/profile/UnauthenticatedCard";

export default function ExamsPage() {
  const { user } = useAuth();

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive' | 'completed'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'theory' | 'entrance'

  // Extract user batch identifiers (prefer documentId)
  const batchDocId = user?.batch?.documentId || user?.batch?.data?.documentId;
  const batchId = user?.batch?.id || user?.batch?.data?.id;
  const batchName =
    user?.batch?.name || user?.batch?.Name || user?.batch?.attributes?.name;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchExams();
  }, [user, batchDocId, batchId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      let params = {
        sort: "publishedAt:desc",
        populate: "*",
      };

      // Filter by user's assigned batch using documentId
      if (batchDocId) {
        params.filters = { batch: { documentId: { $eq: batchDocId } } };
      } else if (batchId) {
        params.filters = { batch: { id: { $eq: batchId } } };
      }

      let list = [];
      try {
        const res = await api.get("/api/exams", { params });
        list = res.data?.data || [];
      } catch (err) {
        console.warn(
          "Filtered query for exams failed, fetching fallback list:",
          err,
        );
        const fallbackRes = await api.get("/api/exams", {
          params: { sort: "publishedAt:desc", populate: "*" },
        });
        list = fallbackRes.data?.data || [];
      }

      setExams(list);
    } catch (err) {
      console.error("Failed to fetch exams:", err);
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

  // Filter exams by search term, status, and type
  const filteredExams = exams.filter((exam) => {
    const title = exam.title || exam.name || "";
    const matchesSearch = title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const examStatus = (exam.status || exam.exam_status || "inactive").toLowerCase();
    const matchesStatus =
      statusFilter === "all" || examStatus === statusFilter.toLowerCase();

    const examType = (exam.type || "theory").toLowerCase();
    const matchesType =
      typeFilter === "all" || examType === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    const s = (status || "inactive").toLowerCase();
    if (s === "active") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Live Now
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
        <Lock className="w-3.5 h-3.5" />
        Upcoming / Inactive
      </span>
    );
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-2 py-4 animate-in fade-in duration-300 space-y-6">
      {/* Header Banner */}
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/20 to-accent/10 border border-border shadow-xs">
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
              <GraduationCap className="w-3.5 h-3.5" />
              Examination Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Exams & Assessments
          </h1>
          <p className="text-sm text-muted-foreground">
            Take live scheduled tests, auto-evaluate your score, and review
            detailed step-by-step solutions.
            {batchName && (
              <span className="ml-1 font-semibold text-primary">
                (Batch: {batchName})
              </span>
            )}
          </p>
        </div>

        <Button
          onClick={fetchExams}
          variant="outline"
          size="sm"
          className="gap-2 cursor-pointer shrink-0"
        >
          Refresh List
        </Button>
      </div>

      {/* Controls Bar: Search, Status & Type Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-xs">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search exam title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Filter Groups */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Lifecycle Status Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-semibold text-muted-foreground mr-1 hidden xl:inline">
              Status:
            </span>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="text-xs font-semibold py-1 px-3 cursor-pointer"
            >
              All
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              className="text-xs font-semibold py-1 px-3 cursor-pointer gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              className="text-xs font-semibold py-1 px-3 cursor-pointer"
            >
              Upcoming
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "completed" ? "default" : "outline"}
              onClick={() => setStatusFilter("completed")}
              className="text-xs font-semibold py-1 px-3 cursor-pointer"
            >
              Completed
            </Button>
          </div>

          {/* Exam Type Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-border pt-2 sm:pt-0 sm:pl-3">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:inline" />
            <Button
              type="button"
              size="sm"
              variant={typeFilter === "all" ? "default" : "outline"}
              onClick={() => setTypeFilter("all")}
              className="text-xs font-semibold py-1 px-2.5 cursor-pointer"
            >
              All Types
            </Button>
            <Button
              type="button"
              size="sm"
              variant={typeFilter === "theory" ? "default" : "outline"}
              onClick={() => setTypeFilter("theory")}
              className="text-xs font-semibold py-1 px-2.5 cursor-pointer"
            >
              Theory
            </Button>
            <Button
              type="button"
              size="sm"
              variant={typeFilter === "entrance" ? "default" : "outline"}
              onClick={() => setTypeFilter("entrance")}
              className="text-xs font-semibold py-1 px-2.5 cursor-pointer"
            >
              Entrance
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading assessments...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-border bg-card">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-4 rounded-full bg-secondary/50 text-muted-foreground">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              No Exams Found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                ? "No exams match your current search or filter criteria."
                : "No exams are assigned to your batch yet."}
            </p>
            {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="mt-2 cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div> 
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => {
            const docId = exam.documentId || exam.id;
            const status = (exam.status || exam.exam_status || "inactive").toLowerCase();
            const isLive = status === "active";
            const isCompleted = status === "completed";

            const pubDate = exam.publishedAt
              ? new Date(exam.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : null;

            return (
              <Card
                key={docId}
                className={`flex flex-col justify-between border bg-card shadow-xs transition-all duration-200 overflow-hidden ${
                  isLive
                    ? "border-emerald-500/40 hover:border-emerald-500 ring-1 ring-emerald-500/20 shadow-md"
                    : isCompleted
                      ? "border-blue-500/30 hover:border-blue-500/50"
                      : "border-border hover:border-primary/40 opacity-90"
                }`}
              >
                <CardHeader className="p-4 pb-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-secondary text-secondary-foreground border-border">
                      {exam.type || "Theory"}
                    </span>
                    {getStatusBadge(status)}
                  </div>

                  <CardTitle className="text-lg font-bold text-foreground line-clamp-1">
                    {exam.title || "Exam Assessment"}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Key Stats Row */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-secondary/30 border border-border/50 text-center">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Total Marks
                      </p>
                      <p className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {exam.total_marks ?? "N/A"}
                      </p>
                    </div>

                    <div className="space-y-0.5 border-l border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Duration
                      </p>
                      <p className="text-sm font-extrabold text-foreground flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {exam.duration_minutes
                          ? `${exam.duration_minutes}m`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Dates / Info */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {pubDate && (
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>Published: {pubDate}</span>
                      </p>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 border-t border-border/40 mt-2 pt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {isLive
                      ? "Ready to attempt"
                      : isCompleted
                        ? "Solutions available"
                        : "Not active yet"}
                  </span>

                  {isLive ? (
                    <Link href={`/exams/${docId}`}>
                      <Button
                        size="sm"
                        className="gap-1.5 cursor-pointer font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Start Exam</span>
                      </Button>
                    </Link>
                  ) : isCompleted ? (
                    <Link href={`/exams/${docId}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 cursor-pointer font-bold border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Review Solutions</span>
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/exams/${docId}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 cursor-pointer font-medium text-muted-foreground"
                      >
                        <span>View Details</span>
                      </Button>
                    </Link>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
