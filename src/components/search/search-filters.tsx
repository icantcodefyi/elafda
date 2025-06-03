"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Calendar, 
  Eye, 
  Star,
  TrendingUp,
  X
} from "lucide-react"
import { cn } from "~/lib/utils"

export interface SearchFilters {
  categories: string[]
  sortBy: "date" | "views" | "stars" | "trending"
  sortOrder: "asc" | "desc"
  showHotOnly: boolean
}

interface SearchFiltersProps {
  availableCategories: string[]
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  className?: string
}

export function SearchFilters({
  availableCategories,
  filters,
  onFiltersChange,
  className
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    })
  }

  const handleSortChange = (sortBy: SearchFilters["sortBy"]) => {
    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === "desc" ? "asc" : "desc"
    })
  }

  const handleHotToggle = () => {
    onFiltersChange({
      ...filters,
      showHotOnly: !filters.showHotOnly
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      sortBy: "date",
      sortOrder: "desc",
      showHotOnly: false
    })
  }

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.showHotOnly || 
                          filters.sortBy !== "date" || 
                          filters.sortOrder !== "desc"

  const getSortIcon = (sortType: SearchFilters["sortBy"]) => {
    const isActive = filters.sortBy === sortType
    const IconComponent = (() => {
      switch (sortType) {
        case "date": return Calendar
        case "views": return Eye
        case "stars": return Star
        case "trending": return TrendingUp
        default: return Calendar
      }
    })()

    return (
      <div className="flex items-center gap-1">
        <IconComponent className="h-4 w-4" />
        {isActive && (filters.sortOrder === "desc" ? <SortDesc className="h-3 w-3" /> : <SortAsc className="h-3 w-3" />)}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {filters.categories.length + (filters.showHotOnly ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          {/* Sort Options */}
          <div>
            <h4 className="text-sm font-medium mb-2">Sort by</h4>
            <div className="flex flex-wrap gap-2">
              {(["date", "views", "stars", "trending"] as const).map((sortType) => (
                <Button
                  key={sortType}
                  variant={filters.sortBy === sortType ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSortChange(sortType)}
                  className="flex items-center gap-1"
                >
                  {getSortIcon(sortType)}
                  <span className="capitalize">{sortType}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <h4 className="text-sm font-medium mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Hot Posts Toggle */}
          <div>
            <h4 className="text-sm font-medium mb-2">Special Filters</h4>
            <Button
              variant={filters.showHotOnly ? "default" : "outline"}
              size="sm"
              onClick={handleHotToggle}
              className="flex items-center gap-2"
            >
              🔥 Hot Posts Only
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 