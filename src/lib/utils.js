import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function buildTree(items) {
  const itemMap = new Map();
  const roots = [];

  // 1. Map all items using documentId (Strapi v5) or fallback to id
  items.forEach(item => {
    const key = item.documentId || item.id;
    itemMap.set(key, { ...item, children: [] });
  });

  // 2. Link items to their parent folder (stored under the 'resource' field)
  items.forEach(item => {
    const currentKey = item.documentId || item.id;
    const currentNode = itemMap.get(currentKey);

    let parentKey = null;
    const parentRelation = item.resource; // Field name from your Strapi screenshot

    if (parentRelation) {
      if (typeof parentRelation === 'string' || typeof parentRelation === 'number') {
        parentKey = parentRelation;
      } else if (parentRelation.documentId) {
        parentKey = parentRelation.documentId;
      } else if (parentRelation.id) {
        parentKey = parentRelation.id;
      } else if (parentRelation.data) {
        parentKey = parentRelation.data.documentId || parentRelation.data.id;
      }
    }

    // If the parent folder exists in our map, attach as a child
    if (parentKey && itemMap.has(parentKey)) {
      itemMap.get(parentKey).children.push(currentNode);
    } else {
      // If no parent resource is selected, it's a top-level root node
      roots.push(currentNode);
    }
  });

  return roots;
}