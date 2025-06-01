import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Job } from '@/types';

export function useJobSearch(jobs: Job[], searchTerm: string) {
  const [results, setResults] = useState<Job[]>(jobs);

  const fuse = useMemo(() => {
    return new Fuse(jobs, {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'company.name', weight: 0.3 },
        { name: 'location.city', weight: 0.2 },
        { name: 'description', weight: 0.1 },
      ],
      threshold: 0.3,
      includeScore: true,
    });
  }, [jobs]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(jobs);
      return;
    }

    const searchResults = fuse.search(searchTerm);
    setResults(searchResults.map(result => result.item));
  }, [searchTerm, jobs, fuse]);

  return results;
}