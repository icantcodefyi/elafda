"use client"

import { SearchBar } from "~/components/search"
import { cn } from "~/lib/utils"

export interface SearchContainerProps {
  searchValue: string
  onSearchChange: (value: string) => void
  placeholder?: string
  className?: string
  showResultsCount?: boolean
  resultsCount?: number
  totalCount?: number
}

export function SearchContainer({
  searchValue,
  onSearchChange,
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

      {/* Results Summary */}
      {showResultsCount && resultsCount !== undefined && totalCount !== undefined && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {resultsCount} of {totalCount} results
          </p>
        </div>
      )}
    </div>
  )
} 