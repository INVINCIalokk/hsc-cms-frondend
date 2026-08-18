import { Button } from "@/components/ui/button";
import Link from "next/link";
import qs from "qs";
import StudyRoomClient from "./StudyRoomClient";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/exercises`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((exercise) => ({
        exerciseId: exercise.id.toString(),
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch exercises for static params (backend offline?):", error.message);
  }
  // Return fallback static param so Next.js static export compilation succeeds
  return [{ exerciseId: "1" }];
}

export default async function StudyRoomPage({ params }) {
  const resolvedParams = await params;
  const exerciseId = resolvedParams.exerciseId;

  // Fetch Questions linked specifically to this exercise
  let questions = [];
  try {
    const query = qs.stringify(
      {
        filters: { exercise: { id: { $eq: exerciseId } } },
      },
      { encodeValuesOnly: true }
    );
    const res = await fetch(`${STRAPI_URL}/api/questions?${query}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      questions = data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch questions:", error);
  }

  return (
    <div className="flex flex-col min-h-screen max-w-4xl w-full bg-background rounded mb-8 mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Exercise</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="p-12 text-center bg-secondary rounded-lg">
          <p className="text-muted-foreground text-lg">
            No questions found for this exercise yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <StudyRoomClient questions={questions} />
        </div>
      )}
    </div>
  );
}