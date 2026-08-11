"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileAlerts({
  successMsg,
  errorMsg,
  hasIncompleteFields,
  isEditing,
  onStartEditing,
}) {
  return (
    <div className="space-y-4">
      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-foreground flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Incomplete Fields Callout */}
      {hasIncompleteFields && !isEditing && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-foreground flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium">
              Your profile is missing details (Board, Standard, Age, Mobile, or
              Address). Complete your information below!
            </p>
          </div>
          <Button
            size="sm"
            variant="default"
            className="gap-1.5 cursor-pointer font-medium"
            onClick={onStartEditing}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Fill Details</span>
          </Button>
        </div>
      )}
    </div>
  );
}
