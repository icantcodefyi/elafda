"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface MentionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface UserMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: number;
}

export function UserMentionInput({
  value,
  onChange,
  placeholder = "Write a comment...",
  className,
  disabled = false,
  minHeight = 100,
}: UserMentionInputProps) {
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          limit: "8",
        });
        const response = await fetch(`/api/users/search?${params.toString()}`);
        if (response.ok) {
          const data = await response.json() as { users: MentionUser[] };
          setSuggestions(data.users || []);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle input changes and detect @ mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    onChange(newValue);

    // Check if we're in a mention
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord?.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.slice(1);
      setMentionStart(cursorPosition - lastWord.length);
      setMentionQuery(query);
      setShowSuggestions(true);
      setSelectedIndex(0);
      debouncedSearch(query);
    } else {
      setShowSuggestions(false);
      setMentionStart(-1);
      setMentionQuery("");
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = useCallback((user: MentionUser) => {
    if (mentionStart === -1) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const beforeMention = value.slice(0, mentionStart);
    const afterCursor = value.slice(textarea.selectionStart);
    const mention = `@${user.name ?? user.email ?? 'Unknown'}`;
    
    const newValue = beforeMention + mention + " " + afterCursor;
    onChange(newValue);

    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = mentionStart + mention.length + 1;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);

    setShowSuggestions(false);
    setMentionStart(-1);
  }, [value, mentionStart, onChange]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        style={{ minHeight: `${minHeight}px` }}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isSearching ? (
            <div className="flex items-center justify-center py-3">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-3 text-center text-sm text-muted-foreground">
              No users found for &quot;{mentionQuery}&quot;
            </div>
          ) : (
            suggestions.map((user, index) => (
              <button
                key={user.id}
                onClick={() => selectSuggestion(user)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center gap-3 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>
                    {(user.name ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {user.name ?? "Unnamed User"}
                  </span>
                  {user.email && (
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce(
  func: (query: string) => Promise<void>,
  wait: number
): (query: string) => void {
  let timeout: NodeJS.Timeout;
  return (query: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      void func(query);
    }, wait);
  };
} 