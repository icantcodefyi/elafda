"use client"

import { useState, useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  className?: string
  disabled?: boolean
  showClearButton?: boolean
  size?: "sm" | "md" | "lg"
}

export function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  onClear,
  className,
  disabled = false,
  showClearButton = true,
  size = "md"
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value)
  
  const searchValue = onChange ? value : internalValue
  
  const handleChange = useCallback((newValue: string) => {
    if (onChange) {
      onChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }, [onChange])

  const handleClear = useCallback(() => {
    handleChange("")
    onClear?.()
  }, [handleChange, onClear])

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-sm",
    lg: "h-12 text-base"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  const paddingClasses = {
    sm: "pl-8 pr-8",
    md: "pl-10 pr-10",
    lg: "pl-12 pr-12"
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Search Icon */}
      <Search 
        className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none",
          iconSizes[size]
        )} 
      />
      
      {/* Input Field */}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className={cn(
          sizeClasses[size],
          paddingClasses[size],
          showClearButton && searchValue && "pr-16"
        )}
      />
      
      {/* Clear Button */}
      {showClearButton && searchValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted rounded-full",
            size === "sm" && "h-5 w-5",
            size === "lg" && "h-8 w-8"
          )}
          aria-label="Clear search"
        >
          <X className={cn(iconSizes[size])} />
        </Button>
      )}
    </div>
  )
} 