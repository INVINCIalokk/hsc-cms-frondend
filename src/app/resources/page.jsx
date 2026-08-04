"use client"

import React, { useEffect, useState } from 'react'
import api from '@/lib/apiClient';
import DirectoryNode from '@/components/resources/DirectoryNode'; 
import { buildTree } from '@/lib/utils';

const Page = () => {
  const [treeNodes, setTreeNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Fetch resources and populate relations using wildcard '*'
        const res = await api.get('/api/resources?populate=*&pagination[pageSize]=100');
        const fetchedData = res.data?.data || []; 
        
        // Build the nested tree
        const nestedTree = buildTree(fetchedData);
        setTreeNodes(nestedTree);

      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, []);

  return (
    <div className="w-full md:max-w-7xl mx-auto">
      <div className="bg-card mb-2 border p-3 rounded-md">
        <h1 className="text-card-foreground text-xl font-bold">Resources Directory</h1>
      </div>
      
      <div className="bg-card rounded-lg shadow-sm p-4 md:p-6 border border-border">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">
            Loading resources...
          </div>
        ) : treeNodes.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No resources available.
          </div>
        ) : (
          <ul className="list-none p-0">
            {treeNodes.map((resource) => (
              <DirectoryNode key={resource.id} node={resource} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Page;