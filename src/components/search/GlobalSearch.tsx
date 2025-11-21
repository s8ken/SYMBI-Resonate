import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, Beaker, BarChart3, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/Loading';

interface SearchResult {
  id: string;
  type: 'experiment' | 'variant' | 'assessment' | 'report';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  url: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      loadRecentSearches();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    
    // Simulate API call - replace with actual search implementation
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          type: 'experiment',
          title: 'GPT-4 vs Claude 3 Comparison',
          description: 'Testing response quality for customer support scenarios',
          metadata: { status: 'completed', variants: 2 },
          url: '/experiments/1',
        },
        {
          id: '2',
          type: 'experiment',
          title: 'Prompt Engineering Experiment',
          description: 'Comparing different prompt strategies',
          metadata: { status: 'running', variants: 3 },
          url: '/experiments/2',
        },
        {
          id: '3',
          type: 'variant',
          title: 'GPT-4 Baseline',
          description: 'OpenAI GPT-4 with default settings',
          metadata: { provider: 'openai', model: 'gpt-4' },
          url: '/experiments/1/variants/3',
        },
        {
          id: '4',
          type: 'assessment',
          title: 'SYMBI Framework Assessment #42',
          description: 'High self-organization and meta-reflection scores',
          metadata: { score: 87.5 },
          url: '/assessments/4',
        },
      ].filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(mockResults);
      setIsLoading(false);
    }, 300);
  };

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    navigate(result.url);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(results.length - 1, prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'experiment':
        return <Beaker className="w-5 h-5" />;
      case 'variant':
        return <BarChart3 className="w-5 h-5" />;
      case 'assessment':
        return <FileText className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  const getResultBadgeVariant = (type: string) => {
    switch (type) {
      case 'experiment':
        return 'primary';
      case 'variant':
        return 'secondary';
      case 'assessment':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div
          className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-neutral-200 dark:border-neutral-800">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search experiments, variants, assessments..."
              className="flex-1 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : query.length > 2 && results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                  No results found for "{query}"
                </p>
              </div>
            ) : query.length > 2 ? (
              <div className="py-2">
                {results.map((result, index) => {
                  const Icon = getResultIcon(result.type);
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={cn(
                        'w-full flex items-start gap-4 p-4 text-left transition-colors',
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      )}
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                        {Icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {result.title}
                          </h4>
                          <Badge variant={getResultBadgeVariant(result.type) as any} size="sm">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && (
                          <div className="flex items-center gap-2 mt-2">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <span
                                key={key}
                                className="text-xs text-neutral-500 dark:text-neutral-500"
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 px-4">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                  Recent Searches
                </h4>
                {recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(search)}
                        className="w-full flex items-center gap-3 p-2 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        <Clock className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {search}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    No recent searches
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↵</kbd>
                to select
              </span>
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      </div>
    </div>
  );
};