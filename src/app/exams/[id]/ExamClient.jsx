"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Lock,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  PlayCircle,
  Eye,
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
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/apiClient";
import UnauthenticatedCard from "@/components/profile/UnauthenticatedCard";
import { renderStrapiBlocks } from "@/lib/strapi-rich-text";

export default function ExamClient({ params }) {
  // Unwrap Next.js page params
  const resolvedParams = use(params);
  const examId = resolvedParams?.id;

  const { user } = useAuth();
  const router = useRouter();

  // Primary state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [myResult, setMyResult] = useState(null);

  // Active exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [question_id]: selected_option_key }
  const [startTime, setStartTime] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  // Review mode state
  const [isReviewMode, setIsReviewMode] = useState(false);

  useEffect(() => {
    if (!user || !examId) {
      setLoading(false);
      return;
    }
    fetchExamPaper();
  }, [user, examId]);

  // Fetch paper data & my-result
  const fetchExamPaper = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get paper data from GET /api/exams/:id/paper
      const res = await api.get(`/api/exams/${examId}/paper`);
      const payload = res.data?.data || res.data || {};

      const examInfo = {
        documentId: payload.documentId || payload.id,
        id: payload.id || payload.exam_id,
        title: payload.title || payload.name || "Exam Assessment",
        status: (payload.status || "inactive").toLowerCase(),
        duration_minutes: Number(payload.duration_minutes) || 60,
        total_marks: payload.total_marks,
        instructions: payload.instructions,
        can_view_solutions: payload.can_view_solutions,
      };

      const rawQuestions = payload.paper_questions || payload.questions || [];

      const parsedQuestions = rawQuestions.map((item, idx) => {
        const q = item.question || item;
        return {
          paper_question_id: item.id,
          order: item.order ?? (idx + 1),
          section_title: item.section_title || "",
          marks: item.marks_override ?? q.default_marks ?? 1,
          negative_marks: item.negative_marks_override ?? q.default_negative_marks ?? 0,

          id: q.id || item.id,
          documentId: q.documentId || item.documentId,
          question_number: q.Question_number || q.question_number || `Q${idx + 1}`,
          question_text: q.Question_Text || q.question_text || q.Question,
          question_type: q.Question_Type || q.question_type || "Standard",
          options: q.mcq_options || q.options || q.Option || [],
          solution: q.Solution || q.solution || q.explanation,
          solution_video_url: q.solution_video_url,
          question_image: q.question_image,
        };
      });

      setExamData(examInfo);
      setQuestions(parsedQuestions);

      const status = examInfo.status;

      // If active, initialize start_time and countdown timer
      if (status === "active") {
        const nowIso = new Date().toISOString();
        setStartTime(nowIso);

        const durationMins = examInfo.duration_minutes || 60;
        setRemainingSeconds(durationMins * 60);
      }

      // If completed, fetch user result from GET /api/exams/:id/my-result
      if (status === "completed") {
        setIsReviewMode(true);
        try {
          const resResult = await api.get(`/api/exams/${examId}/my-result`);
          setMyResult(resResult.data?.data || resResult.data || null);
        } catch (resErr) {
          console.warn("No previous result found or error fetching result:", resErr);
        }
      }
    } catch (err) {
      console.error("Error fetching exam paper:", err);
      if (err.response?.status === 403) {
        setError(
          err.response?.data?.error?.message ||
            "This exam is currently inactive.",
        );
      } else {
        setError("Failed to load exam data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Security listener for tab switching / screen blur
  useEffect(() => {
    const status = (examData?.status || "").toLowerCase();
    if (!examId || status !== "active" || submittedResult || isReviewMode) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          await api.post(`/api/exams/${examId}/lock`, {
            reason: `Tab switch detected at ${new Date().toLocaleTimeString()}`,
          });
          // Trigger re-fetch of exam paper state
          fetchExamPaper();
        } catch (err) {
          console.error("Failed to report tab switch:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [examId, examData?.status, submittedResult, isReviewMode]);

  // Countdown timer for active exam
  useEffect(() => {
    if (
      remainingSeconds === null ||
      remainingSeconds <= 0 ||
      submittedResult ||
      isReviewMode
    )
      return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit(); // Auto-submit on timer zero
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, submittedResult, isReviewMode]);

  const handleSelectOption = (questionId, optionKey) => {
    if (isReviewMode || submittedResult) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleClearOption = (questionId) => {
    if (isReviewMode || submittedResult) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSubmitExam = async () => {
    if (isSubmitting || submittedResult) return;

    setIsSubmitting(true);
    try {
      const payload = {
        start_time: startTime || new Date().toISOString(),
        responses: Object.entries(selectedAnswers).map(([qId, optKey]) => ({
          question_id: Number(qId),
          selected_option_key: optKey,
        })),
      };

      const res = await api.post(`/api/exams/${examId}/submit`, payload);
      const resultData = res.data?.data || res.data || {};
      setSubmittedResult(resultData);

      // Trigger lock API after paper submission as per user's strategy
      try {
        await api.post(`/api/exams/${examId}/lock`, {
          reason: `Paper submitted at ${new Date().toLocaleTimeString()}`,
        });
      } catch (lockErr) {
        console.warn("Failed to lock exam after submission:", lockErr);
      }
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert(
        "Failed to submit exam: " +
        (err.response?.data?.error?.message || err.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    if (!submittedResult && !isSubmitting) {
      handleSubmitExam();
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading assessment paper...</p>
      </div>
    );
  }

  const status = (examData?.status || "inactive").toLowerCase();
  const isLocked = status === "locked" || (error && error.toLowerCase().includes("lock"));

  // ----------------------------------------------------
  // STATE 1A: LOCKED EXAMINATION SCREEN
  // ----------------------------------------------------
  if (isLocked) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <Card className="border-rose-500/30 shadow-lg bg-card overflow-hidden">
          <CardHeader className="text-center p-6 sm:p-8 bg-rose-500/10 border-b border-rose-500/20">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 ring-4 ring-rose-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              Examination Locked
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Tab switch or security violation detected during your active test session.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-4 text-center">
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-2">
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                Your examination has been automatically suspended for anti-cheat security compliance.
              </p>
              <p className="text-xs text-muted-foreground">
                Please contact your instructor or administrator to unlock your examination.
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-6 bg-secondary/10 border-t border-border flex justify-between items-center">
            <Link href="/exams">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                Return to Exams
              </Button>
            </Link>
            <Button
              onClick={fetchExamPaper}
              variant="default"
              className="gap-2 cursor-pointer font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              <RotateCcw className="w-4 h-4" />
              Check Unlock Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 1B: INACTIVE / ERROR SCREEN
  // ----------------------------------------------------
  if (error || status === "inactive") {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <Card className="border-border shadow-md bg-card">
          <CardHeader className="text-center p-6 sm:p-8 bg-secondary/20 border-b border-border/50">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              {examData?.title || "Exam Currently Inactive"}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {error ||
                "This examination is not available for taking at this time."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 text-center">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  Total Marks
                </p>
                <p className="text-lg font-bold text-foreground">
                  {examData?.total_marks ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  Duration
                </p>
                <p className="text-lg font-bold text-foreground">
                  {examData?.duration_minutes
                    ? `${examData.duration_minutes} mins`
                    : "N/A"}
                </p>
              </div>
            </div>

            {examData?.instructions && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Instructions
                </p>
                <div className="text-sm text-foreground/80 leading-relaxed bg-background p-3 rounded-md border border-border">
                  {renderStrapiBlocks(examData.instructions) ||
                    "Follow the scheduled start time to attempt the examination."}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 bg-secondary/10 border-t border-border flex justify-between items-center">
            <Link href="/exams">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                Back to Exams List
              </Button>
            </Link>
            <Button
              onClick={fetchExamPaper}
              variant="default"
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Check Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUBMISSION SUCCESS MODAL / SUMMARY SCREEN
  // ----------------------------------------------------
  if (submittedResult) {
    return (
      <div className="flex flex-col w-full max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <Card className="border-border shadow-lg bg-card overflow-hidden">
          <CardHeader className="text-center p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-primary/10 to-teal-500/10 border-b border-border/50">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Exam Submitted Successfully!
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {submittedResult.message ||
                ((submittedResult.exam_result_status || submittedResult.status) === "submitted"
                  ? "Your paper has been submitted and is pending teacher evaluation."
                  : "Your answers have been evaluated and recorded.")}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {(submittedResult.exam_result_status || submittedResult.status) === "submitted" || submittedResult.type === "theory" ? (
              <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Evaluation Pending
                </p>
                <p className="text-base font-semibold text-foreground">
                  Your instructor will review and grade your theory paper manually.
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Paper Marks: <span className="font-extrabold text-foreground">{submittedResult.total_marks ?? "N/A"}</span>
                </p>
              </div>
            ) : (
              <>
                {/* Score Grid for Entrance Exams */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
                  <div className="p-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Obtained Score
                    </p>
                    <p className="text-xl font-extrabold text-primary">
                      {submittedResult.obtained_marks ?? 0} / {submittedResult.total_marks ?? "N/A"}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Correct
                    </p>
                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {submittedResult.correct_count ?? 0}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Incorrect
                    </p>
                    <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                      {submittedResult.incorrect_count ?? 0}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold">
                      Accuracy
                    </p>
                    <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                      {submittedResult.accuracy_percentage
                        ? `${submittedResult.accuracy_percentage}%`
                        : "0%"}
                    </p>
                  </div>
                </div>

                {submittedResult.remarks && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Remarks
                    </p>
                    <p className="text-lg font-extrabold text-primary mt-0.5">
                      {submittedResult.remarks}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="p-6 bg-secondary/10 border-t border-border flex justify-between gap-3">
            <Link href="/exams">
              <Button variant="outline" className="gap-2 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
                Return to Exams
              </Button>
            </Link>
            <Button
              onClick={() => {
                setSubmittedResult(null);
                setIsReviewMode(true);
                fetchExamPaper();
              }}
              className="gap-2 cursor-pointer font-bold"
            >
              <Eye className="w-4 h-4" />
              Review Solutions
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE 2 & 3: ACTIVE EXAM & COMPLETED SOLUTION REVIEW
  // ----------------------------------------------------
  const currentQuestion = questions[currentIndex] || {};
  const questionId = currentQuestion.id || currentQuestion.documentId;
  const options = currentQuestion.options || [];

  // Format remaining time (MM:SS)
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-2 py-4 animate-in fade-in duration-300 space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/exams">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-foreground line-clamp-1">
              {examData?.title || "Exam Assessment"}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>&bull;</span>
              <span className="font-semibold text-primary">
                {examData?.type || "Theory"}
              </span>
            </p>
          </div>
        </div>

        {/* Timer or Review Badge */}
        {!isReviewMode ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-base font-extrabold font-mono tracking-wider">
              {formatTime(remainingSeconds)}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <FileCheck className="w-4 h-4" />
            <span>Solution Review Mode</span>
          </div>
        )}
      </div>

      {/* Main Grid: Question View Left & Palette Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: Question Card (Col-span-3) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-border bg-card shadow-xs min-h-[420px] flex flex-col justify-between">
            <CardHeader className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {currentQuestion.section_title && (
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {currentQuestion.section_title}
                    </span>
                  )}
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                    Q{currentQuestion.question_number || currentIndex + 1}
                  </span>
                </div>

                <span className="text-xs font-semibold text-muted-foreground">
                  Marks: {currentQuestion.marks}
                </span>
              </div>

              <div className="text-base font-semibold text-foreground leading-relaxed">
                {renderStrapiBlocks(currentQuestion.question_text) || (
                  <p className="text-muted-foreground italic">No Question Text Provided</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-3 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Options:
              </p>

              {/* Render Options */}
              {Array.isArray(options) && options.length > 0 ? (
                <div className="space-y-2.5">
                  {options.map((opt, idx) => {
                    const optionKey =
                      opt.option_key ||
                      opt.key ||
                      String.fromCharCode(65 + idx);
                    const isSelected =
                      selectedAnswers[questionId] === optionKey;
                    const isCorrectOption = opt.is_correct || opt.isCorrect;

                    let btnStyle =
                      "bg-secondary/20 border-border hover:border-primary/50 text-foreground";
                    if (!isReviewMode && isSelected) {
                      btnStyle =
                        "bg-primary/10 border-primary text-primary font-bold shadow-xs";
                    } else if (isReviewMode) {
                      if (isCorrectOption) {
                        btnStyle =
                          "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold";
                      } else if (isSelected && !isCorrectOption) {
                        btnStyle =
                          "bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-bold";
                      }
                    }

                    return (
                      <button
                        key={optionKey || idx}
                        type="button"
                        onClick={() =>
                          handleSelectOption(questionId, optionKey)
                        }
                        disabled={isReviewMode}
                        className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center text-xs font-bold shrink-0">
                            {optionKey}
                          </span>
                          <div className="text-sm font-medium">
                            {renderStrapiBlocks(opt.option_text || opt.text || opt.value) ||
                              `Option ${optionKey}`}
                          </div>
                        </div>

                        {isReviewMode && isCorrectOption && (
                          <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4" /> Correct Answer
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No options listed for this question.
                </p>
              )}

              {/* Solution Block in Review Mode */}
              {isReviewMode && currentQuestion.solution && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5 animate-in fade-in">
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Detailed Solution:
                  </p>
                  <div className="text-xs text-foreground/90 leading-relaxed font-sans overflow-x-auto">
                    {renderStrapiBlocks(currentQuestion.solution)}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="p-4 border-t border-border/50 flex justify-between items-center bg-secondary/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              {!isReviewMode && selectedAnswers[questionId] && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearOption(questionId)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear Selection
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1),
                  )
                }
                disabled={currentIndex === questions.length - 1}
                className="gap-1.5 cursor-pointer"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right: Question Palette & Submission Action (Col-span-1) */}
        <div className="space-y-4">
          {/* Question Palette Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Question Palette</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {Object.keys(selectedAnswers).length}/{questions.length}{" "}
                  Attempted
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const qId = q.id || q.documentId;
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!selectedAnswers[qId];

                  let badgeStyle =
                    "bg-secondary/40 text-muted-foreground border-border hover:border-primary/50";
                  if (isCurrent) {
                    badgeStyle =
                      "bg-primary text-primary-foreground font-bold ring-2 ring-primary/30";
                  } else if (isAnswered) {
                    badgeStyle =
                      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold";
                  }

                  return (
                    <button
                      key={qId || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 w-full rounded-md border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${badgeStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary" /> Current
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />{" "}
                  Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-secondary border border-border" />{" "}
                  Unanswered
                </div>
              </div>
            </CardContent>

            {!isReviewMode && (
              <CardFooter className="p-4 border-t border-border/50 bg-secondary/10">
                <Button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="w-full gap-2 cursor-pointer font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Examination
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
