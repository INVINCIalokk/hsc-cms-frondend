"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpenText,
  Layers,
  BookOpen,
  User,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function QuickLinksSection() {
  const quickLinks = [
    {
      title: "Textbook Solutions",
      description:
        "Step-by-step textbook solutions & practice exercises by board and standard.",
      href: "/textbook-solution",
      icon: BookOpenText,
      badge: "Popular",
      color:
        "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Revision Decks",
      description:
        "Visual flashcard decks for quick chapter recap and exam prep.",
      href: "/revision-deck",
      icon: Layers,
      badge: "New",
      color:
        "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Resources Directory",
      description:
        "Explore categorized reference notes, formulas, and study documents.",
      href: "/resources",
      icon: BookOpen,
      badge: "Library",
      color:
        "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "My Profile",
      description:
        "Update your educational board, standard class, and account settings.",
      href: "/profile",
      icon: User,
      badge: "Settings",
      color:
        "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-4 mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-t border-border/60 pt-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <h2 className="sm:text-xl font-bold tracking-tight text-foreground">
            Quick Access Shortcuts
          </h2>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline-block">
          Jump directly to any section
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group block">
              <Card className="h-full border-border bg-card hover:border-primary/50 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group-hover:-translate-y-1">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg bg-linear-to-br border ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                      {item.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-4 pb-4 pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
