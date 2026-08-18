"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/apiClient";

export default function CurriculumSelector({ prefillFromUser = true }) {
  const { user } = useAuth();

  const [boards, setBoards] = useState([]);
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingStandards, setLoadingStandards] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // 1. Fetch all boards on mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get("/api/boards", {
          params: { sort: "Name:asc" },
        });
        setBoards(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setLoadingBoards(false);
      }
    };
    fetchBoards();
  }, []);

  // 2. Pre-fill from user context if available and enabled
  useEffect(() => {
    if (prefillFromUser && user) {
      const uBoardId = user.board?.id
        ? user.board.id.toString()
        : user.board?.data?.id
        ? user.board.data.id.toString()
        : "";
      const uStandardId = user.standard?.id
        ? user.standard.id.toString()
        : user.standard?.data?.id
        ? user.standard.data.id.toString()
        : "";

      if (uBoardId) {
        setSelectedBoard(uBoardId);
        fetchStandards(uBoardId, uStandardId);
      }
    }
  }, [user, prefillFromUser]);

  const fetchStandards = async (boardId, initialStandardId = "") => {
    setLoadingStandards(true);
    try {
      const res = await api.get("/api/standards", {
        params: {
          filters: { board: { id: { $eq: boardId } } },
          sort: "Name:asc",
        },
      });
      const fetchedStandards = res.data?.data || [];
      setStandards(fetchedStandards);

      if (initialStandardId) {
        setSelectedStandard(initialStandardId);
        fetchSubjects(initialStandardId);
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
    } finally {
      setLoadingStandards(false);
    }
  };

  const fetchSubjects = async (standardId) => {
    setLoadingSubjects(true);
    try {
      const res = await api.get("/api/subjects", {
        params: {
          filters: { standard: { id: { $eq: standardId } } },
          sort: "Name:asc",
        },
      });
      setSubjects(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleBoardChange = (boardId) => {
    setSelectedBoard(boardId);
    setSelectedStandard("");
    setSelectedSubject("");
    setStandards([]);
    setSubjects([]);
    fetchStandards(boardId);
  };

  const handleStandardChange = (standardId) => {
    setSelectedStandard(standardId);
    setSelectedSubject("");
    setSubjects([]);
    fetchSubjects(standardId);
  };

  return (
    <div className="flex sm:flex-row flex-col justify-center gap-6 md:gap-10 items-center w-full max-w-7xl mx-auto p-4">
      {/* Board Select */}
      <div className="w-full sm:w-auto">
        <Select
          value={selectedBoard}
          onValueChange={(value) => handleBoardChange(value)}
          disabled={loadingBoards || boards.length === 0}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select your board">
              {boards.find((item) => item.id.toString() === selectedBoard)?.Name ||
                (boards.length === 0 ? "No boards found" : "Select your board")}
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

      {/* Standard Select */}
      <div className="w-full sm:w-auto">
        <Select
          value={selectedStandard}
          onValueChange={(value) => handleStandardChange(value)}
          disabled={!selectedBoard || loadingStandards || standards.length === 0}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select your standard">
              {standards.find((item) => item.id.toString() === selectedStandard)?.Name ||
                (!selectedBoard
                  ? "Select a board first"
                  : loadingStandards
                  ? "Loading standards..."
                  : standards.length === 0
                  ? "No standards found"
                  : "Select your standard")}
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

      {/* Subject Select */}
      <div className="w-full sm:w-auto">
        <Select
          value={selectedSubject}
          disabled={!selectedStandard || loadingSubjects || subjects.length === 0}
          onValueChange={(value) => setSelectedSubject(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select your subject">
              {subjects.find((item) => item.id.toString() === selectedSubject)?.Name ||
                (!selectedStandard
                  ? "Select a standard first"
                  : loadingSubjects
                  ? "Loading subjects..."
                  : subjects.length === 0
                  ? "No subjects found"
                  : "Select your Subject")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {subjects.map((item) => (
                <SelectItem key={item.id} value={item.id.toString()}>
                  {item.Name || item.attributes?.Name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* PROCEED Button */}
      <div className="w-full sm:w-auto flex justify-center">
        <Button
          className="px-6 font-semibold cursor-pointer w-full sm:w-auto"
          disabled={!selectedSubject}
        >
          <Link href={`/chapters/${selectedSubject}`}>PROCEED</Link>
        </Button>
      </div>
    </div>
  );
}
