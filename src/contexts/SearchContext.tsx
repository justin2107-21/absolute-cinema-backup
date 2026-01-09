import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: number | null;
  setSelectedGenre: (genre: number | null) => void;
  selectedFilter: string | null;
  setSelectedFilter: (filter: string | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      selectedGenre,
      setSelectedGenre,
      selectedFilter,
      setSelectedFilter,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
