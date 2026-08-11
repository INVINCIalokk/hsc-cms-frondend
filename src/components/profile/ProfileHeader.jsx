"use client";

import React from "react";
import { Mail, ShieldCheck, Edit3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProfileHeader({ user, isEditing, onEditToggle }) {
  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User",
    )}&background=ffeb3b&color=000&size=128`;
  };

  // Safely extract batch name from user object
  const batchName =
    user?.batch?.name ||
    user?.batch?.Name ||
    user?.batch?.attributes?.name ||
    null;

  return (
    <CardHeader className="bg-secondary/20 border-b border-border/50 pb-8 pt-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left: Profile Pic (Avatar) & Right: User Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 w-full sm:w-auto">
          {/* Avatar on Left */}
          <img
            src={getAvatarUrl(user?.username)}
            alt={`${user?.username || "User"}'s avatar`}
            className="w-20 h-20 rounded-full ring-4 ring-primary/20 shadow-md object-cover shrink-0"
          />

          {/* Name & Mail on Right of Avatar */}
          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              {user?.username || "GyanLab Student"}
            </CardTitle>

            <CardDescription className="text-base text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span>{user?.email || "No email linked"}</span>
            </CardDescription>

            {/* Badges: Active & Batch (Provider removed as requested) */}
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2 items-center">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Active Account
              </span>

              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span>
                  Batch:{" "}
                  {batchName ? (
                    <strong className="font-bold">{batchName}</strong>
                  ) : (
                    <span className="text-muted-foreground font-normal">
                      Not Assigned
                    </span>
                  )}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action: Edit Profile Button */}
        {!isEditing && (
          <Button
            variant="outline"
            onClick={onEditToggle}
            className="gap-2 cursor-pointer border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors shrink-0 self-center sm:self-start mt-2 sm:mt-0"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>
    </CardHeader>
  );
}
