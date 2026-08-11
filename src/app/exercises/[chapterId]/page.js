import { Button } from "@/components/ui/button";
import Link from "next/link";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Generate static routes for chapters
export async function generateStaticParams() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/chapters`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data.map((chapter) => ({
        chapterId: chapter.id.toString(),
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch chapters for static params (backend offline?):", error.message);
  }
  // Return fallback static param so Next.js static export compilation succeeds
  return [{ chapterId: "1" }];
}

export default async function ExercisesPage({ params }) {
  const resolvedParams = await params;
  const chapterId = resolvedParams.chapterId;

  let exercises = [];
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/exercises?filters[chapter][id][$eq]=${chapterId}&sort=Title:asc`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      const data = await res.json();
      exercises = data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
  }

  return (
    <div className="flex flex-col min-h-screen max-w-7xl w-full bg-card rounded mb-8 mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center my-2 py-2 pl-4 pr-4 border-b">
        <h1 className="text-2xl uppercase font-semibold">Exercises</h1>
        <Button variant="outline" asChild>
          <Link href="/">Back to Subjects</Link>
        </Button>
      </div>

      {/* Exercises Grid */}
      {exercises.length === 0 ? (
        <div className="p-8 mt-4 text-center bg-gray-100 dark:bg-zinc-800 rounded-lg mx-4">
          <p className="text-gray-600 dark:text-gray-300">
            No exercises found for this chapter yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 mx-4 mt-6">
          {exercises.map((exercise) => {
            const exerciseTitle =
              exercise?.attributes?.Title || exercise?.Title || "Untitled Exercise";

            return (
              <div
                key={exercise.id}
                className="flex flex-col p-5 border rounded shadow-sm hover:shadow-md transition-shadow bg-secondary"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-card-foreground bg-card px-2 py-1 rounded">
                    {exerciseTitle}
                  </span>
                </div>

                <div className="mt-auto pt-2">
                  <Link href={`/study-room/${exercise.id}`}>
                    <Button className="w-full text-center text-white transition-colors cursor-pointer">
                      Questions
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}