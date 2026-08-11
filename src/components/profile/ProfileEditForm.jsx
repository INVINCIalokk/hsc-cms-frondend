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
  X,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";

export default function ProfileEditForm({
  formData,
  user,
  boards,
  standards,
  selectedBoard,
  selectedStandard,
  loadingBoards,
  loadingStandards,
  isSaving,
  boardName,
  standardName,
  onChange,
  onBoardChange,
  onStandardChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          Edit Academic & Personal Information
        </h2>
        <span className="text-xs text-muted-foreground">
          Select your academic details below
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Board Dropdown (Shadcn Select) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span>Educational Board</span>
          </label>
          <Select
            value={selectedBoard}
            onValueChange={onBoardChange}
            disabled={loadingBoards || boards.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your board">
                {boards.find((item) => item.id.toString() === selectedBoard)
                  ?.Name ||
                  boardName ||
                  (boards.length === 0
                    ? "Loading boards..."
                    : "Select your board")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {boards.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.Name || item.attributes?.Name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* 2. Standard Dropdown (Shadcn Select - Cascaded from Board) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>Standard / Class</span>
          </label>
          <Select
            value={selectedStandard}
            onValueChange={onStandardChange}
            disabled={
              !selectedBoard || loadingStandards || standards.length === 0
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your standard">
                {standards.find(
                  (item) => item.id.toString() === selectedStandard,
                )?.Name ||
                  (!selectedBoard
                    ? "Select a board first"
                    : loadingStandards
                      ? "Loading standards..."
                      : standards.length === 0
                        ? "No standards found for this board"
                        : standardName || "Select your standard")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {standards.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.Name || item.attributes?.Name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

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
            onChange={onChange}
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
            value={user?.email || ""}
            disabled
            className="bg-muted/50 cursor-not-allowed opacity-70"
          />
        </div>

        {/* Age */}
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            placeholder="Enter your full address"
          />
        </div>
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
  );
}
