"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Folder, 
  FolderOpen, 
  Link as LinkIcon, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

export default function DirectoryNode({ node }) {
  // State to manage whether a folder is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // 1. LINK RENDER
  if (node.type === 'link') {
    return (
      <li className="mt-1 list-none">
        <Link 
          href={node.url || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-2 py-1.5 text-sm md:text-base text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md transition-colors"
        >
          <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="truncate">{node.title}</span>
        </Link>
      </li>
    );
  }

  // 2. FOLDER RENDER
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className="mt-1 list-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-sm md:text-base font-medium text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {/* Chevron Indicator */}
        <span className="shrink-0 text-muted-foreground w-4 h-4 flex items-center justify-center">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <span className="w-4" /> /* Spacer if empty folder */
          )}
        </span>

        {/* Folder Icon */}
        {isOpen ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-white" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        
        <span className="truncate">{node.title}</span>
      </button>

      {/* Recursive Children Render (Animated slightly via CSS transition in standard cases, or just conditionally rendered) */}
      {isOpen && hasChildren && (
        <ul className="ml-4 md:ml-6 pl-2 md:pl-3 border-l-2 border-border mt-1 space-y-1 animate-in fade-in slide-in-from-top-1">
          {node.children.map((child) => (
            <DirectoryNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}