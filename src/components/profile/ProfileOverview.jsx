"use client";

import React from "react";
import {
  GraduationCap,
  Layers,
  User,
  Mail,
  Calendar,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function ProfileOverview({ user, boardName, standardName }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground tracking-tight border-b border-border/40 pb-2">
        Account & Academic Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Educational Board Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Educational Board
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {boardName || (
                <span className="text-muted-foreground italic text-sm font-normal">
                  Not selected
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Standard / Class Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Standard / Class
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {standardName || (
                <span className="text-muted-foreground italic text-sm font-normal">
                  Not selected
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Username Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <User className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Username
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {user?.username || "N/A"}
            </p>
          </div>
        </div>

        {/* Email Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <Mail className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Email Address
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {user?.email || "N/A"}
            </p>
          </div>
        </div>

        {/* Age Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Age
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {user?.age !== null &&
              user?.age !== undefined &&
              user?.age !== "" ? (
                `${user.age} years old`
              ) : (
                <span className="text-muted-foreground italic text-sm font-normal">
                  Not provided
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Mobile Number Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <Phone className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Mobile Number
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {user?.mobile_number ? (
                user.mobile_number
              ) : (
                <span className="text-muted-foreground italic text-sm font-normal">
                  Not provided
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Address Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50 md:col-span-2">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Address
            </p>
            <p className="text-base font-semibold text-foreground truncate">
              {user?.address ? (
                user.address
              ) : (
                <span className="text-muted-foreground italic text-sm font-normal">
                  Not provided
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Joined On Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50 md:col-span-2">
          <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              User ID & Joined On
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              ID: {user?.id || user?.documentId} &bull; Joined:{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Active Member"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
