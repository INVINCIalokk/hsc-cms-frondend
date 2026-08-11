"use client";

import React from "react";

export default function WelcomeBanner() {
  return (
    <div className="bg-card mb-2 border p-4 rounded-xl shadow-xs">
      <h1 className="text-card-foreground text-xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="text-muted-foreground text-sm">
        Overview and quick links
      </p>
    </div>
  );
}
