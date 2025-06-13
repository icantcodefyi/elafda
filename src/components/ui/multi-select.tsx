import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  values,
  onChange,
  placeholder = "Add tags...",
  className,
}: MultiSelectProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const trimmedValue = inputValue.trim().toLowerCase();
      if (trimmedValue && !values.includes(trimmedValue)) {
        onChange([...values, trimmedValue]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue) {
      onChange(values.slice(0, -1));
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  return (
    <div
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] dark:bg-input/30 flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] md:text-sm",
        className,
      )}
    >
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="h-6 gap-1 text-xs">
          {value}
          <button
            type="button"
            onClick={() => removeValue(value)}
            className="hover:bg-secondary-foreground/20 focus:bg-secondary-foreground/20 focus:ring-ring ml-1 flex h-4 w-4 items-center justify-center rounded-full outline-none transition-colors focus:ring-1"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {value}</span>
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={values.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-0 shadow-none focus-visible:ring-0 text-base bg-transparent dark:bg-transparent"
      />
    </div>
  );
}
