"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

export default function UnauthenticatedCard({ onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <Card className="w-full text-center border-border shadow-md bg-card">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            You are not logged in
          </CardTitle>
          <CardDescription className="text-base mt-1">
            Please sign in with your account to view your profile details and
            access learning materials.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="w-full sm:w-auto font-semibold px-8 cursor-pointer"
            onClick={onLogin}
          >
            Log in with Google
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full cursor-pointer"
            >
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
