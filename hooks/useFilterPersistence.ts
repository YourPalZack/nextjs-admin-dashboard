import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useFilterPersistence() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Save current filters to localStorage
    const filters = Object.fromEntries(searchParams.entries());
    localStorage.setItem('jobFilters', JSON.stringify(filters));
  }, [searchParams]);

  const getSavedFilters = () => {
    if (typeof window === 'undefined') return {};
    
    const saved = localStorage.getItem('jobFilters');
    return saved ? JSON.parse(saved) : {};
  };

  const clearSavedFilters = () => {
    localStorage.removeItem('jobFilters');
  };

  return { getSavedFilters, clearSavedFilters };
}