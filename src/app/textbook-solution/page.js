"use client";

import React from "react";
import CurriculumSelector from "@/components/CurriculumSelector";
import { BookOpenText } from "lucide-react";

export default function TextbookSolutionPage() {
  return (
    <div className="flex flex-col min-h-[70vh] w-full max-w-7xl mx-auto px-4 py-8 items-center justify-center animate-in fade-in duration-300">
      <div className="text-center mb-8 space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <BookOpenText className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Textbook Solutions</h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
          Select your Board, Standard, and Subject to access comprehensive chapter-wise textbook solutions and practice exercises.
        </p>
      </div>

      <div className="w-full bg-card rounded-xl border border-border shadow-sm p-4 sm:p-8">
        <CurriculumSelector prefillFromUser={true} />
      </div>
    </div>
  );
}
