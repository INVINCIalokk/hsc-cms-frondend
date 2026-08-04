import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

const renderTextWithMath = (text) => {
    if (!text) return null;
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

    return parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
            return <BlockMath key={index} math={part.slice(2, -2).trim()} />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
            return <InlineMath key={index} math={part.slice(1, -1).trim()} />;
        }
        return <span key={index}>{part}</span>;
    });
};

const renderFormattedChildren = (childrenArray) => {
    return childrenArray?.map((child, cIndex) => {
        let content = renderTextWithMath(child.text || "");
        if (child.bold) content = <strong key={cIndex}>{content}</strong>;
        if (child.italic) content = <em key={cIndex}>{content}</em>;
        if (child.underline) content = <u key={cIndex}>{content}</u>;
        return <span key={cIndex}>{content}</span>;
    });
};

const preprocessStrapiBlocks = (blocks) => {
    if (!Array.isArray(blocks)) return blocks;
    const merged = [];
    let inLatexEnv = false;
    let latexBuffer = [];
    for (const block of blocks) {
        if (block.type === "paragraph") {
            const textContent = block.children?.map((c) => c.text || "").join("") || "";
            const trimmed = textContent.trim();

            if (trimmed.startsWith("\\begin{")) {
                inLatexEnv = true;
                latexBuffer.push(textContent);
            } else if (inLatexEnv) {
                latexBuffer.push(textContent);
                // If we find the closing tag, merge the buffer into a single block
                if (trimmed.includes("\\end{")) {
                    inLatexEnv = false;
                    merged.push({
                        type: "paragraph",
                        children: [{ type: "text", text: `$$\n${latexBuffer.join("\n")}\n$$` }],
                    });
                    latexBuffer = [];
                }
            } else if (
                // Catch standalone LaTeX commands not explicitly wrapped in $ or $$ by the user
                (trimmed.startsWith("\\text{") ||
                    trimmed.startsWith("\\sqrt") ||
                    trimmed.startsWith("\\frac") ||
                    trimmed.startsWith("\\int") ||
                    trimmed.startsWith("\\sum")) &&
                !trimmed.startsWith("$$") &&
                !trimmed.startsWith("$")
            ) {
                merged.push({
                    type: "paragraph",
                    children: [{ ...block.children[0], text: `$$ ${textContent} $$` }],
                });
            } else {
                merged.push(block);
            }
        } else {
            merged.push(block);
        }
    }
    return merged; // Make sure to return the full merged array
};

export const renderStrapiBlocks = (rawBlocks) => {
    if (!rawBlocks) return null;
    if (typeof rawBlocks === "string") return <div className="mb-2">{renderTextWithMath(rawBlocks)}</div>;

    const blocks = preprocessStrapiBlocks(rawBlocks);

    return blocks.map((block, index) => {
        const children = renderFormattedChildren(block.children);

        switch (block.type) {
            case "paragraph":
                return <div key={index} className="mb-2 leading-relaxed">{children}</div>;
            case "heading":
                const HeadingTag = `h${block.level || 2}`;
                return <HeadingTag key={index} className="font-bold mt-2 mb-2 text-lg">{children}</HeadingTag>;
            case "list":
                const ListTag = block.format === "ordered" ? "ol" : "ul";
                return (
                    <ListTag key={index} className={`pl-2 mb-2 ${block.format === "ordered" ? "list-decimal" : "list-disc"}`}>
                        {block.children.map((listItem, lIndex) => (
                            <li key={lIndex} className="mb-1">{renderFormattedChildren(listItem.children)}</li>
                        ))}
                    </ListTag>
                );
            default:
                return <div key={index}>{children}</div>;
        }
    });
};