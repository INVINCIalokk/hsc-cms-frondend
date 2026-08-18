import ExamClient from "./ExamClient";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// Required for Next.js static export (output: 'export') with dynamic routes
export async function generateStaticParams() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/exams`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((exam) => ({
          id: (exam.documentId || exam.id).toString(),
        }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch exams for static params (backend offline?):", error.message);
  }
  // Return fallback static param so Next.js static export compilation succeeds
  return [{ id: "placeholder" }];
}

export default function ExamPage({ params }) {
  return <ExamClient params={params} />;
}
