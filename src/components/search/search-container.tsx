"use client"

import { SearchBar, SearchFilters, type SearchFiltersType } from "~/components/search"
import { cn } from "~/lib/utils"

export interface SearchContainerProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters: SearchFiltersType
  onFiltersChange: (filters: SearchFiltersType) => void
  availableCategories: string[]
  placeholder?: string
  className?: string
  showResultsCount?: boolean
  resultsCount?: number
  totalCount?: number
}

export function SearchContainer({
  searchValue,
  onSearchChange,
  filters,
  onFiltersChange,
  availableCategories,
  placeholder = "Search...",
  className,
  showResultsCount = true,
  resultsCount,
  totalCount
}: SearchContainerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="w-full">
        <SearchBar
          placeholder={placeholder}
          value={searchValue}
          onChange={onSearchChange}
          size="lg"
          className="w-full"
        />
      </div>

      {/* Filters */}
      <SearchFilters
        availableCategories={availableCategories}
        filters={filters}
        onFiltersChange={onFiltersChange}
        className="w-full"
      />

      {/* Results Summary */}
      {showResultsCount && resultsCount !== undefined && totalCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {resultsCount} of {totalCount} results
          </p>
          {(filters.categories.length > 0 || 
            filters.showHotOnly || 
            searchValue.trim() || 
            filters.sortBy !== "date" || 
            filters.sortOrder !== "desc") && (
            <p className="text-xs">
              Filters applied
            </p>
          )}
        </div>
      )}
    </div>
  )
} 