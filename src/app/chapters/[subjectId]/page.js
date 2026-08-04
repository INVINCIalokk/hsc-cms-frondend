import { Button } from "@/components/ui/button";
import Link from "next/link";

const STRAPI_URL = "http://localhost:1337";

// 1. Tell Next.js all the possible [subjectId] routes to build statically at compile time
export async function generateStaticParams() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/subjects`);
    const data = await res.json();

    // Return an array of objects representing the params: [{ subjectId: '1' }, { subjectId: '2' }]
    return data.data.map((subject) => ({
      subjectId: subject.id.toString(),
    }));
  } catch (error) {
    console.error("Failed to fetch subjects for static params:", error);
    return [];
  }
}

export default async function ChaptersPage({ params }) {
  const resolvedParams = await params;
  const subjectId = resolvedParams.subjectId;

  let chapters = [];
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/chapters?filters[subject][id][$eq]=${subjectId}&sort=Chapter_Number:asc`,
    );
    const data = await res.json();
    chapters = data.data || [];
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
  }

  return (
    <div className="flex flex-col min-h-screen max-w-7xl w-full bg-card rounded mb-8">
      {/* Header Section */}
      <h1 className="text-2xl uppercase font-semibold my-2 py-2 pl-4">
        Chapters
      </h1>

      {/* Chapters Grid */}
      {chapters.length === 0 ? (
        <div className="p-8 text-center bg-gray-100 rounded-lg">
          <p className="text-gray-600">
            No chapters found for this subject yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mx-4">
          {chapters.map((chapter) => {
            const chapterTitle =
              chapter?.attributes?.Title ||
              chapter?.Title ||
              "Untitled Chapter";
            const chapterNumber =
              chapter?.attributes?.Chapter_Number ||
              chapter?.Chapter_Number ||
              "";

            return (
              <div
                key={chapter.id}
                className="flex flex-col p-4 border rounded shadow-sm hover:shadow-md transition-shadow bg-secondary"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-card-foreground bg-card px-2 py-1 rounded">
                    Chapter {chapterNumber}
                  </span>
                </div>

                <h2 className="text-lg font-semibold mb-2">{chapterTitle}</h2>

                <div className="mt-auto pt-2">
                    <Link href={`/exercises/${chapter.id}`} >
                    <Button
                      className="w-full text-center text-white transition-colors cursor-pointer"
                    >
                      Exercises
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
