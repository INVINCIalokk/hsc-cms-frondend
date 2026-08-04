import { Button } from "@/components/ui/button";
import Link from "next/link";
import StudyRoomClient from "./StudyRoomClient";

const STRAPI_URL = "http://localhost:1337";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/exercises`);
    const data = await res.json();
    
    return data.data.map((exercise) => ({
      exerciseId: exercise.id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch exercises for static params:", error);
    return [];
  }
}

export default async function StudyRoomPage({ params }) {
  const resolvedParams = await params;
  const exerciseId = resolvedParams.exerciseId;

  // Fetch Questions linked specifically to this exercise
  let questions = [];
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/questions?filters[exercise][id][$eq]=${exerciseId}`
    );
    const data = await res.json();
    questions = data.data || [];
  } catch (error) {
    console.error("Failed to fetch questions:", error);
  }

  return (
    <div className="flex flex-col min-h-screen max-w-4xl w-full bg-background rounded mb-8 mx-auto p-4 md:p-8">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Excercise</h1>
        </div>
        <Link href="/">
          <Button variant="outline">
            {/* A generic back button. Depending on your routing, you might want to adjust this href */}
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="p-12 text-center bg-secondary rounded-lg">
          <p className="text-muted-foreground text-lg">No questions found for this exercise yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
            <StudyRoomClient
              questions={questions} 
            />
        </div>
      )}
    </div>
  );
}