"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CurriculumSelector from "@/components/CurriculumSelector";
import api from "@/lib/apiClient";

export default function Home() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Automatically redirect logged-in users to /dashboard
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const token =
      urlParams.get("access_token") ||
      urlParams.get("id_token") ||
      urlParams.get("code") ||
      urlParams.get("raw[access_token]") ||
      urlParams.get("raw[id_token]");

    if (token) {
      const queryString = urlParams.toString();
      api
        .get(`/api/auth/google/callback?${queryString}`)
        .then((res) => res.data)
        .then(async (data) => {
          if (data.jwt) {
            const userRes = await api.get("/api/users/me?populate=*", {
              headers: { Authorization: `Bearer ${data.jwt}` },
            });
            // Update global state and local storage
            login(userRes.data, data.jwt);

            // Clean up the URL query params & redirect to dashboard
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push("/dashboard");
          }
        })
        .catch((err) => console.error("Auth error:", err));
    }
  }, [login, router]);

  // If user is logged in, return null while redirecting to /dashboard
  if (user) {
    return null;
  }

  // Non-logged-in guest landing page
  return (
    <div className="flex flex-col min-h-[70vh] justify-center items-center w-full max-w-7xl mx-auto px-4 py-8">
      <CurriculumSelector prefillFromUser={false} />
    </div>
  );
}
