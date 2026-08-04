import { Button } from "@/components/ui/button";
import { renderStrapiBlocks } from "@/lib/strapi-rich-text";

export default function QuestionListCard({ question, index, onViewSolution }) {
  const qData = question?.attributes || question;

  return (
    <div className="flex flex-col p-4 border rounded-xl shadow-sm bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-primary bg-blue-100 dark:bg-primary/30 dark:text-foreground px-2 py-1 rounded-full">
          Question {qData?.Question_number || index + 1}
        </span> 
      </div>
      <div className="flex flex-col">
        {/* <div className="text-card-foreground mb-4 w-full text-left max-h-60 overflow-y-auto overflow-x-auto pr-2"> */}
          <div className="text-card-foreground text-sm mb-2 w-full text-left max-h-60 overflow-y-auto overflow-x-auto pr-2 ">
          {renderStrapiBlocks(qData?.Question_Text)}
        </div>
        <div>
          <Button variant="default" onClick={onViewSolution} className="w-full text-sm p-2 sm:w-auto cursor-pointer">
            View Solution
          </Button>
        </div>
      </div>
    </div>
  );
}