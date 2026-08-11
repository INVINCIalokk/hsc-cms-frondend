"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowLeft, LogOut } from "lucide-react";
import api from "@/lib/apiClient";

// Profile Sub-components
import UnauthenticatedCard from "@/components/profile/UnauthenticatedCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAlerts from "@/components/profile/ProfileAlerts";
import ProfileOverview from "@/components/profile/ProfileOverview";
import ProfileEditForm from "@/components/profile/ProfileEditForm";

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

  // Board & Standard Cascading State
  const [boards, setBoards] = useState([]);
  const [standards, setStandards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadingStandards, setLoadingStandards] = useState(false);

  // Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Populate form data & selection IDs when user object is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        age: user.age ?? "",
        mobile_number: user.mobile_number || "",
        address: user.address || "",
      });

      const bId = user.board?.id
        ? user.board.id.toString()
        : user.board?.data?.id
          ? user.board.data.id.toString()
          : "";
      const sId = user.standard?.id
        ? user.standard.id.toString()
        : user.standard?.data?.id
          ? user.standard.data.id.toString()
          : "";

      setSelectedBoard(bId);
      setSelectedStandard(sId);
    }
  }, [user]);

  // Fetch initial boards list when entering edit mode
  useEffect(() => {
    if (isEditing) {
      fetchBoards();
    }
  }, [isEditing]);

  const fetchBoards = async () => {
    setLoadingBoards(true);
    try {
      const res = await api.get("/api/boards?sort=Name:asc");
      setBoards(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching boards:", err);
    } finally {
      setLoadingBoards(false);
    }
  };

  // Fetch standards whenever selectedBoard changes in edit mode
  useEffect(() => {
    if (isEditing && selectedBoard) {
      fetchStandardsForBoard(selectedBoard);
    } else if (isEditing && !selectedBoard) {
      setStandards([]);
    }
  }, [selectedBoard, isEditing]);

  const fetchStandardsForBoard = async (boardId) => {
    setLoadingStandards(true);
    try {
      const res = await api.get(
        `/api/standards?filters[board][id][$eq]=${boardId}&sort=Name:asc`,
      );
      setStandards(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching standards:", err);
    } finally {
      setLoadingStandards(false);
    }
  };

  const handleBoardChange = (boardId) => {
    setSelectedBoard(boardId);
    setSelectedStandard(""); // Reset standard when board changes
    setStandards([]);
  };

  const handleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_STRAPI_URL
      ? `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/connect/google`
      : "http://localhost:1337/api/connect/google";
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
      const targetEndpoint = `/api/users/${user.id}?populate=*`;

      const payload = {
        username: formData.username,
        age: formData.age !== "" ? Number(formData.age) : null,
        mobile_number: formData.mobile_number,
        address: formData.address,
        board: selectedBoard ? Number(selectedBoard) : null,
        standard: selectedStandard ? Number(selectedStandard) : null,
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
          "Failed to update profile. Please ensure Strapi permissions are configured.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // If user is not logged in, render login CTA card
  if (!user) {
    return <UnauthenticatedCard onLogin={handleLogin} />;
  }

  // Safe check for missing profile fields
  const hasIncompleteFields =
    !user.age ||
    !user.mobile_number ||
    !user.address ||
    !user.board ||
    !user.standard;

  // Extract board & standard names for display
  const boardName = user.board?.Name || user.board?.attributes?.Name || null;
  const standardName =
    user.standard?.Name || user.standard?.attributes?.Name || null;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-2 py-2 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="relative flex items-center justify-center mb-2 pb-2 border-b border-border w-full">
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
      <ProfileAlerts
        successMsg={successMsg}
        errorMsg={errorMsg}
        hasIncompleteFields={hasIncompleteFields}
        isEditing={isEditing}
        onStartEditing={() => setIsEditing(true)}
      />

      {/* Main Profile Card */}
      <Card className="w-full border-border shadow-md bg-card overflow-hidden mt-2">
        {/* Profile Header (Avatar on left, Name/Email/Badges on right) */}
        <ProfileHeader
          user={user}
          isEditing={isEditing}
          onEditToggle={() => setIsEditing(true)}
        />

        {/* Content Section: Read-only Overview OR Edit Form */}
        <CardContent className="p-6 md:p-8">
          {isEditing ? (
            <ProfileEditForm
              formData={formData}
              user={user}
              boards={boards}
              standards={standards}
              selectedBoard={selectedBoard}
              selectedStandard={selectedStandard}
              loadingBoards={loadingBoards}
              loadingStandards={loadingStandards}
              isSaving={isSaving}
              boardName={boardName}
              standardName={standardName}
              onChange={handleChange}
              onBoardChange={handleBoardChange}
              onStandardChange={setSelectedStandard}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ProfileOverview
              user={user}
              boardName={boardName}
              standardName={standardName}
            />
          )}
        </CardContent>

        {/* Card Footer */}
        <CardFooter className="p-6 md:p-8 bg-secondary/10 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Logged in as{" "}
            <strong className="text-foreground">{user.username}</strong>
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
