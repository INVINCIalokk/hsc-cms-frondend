"use client";

import { useState } from "react";
import QuestionListCard from "@/components/study-room/QuestionListCard";
import QuestionFocusView from "@/components/study-room/QuestionFocusView";

export default function StudyRoomClient({ questions }) {
  const [viewMode, setViewMode] = useState("list");
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-secondary rounded-lg">
        <p className="text-muted-foreground text-lg">No questions found for this exercise yet.</p>
      </div>
    );
  }

  if (viewMode === "focus") {
    return (
      <QuestionFocusView 
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onBack={() => setViewMode("list")}
        onNext={() => setCurrentIndex(prev => prev + 1)}
        onPrev={() => setCurrentIndex(prev => prev - 1)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {questions.map((question, index) => (
        <QuestionListCard 
          key={question.id || index}
          question={question}
          index={index}
          onViewSolution={() => {
            setCurrentIndex(index);
            setViewMode("focus");
          }}
        />
      ))}
    </div>
  );
}
















// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// // KaTeX imports for Math rendering
// import { InlineMath, BlockMath } from "react-katex";
// import "katex/dist/katex.min.css"; // Required for math styling

// export default function StudyRoomClient({ questions }) {
//   // State to manage views: 'list' | 'focus'
//   const [viewMode, setViewMode] = useState("list");
//   // State to track which question is being viewed in focus mode
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // --- Helper: Parse LaTeX out of text strings ---
//   const renderTextWithMath = (text) => {
//     if (!text) return null;
//     // Splits the text using Regex to find $$block$$ and $inline$ math
//     const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    
//     return parts.map((part, index) => {
//       if (part.startsWith("$$") && part.endsWith("$$")) {
//         return <BlockMath key={index} math={part.slice(2, -2).trim()} />;
//       } else if (part.startsWith("$") && part.endsWith("$")) {
//         return <InlineMath key={index} math={part.slice(1, -1).trim()} />;
//       }
//       return <span key={index}>{part}</span>;
//     });
//   };

//   // --- Helper: Apply formatting to children elements ---
//   const renderFormattedChildren = (childrenArray) => {
//     return childrenArray?.map((child, cIndex) => {
//       // Intercept the text and process Math equations first
//       let content = renderTextWithMath(child.text || "");
      
//       if (child.bold) content = <strong key={cIndex}>{content}</strong>;
//       if (child.italic) content = <em key={cIndex}>{content}</em>;
//       if (child.underline) content = <u key={cIndex}>{content}</u>;
      
//       return <span key={cIndex}>{content}</span>;
//     });
//   };

//   // --- Helper: Preprocess Strapi Blocks to merge broken LaTeX Environments ---
//   const preprocessStrapiBlocks = (blocks) => {
//     if (!Array.isArray(blocks)) return blocks;
    
//     const merged = [];
//     let inLatexEnv = false;
//     let latexBuffer = [];

//     for (const block of blocks) {
//       if (block.type === "paragraph") {
//         const textContent = block.children?.map((c) => c.text || "").join("") || "";
//         const trimmed = textContent.trim();

//         if (trimmed.startsWith("\\begin{")) {
//           inLatexEnv = true;
//           latexBuffer.push(textContent);
//         } else if (inLatexEnv) {
//           latexBuffer.push(textContent);
//           // If we find the closing tag, merge the buffer into a single block
//           if (trimmed.includes("\\end{")) {
//             inLatexEnv = false;
//             merged.push({
//               type: "paragraph",
//               children: [{ type: "text", text: `$$\n${latexBuffer.join("\n")}\n$$` }],
//             });
//             latexBuffer = [];
//           }
//         } else if (
//           // Catch standalone LaTeX commands not explicitly wrapped in $ or $$ by the user
//           (trimmed.startsWith("\\text{") || 
//            trimmed.startsWith("\\sqrt") || 
//            trimmed.startsWith("\\frac") ||
//            trimmed.startsWith("\\int") ||
//            trimmed.startsWith("\\sum")) &&
//           !trimmed.startsWith("$$") &&
//           !trimmed.startsWith("$")
//         ) {
//           merged.push({
//             type: "paragraph",
//             children: [{ ...block.children[0], text: `$$ ${textContent} $$` }],
//           });
//         } else {
//           merged.push(block);
//         }
//       } else {
//         merged.push(block);
//       }
//     }

//     // Flush any unclosed LaTeX environments just in case
//     if (latexBuffer.length > 0) {
//       merged.push({
//         type: "paragraph",
//         children: [{ type: "text", text: `$$\n${latexBuffer.join("\n")}\n$$` }],
//       });
//     }

//     return merged;
//   };

//   // --- Helper: Render Strapi Rich Text Blocks ---
//   const renderStrapiBlocks = (rawBlocks) => {
//     if (!rawBlocks) return null;
    
//     // Fix: Changed <p> to <div> to avoid BlockMath div nesting errors
//     if (typeof rawBlocks === "string") return <div className="mb-2">{renderTextWithMath(rawBlocks)}</div>;

//     const blocks = preprocessStrapiBlocks(rawBlocks);

//     return blocks.map((block, index) => {
//       const children = renderFormattedChildren(block.children);

//       switch (block.type) {
//         case "paragraph":
//           // Fix: Changed <p> to <div> to avoid BlockMath div nesting errors
//           return <div key={index} className="mb-3 leading-relaxed">{children}</div>;
//         case "heading":
//           const HeadingTag = `h${block.level || 2}`;
//           return <HeadingTag key={index} className="font-bold mt-4 mb-2 text-lg">{children}</HeadingTag>;
//         case "list":
//           const ListTag = block.format === "ordered" ? "ol" : "ul";
//           return (
//             <ListTag key={index} className={`pl-5 mb-3 ${block.format === "ordered" ? "list-decimal" : "list-disc"}`}>
//               {block.children.map((listItem, lIndex) => (
//                 <li key={lIndex} className="mb-1">
//                   {renderFormattedChildren(listItem.children)}
//                 </li>
//               ))}
//             </ListTag>
//           );
//         default:
//           return <div key={index}>{children}</div>;
//       }
//     });
//   };

//   // --- Navigation Handlers ---
//   const openFocusMode = (index) => {
//     setCurrentIndex(index);
//     setViewMode("focus");
//   };

//   const nextQuestion = () => {
//     if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
//   };

//   const prevQuestion = () => {
//     if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
//   };

//   // -------------------------
//   // RENDER: EMPTY STATE
//   // -------------------------
//   if (!questions || questions.length === 0) {
//     return (
//       <div className="p-12 text-center bg-secondary rounded-lg">
//         <p className="text-muted-foreground text-lg">No questions found for this exercise yet.</p>
//       </div>
//     );
//   }

//   // -------------------------
//   // RENDER: FOCUS MODE (Solution Viewer)
//   // -------------------------
//   if (viewMode === "focus") {
//     const activeQuestion = questions[currentIndex];
//     const qData = activeQuestion?.attributes || activeQuestion;

//     return (
//       <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
//         {/* Top Navigation */}
//         <div className="mb-4">
//           <Button variant="ghost" onClick={() => setViewMode("list")} className="pl-0 hover:bg-transparent hover:text-blue-600">
//             &larr; Back to all questions
//           </Button>
//         </div>

//         {/* The Main Focus Card */}
//         <div className="flex flex-col p-6 md:p-10 border rounded-xl shadow-sm bg-card mb-6">
          
//           {/* Question Section */}
//           <div className="flex items-center justify-between mb-6 pb-4 border-b">
//             <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">
//               Question {qData?.Question_number ? `${qData.Question_number} (${currentIndex + 1} of ${questions.length})` : `${currentIndex + 1} of ${questions.length}`}
//             </span>
//             {qData?.Question_Type && (
//               <span className="text-xs text-muted-foreground uppercase tracking-wider">
//                 {qData.Question_Type}
//               </span>
//             )}
//           </div>

//           <div className="text-card-foreground text-lg mb-8">
//             {renderStrapiBlocks(qData?.Question_Text)}
//           </div>

//           {/* Solution Section */}
//           <div className="mt-4 p-6 bg-secondary/30 border border-secondary rounded-lg">
//             <h4 className="font-semibold text-green-700 dark:text-green-500 mb-4 flex items-center gap-2">
//               Solution
//             </h4>
//             <div className="text-card-foreground overflow-x-auto">
//               {renderStrapiBlocks(qData?.Solution)}
//             </div>
//           </div>
//         </div>

//         {/* Bottom Next/Prev Navigation */}
//         <div className="flex justify-between items-center mt-6">
//           <Button 
//             variant="outline" 
//             onClick={prevQuestion} 
//             disabled={currentIndex === 0}
//             className="w-32"
//           >
//             &larr; Previous
//           </Button>
//           <span className="text-sm text-muted-foreground">
//             {currentIndex + 1} / {questions.length}
//           </span>
//           <Button 
//             onClick={nextQuestion} 
//             disabled={currentIndex === questions.length - 1}
//             className="w-32"
//           >
//             Next &rarr;
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // -------------------------
//   // RENDER: LIST MODE (Default)
//   // -------------------------
//   return (
//     <div className="flex flex-col gap-4">
//       {questions.map((question, index) => {
//         const qData = question?.attributes || question;
        
//         return (
//           <div key={question.id} className="flex flex-col p-6 border rounded-xl shadow-sm bg-card hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between mb-4">
//               <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full">
//                 Question {qData?.Question_number || index + 1}
//               </span>
//               {qData?.Question_Type && (
//                 <span className="text-xs text-muted-foreground uppercase tracking-wider">
//                   {qData.Question_Type}
//                 </span>
//               )}
//             </div>

//             <div className="text-card-foreground mb-6 line-clamp-3">
//               {renderStrapiBlocks(qData?.Question_Text)}
//             </div>

//             <div className="border-t pt-4">
//               <Button 
//                 variant="default" 
//                 onClick={() => openFocusMode(index)}
//                 className="w-full sm:w-auto"
//               >
//                 View Solution
//               </Button>
//             </div>
//           </div>
//         );
//       })}

//       <div className="mt-8 text-center border-t pt-8">
//         <Button size="lg" className="px-12">
//           Complete Exercise
//         </Button>
//       </div>
//     </div>
//   );
// }