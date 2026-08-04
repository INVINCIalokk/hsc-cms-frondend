"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  ArrowLeft,
  BookOpen,
  Edit3,
  Phone,
  MapPin,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "@/lib/apiClient";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();

  // State for toggling edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    mobile_number: "",
    address: "",
  });

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Populate form with user data when user is loaded or changed
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        age: user.age ?? "",
        mobile_number: user.mobile_number || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_STRAPI_URL
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/connect/google`
      : "http://localhost:1337/api/connect/google";
  };

  const getAvatarUrl = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User"
    )}&background=ffeb3b&color=000&size=128`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setErrorMsg("User session not found.");
      return;
    }

    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const targetEndpoint = `/api/users/${user.id}`;

      const payload = {
        username: formData.username,
        age: formData.age !== "" ? Number(formData.age) : null,
        mobile_number: formData.mobile_number,
        address: formData.address,
      };

      const res = await api.put(targetEndpoint, payload);
      const updatedUser = res.data;

      // Update global context & local storage
      updateUser(updatedUser);

      setSuccessMsg("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg(
        err.response?.data?.error?.message ||
          "Failed to update profile. Please ensure Strapi permissions are configured."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // If user is not logged in, render the login CTA card safely
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-300">
        <Card className="w-full text-center border-border shadow-md bg-card">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-2">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">You are not logged in</CardTitle>
            <CardDescription className="text-base mt-1">
              Please sign in with your account to view your profile details and access learning materials.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto font-semibold px-8 cursor-pointer"
              onClick={handleLogin}
            >
              Log in with Google
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full cursor-pointer">
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Safe check for missing profile fields
  const hasIncompleteFields = !user.age || !user.mobile_number || !user.address;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* Top Header & Navigation */}
      <div className="relative flex items-center justify-center mb-6 pb-4 border-b border-border w-full">
        <Link href="/" className="absolute left-0">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full cursor-pointer hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-foreground flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {hasIncompleteFields && !isEditing && (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-foreground flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium">
              Your profile is missing details (age, Mobile Number, or Address). Complete your information below!
            </p>
          </div>
          <Button
            size="sm"
            variant="default"
            className="gap-1.5 cursor-pointer font-medium"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Fill Details</span>
          </Button>
        </div>
      )}

      {/* Main Profile Card */}
      <Card className="w-full border-border shadow-md bg-card overflow-hidden">
        <CardHeader className="bg-secondary/20 border-b border-border/50 pb-8 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={getAvatarUrl(user.username)}
                alt={`${user.username || "User"}'s avatar`}
                className="w-24 h-24 rounded-full ring-4 ring-primary/20 shadow-md object-cover"
              />
              <div className="text-center sm:text-left space-y-1 mt-1">
                <CardTitle className="text-3xl font-extrabold tracking-tight">
                  {user.username || "GyanLab Student"}
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{user.email || "No email linked"}</span>
                </CardDescription>
                <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Active Account
                  </span>
                  {user.provider && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                      Provider: {user.provider.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle Edit Button */}
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="gap-2 cursor-pointer border-primary/30 hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {isEditing ? (
            /* EDIT FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="text-lg font-semibold text-foreground tracking-tight">
                  Edit Personal Information
                </h2>
                <span className="text-xs text-muted-foreground">Fields marked are editable</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Username</span>
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>

                {/* Email (Readonly) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>Email Address (Google Account)</span>
                  </label>
                  <Input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted/50 cursor-not-allowed opacity-70"
                  />
                </div>

                {/* age */}
                <div className="space-y-2">
                  <label
                    htmlFor="age"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Age</span>
                  </label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 18"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <label
                    htmlFor="mobile_number"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>Mobile Number</span>
                  </label>
                  <Input
                    id="mobile_number"
                    name="mobile_number"
                    type="tel"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <label
                    htmlFor="address"
                    className="text-sm font-medium text-foreground flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Address</span>
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="gap-2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="gap-2 cursor-pointer font-semibold px-6"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Profile</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            /* READ-ONLY DISPLAY VIEW */
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-foreground tracking-tight border-b border-border/40 pb-2">
                Account Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Username
                    </p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {user.username || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email Address
                    </p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {user.email || "N/A"}
                    </p>
                  </div>
                </div>

                {/* age */}
                <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Age
                    </p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {user.age !== null && user.age !== undefined && user.age !== "" ? (
                        `${user.age} years old`
                      ) : (
                        <span className="text-muted-foreground italic text-sm">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Mobile Number
                    </p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {user.mobile_number ? (
                        user.mobile_number
                      ) : (
                        <span className="text-muted-foreground italic text-sm">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50 md:col-span-2">
                  <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Address
                    </p>
                    <p className="text-base font-semibold text-foreground truncate">
                      {user.address ? (
                        user.address
                      ) : (
                        <span className="text-muted-foreground italic text-sm">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Joined On */}
                <div className="flex items-center gap-3.5 p-4 rounded-lg bg-secondary/30 border border-border/50 md:col-span-2">
                  <div className="p-2.5 rounded-md bg-background text-primary shadow-xs">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User ID & Joined On
                    </p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      ID: {user.id || user.documentId} &bull; Joined:{" "}
                      {user.createdAt
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
          )}
        </CardContent>

        <CardFooter className="p-6 md:p-8 bg-secondary/10 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Logged in as <strong className="text-foreground">{user.username}</strong>
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Link href="/" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full cursor-pointer">
                Back to Dashboard
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="flex-1 sm:flex-initial gap-2 cursor-pointer"
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
