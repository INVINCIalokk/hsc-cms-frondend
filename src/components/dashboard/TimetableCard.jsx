"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, GraduationCap, Award, Users, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/apiClient";

export default function TimetableCard() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("schedule"); // 'schedule' | 'exam'
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCheckedUserMe, setHasCheckedUserMe] = useState(false);

  // Extract user batch identifiers
  const batchId = user?.batch?.id || user?.batch?.data?.id;
  const batchDocId = user?.batch?.documentId || user?.batch?.data?.documentId;
  const batchName =
    user?.batch?.name ||
    user?.batch?.Name ||
    user?.batch?.attributes?.name;

  const hasBatch = !!(batchId || batchDocId || batchName);

  // Refresh user data ONCE if user.batch is missing on initial mount
  useEffect(() => {
    if (user && !user.batch && !hasCheckedUserMe && typeof updateUser === "function") {
      setHasCheckedUserMe(true);
      api
        .get("/api/users/me", { params: { populate: ["board", "standard", "batch"] } })
        .then((res) => {
          if (res.data?.batch) {
            updateUser(res.data);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch populated user me data:", err);
        });
    }
  }, [user, hasCheckedUserMe, updateUser]);

  useEffect(() => {
    fetchTimetableData();
  }, [user, batchId, batchDocId, batchName]);

  const fetchTimetableData = async () => {
    if (!hasBatch) {
      setSchedules([]);
      setExams([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare query parameters (filtered & unfiltered fallback)
      let filterParams = { populate: "*" };

      if (batchDocId) {
        filterParams.filters = { batch: { documentId: { $eq: batchDocId } } };
      } else if (batchId) {
        filterParams.filters = { batch: { id: { $eq: batchId } } };
      } else if (batchName) {
        filterParams.filters = { batch: { name: { $eq: batchName } } };
      }

      // Fetch primary filtered data
      const [schedRes, examRes] = await Promise.allSettled([
        api.get("/api/schedules", { params: filterParams }),
        api.get("/api/exams", { params: filterParams }),
      ]);

      let schedList = [];
      if (schedRes.status === "fulfilled" && Array.isArray(schedRes.value.data?.data)) {
        schedList = schedRes.value.data.data;
      }

      let examList = [];
      if (examRes.status === "fulfilled" && Array.isArray(examRes.value.data?.data)) {
        examList = examRes.value.data.data;
      }

      // Fallback: If filtered API returned empty array, try fetching all schedules/exams without filters
      if (schedList.length === 0 && (batchId || batchDocId || batchName)) {
        try {
          const fallbackSchedRes = await api.get("/api/schedules", { params: { populate: "*" } });
          if (Array.isArray(fallbackSchedRes.data?.data) && fallbackSchedRes.data.data.length > 0) {
            // Filter client side if batch matches or if fallback available
            schedList = fallbackSchedRes.data.data.filter((item) => {
              const b = item.batch || item.attributes?.batch;
              const bName = typeof b === "string" ? b : b?.name || b?.Name || b?.data?.attributes?.name;
              const bId = b?.id || b?.data?.id;
              const bDocId = b?.documentId || b?.data?.documentId;
              if (!batchName && !batchId && !batchDocId) return true;
              return bName === batchName || bId === batchId || bDocId === batchDocId;
            });
            if (schedList.length === 0) {
              schedList = fallbackSchedRes.data.data; // Show all if no direct batch match
            }
          }
        } catch (e) {
          console.warn("Schedule fallback query error:", e);
        }
      }

      if (examList.length === 0 && (batchId || batchDocId || batchName)) {
        try {
          const fallbackExamRes = await api.get("/api/exams", { params: { populate: "*" } });
          if (Array.isArray(fallbackExamRes.data?.data) && fallbackExamRes.data.data.length > 0) {
            examList = fallbackExamRes.data.data.filter((item) => {
              const b = item.batch || item.attributes?.batch;
              const bName = typeof b === "string" ? b : b?.name || b?.Name || b?.data?.attributes?.name;
              const bId = b?.id || b?.data?.id;
              const bDocId = b?.documentId || b?.data?.documentId;
              if (!batchName && !batchId && !batchDocId) return true;
              return bName === batchName || bId === batchId || bDocId === batchDocId;
            });
            if (examList.length === 0) {
              examList = fallbackExamRes.data.data;
            }
          }
        } catch (e) {
          console.warn("Exam fallback query error:", e);
        }
      }

      setSchedules(schedList);
      setExams(examList);
    } catch (err) {
      console.error("Failed to fetch timetable schedules/exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatScheduleItem = (raw) => {
    const item = raw.attributes || raw;
    const b = item.batch || item.attributes?.batch;
    const bName = typeof b === "string" ? b : b?.name || b?.Name || b?.data?.attributes?.name || b?.data?.attributes?.Name;

    const s = item.subject || item.Subject || item.chapter || item.attributes?.subject || item.attributes?.Subject;
    const sName = typeof s === "string" ? s : s?.Name || s?.name || s?.Title || s?.title || s?.data?.attributes?.Name || s?.data?.attributes?.Title;

    return {
      title: typeof item.title === "string" ? item.title : item.Topic || item.name || "Scheduled Class",
      subject: typeof sName === "string" ? sName : null,
      date: typeof item.date === "string" ? item.date : item.Date || item.start_time?.split("T")[0] || null,
      startTime: item.startTime || item.start_time?.split("T")[1]?.slice(0, 5) || null,
      endTime: item.endTime || item.end_time?.split("T")[1]?.slice(0, 5) || null,
      batch: typeof bName === "string" ? bName : null,
    };
  };

  const formatExamItem = (raw) => {
    const item = raw.attributes || raw;
    const b = item.batch || item.attributes?.batch;
    const bName = typeof b === "string" ? b : b?.name || b?.Name || b?.data?.attributes?.name || b?.data?.attributes?.Name;

    return {
      title: typeof item.title === "string" ? item.title : item.name || "Exam Assessment",
      date: typeof item.date === "string" ? item.date : item.start_time?.split("T")[0] || null,
      totalMarks: item.total_marks ?? item.totalMarks ?? null,
      batch: typeof bName === "string" ? bName : null,
    };
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-xs flex flex-col h-full">
      {/* Header */}
      <CardHeader className="p-4 border-b border-border/50 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <CardTitle className="text-base sm:text-lg font-bold">
              Timetable
            </CardTitle>
          </div>
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Minimal 2 Tabs: Schedule & Exam */}
        {hasBatch && (
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "schedule" ? "default" : "outline"}
              onClick={() => setActiveTab("schedule")}
              className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold py-1.5 px-4 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant={activeTab === "exam" ? "default" : "outline"}
              onClick={() => setActiveTab("exam")}
              className="flex-1 sm:flex-initial gap-1.5 text-xs font-semibold py-1.5 px-4 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Exam</span>
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Content View with fixed size (fits 3 items) and vertical scrollbar */}
      <CardContent className="p-2">
        {!hasBatch ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 min-h-[220px]">
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">No Batch Assigned</h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              No educational batch is currently assigned to your account. Please contact your admin or teacher to get enrolled.
            </p>
          </div>
        ) : (
          <>
            {/* SCHEDULE TAB CONTENT */}
            {activeTab === "schedule" && (
              <div className="max-h-62.5 min-h-57.5 overflow-y-auto pr-1 space-y-2 animate-in fade-in duration-200">
                {loading ? (
                  <div className="flex items-center justify-center h-50 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading schedule...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="flex items-center justify-center h-50">
                    <p className="text-xs text-muted-foreground font-medium">
                      No schedule available.
                    </p>
                  </div>
                ) : (
                  schedules.map((rawItem, idx) => {
                    const item = formatScheduleItem(rawItem);
                    return (
                      <div
                        key={rawItem.id || rawItem.documentId || idx}
                        className="p-3 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 transition-colors flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-md bg-background border border-border shrink-0 mt-0.5 sm:mt-0">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-bold text-foreground truncate leading-snug">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                              {item.subject && (
                                <span className="font-medium text-foreground/90">
                                  {item.subject}
                                </span>
                              )}
                              {item.date && <span>&bull; {item.date}</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                          {(item.startTime || item.endTime) && (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-background border border-border text-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3 text-primary" />
                              {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
                            </span>
                          )}
                          {item.batch && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.batch}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* EXAM TAB CONTENT */}
            {activeTab === "exam" && (
              <div className="max-h-62.5 min-h-57.5 overflow-y-auto pr-1 space-y-2 animate-in fade-in duration-200">
                {loading ? (
                  <div className="flex items-center justify-center h-50 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading exams...
                  </div>
                ) : exams.length === 0 ? (
                  <div className="flex items-center justify-center h-50">
                    <p className="text-xs text-muted-foreground font-medium">
                      No exams available.
                    </p>
                  </div>
                ) : (
                  exams.map((rawItem, idx) => {
                    const item = formatExamItem(rawItem);
                    return (
                      <div
                        key={rawItem.id || rawItem.documentId || idx}
                        className="p-3 rounded-lg bg-secondary/30 border border-border/40 hover:border-primary/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 rounded-md bg-background border border-border shrink-0 mt-0.5 sm:mt-0">
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-bold text-foreground truncate leading-snug">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-primary" />
                              <span>Date: {item.date || "TBD"}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                          {item.totalMarks !== undefined && item.totalMarks !== null && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              {item.totalMarks} Marks
                            </span>
                          )}
                          {item.batch && (
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {item.batch}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
