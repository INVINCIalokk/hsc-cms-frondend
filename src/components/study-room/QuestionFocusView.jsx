import { Button } from "@/components/ui/button";
import { renderStrapiBlocks } from "@/lib/strapi-rich-text";

export default function QuestionFocusView({ 
  question, currentIndex, totalQuestions, onBack, onNext, onPrev 
}) {
  const qData = question?.attributes || question;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack} className="pl-0 hover:bg-transparent hover:text-blue-600">
          &larr; Back to all questions
        </Button>
      </div>

      <div className="flex flex-col p-6 md:p-10 border rounded-xl shadow-sm bg-card mb-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">
            Question {qData?.Question_number ? `${qData.Question_number} (${currentIndex + 1} of ${totalQuestions})` : `${currentIndex + 1} of ${totalQuestions}`}
          </span>
          {qData?.Question_Type && (
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{qData.Question_Type}</span>
          )}
        </div>

        <div className="text-card-foreground text-lg mb-8">
          {renderStrapiBlocks(qData?.Question_Text)}
        </div>

        <div className="mt-4 p-6 bg-secondary/30 border border-secondary rounded-lg">
          <h4 className="font-semibold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">Solution</h4>
          <div className="text-card-foreground overflow-x-auto">
            {renderStrapiBlocks(qData?.Solution)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0} className="w-32">
          &larr; Previous
        </Button>
        <span className="text-sm text-muted-foreground">{currentIndex + 1} / {totalQuestions}</span>
        <Button onClick={onNext} disabled={currentIndex === totalQuestions - 1} className="w-32">
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}