"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
  SelectContent,
} from "@/components/ui/select";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/apiClient";

export default function Home() {
  const { login } = useAuth();
  const [boards, setBoards] = useState([]);
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selection States
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedStandard, setSelectedStandard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Loading States
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingStandards, setLoadingStandards] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await api.get("/api/boards?sort=Name:asc");
        const data = await res.data;
        setBoards(data.data || []);
      } catch (error) {
        console.error("Error fetching boards:", error);
      } finally {
        setLoadingBoards(false);
      }
    };
    fetchBoards();
  }, []);

  useEffect(() => {
    // Safely extract the token from the URL in a static export
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      setLoading(true);

      // Send the token back to Strapi to verify and get the JWT + User data
      api
        .get(`/api/auth/google/callback?access_token=${accessToken}`)
        .then((res) => res.data)
        .then(async (data) => {
          if (data.jwt) {
            const userRes = await api.get("/api/users/me?populate=*", {
              headers: { Authorization: `Bearer ${data.jwt}` },
            });
            // Update global state and local storage
            login(userRes.data, data.jwt);

            // Clean up the URL to remove the access token without reloading the page
            window.history.replaceState({}, document.title, "/");
          }
        })
        .catch((err) => console.error("Auth error:", err))
        .finally(() => setLoading(false));
    }
  }, [login]);

  const handleBoardChange = async (boardId) => {
    setSelectedBoard(boardId);
    setSelectedStandard("");
    setSelectedSubject("");
    setStandards([]);
    setSubjects([]);
    setLoadingStandards(true);

    try {
      const res = await api.get(
        `/api/standards?filters[board][id][$eq]=${boardId}&sort=Name:asc`
      );
      const data = await res.data;
      setStandards(data.data || []);
    } catch (error) {
      console.error("Error fetching standards:", error);
    } finally {
      setLoadingStandards(false);
    }
  };

  const handleStandardChange = async (standardId) => {
    setSelectedStandard(standardId);
    setSelectedSubject("");
    setSubjects([]);
    setLoadingSubjects(true);

    try {
      const res = await api.get(
        `/api/subjects?filters[standard][id][$eq]=${standardId}&sort=Name:asc`
      );
      const data = await res.data;
      setSubjects(data.data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  return (
    <div className="flex sm:flex-row flex-col h-[50vh] md:h-[75vh] justify-center gap-10 items-center w-full max-w-7xl mx-auto">
      {/* Board Select */}
      <div>
        <Select
          value={selectedBoard}
          onValueChange={(value) => handleBoardChange(value)}
          disabled={loadingBoards || boards.length === 0}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select your board">
              {boards.find((item) => item.id.toString() === selectedBoard)
                ?.Name ||
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
      <div>
        <Select
          value={selectedStandard}
          onValueChange={(value) => handleStandardChange(value)}
          disabled={
            !selectedBoard || loadingStandards || standards.length === 0
          }
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select your standard">
              {standards.find((item) => item.id.toString() == selectedStandard)
                ?.Name ||
                (selectedBoard && standards.length === 0
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
      <div>
        <Select
          value={selectedSubject}
          disabled={
            !selectedStandard || loadingSubjects || subjects.length === 0
          }
          onValueChange={(value) => setSelectedSubject(value)}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select your subject">
              {subjects.find((item) => item.id.toString() == selectedSubject)
                ?.Name ||
                (selectedStandard && subjects === 0
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

      <div>
        <Button
          className="px-6 font-semibold cursor-pointer"
          disabled={!selectedSubject}
        >
          <Link href={`/chapters/${selectedSubject}`}>PROCEED</Link>
        </Button>
      </div>
    </div>
  );
}
