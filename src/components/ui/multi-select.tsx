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
        "bg-background flex min-h-[40px] flex-wrap gap-2 rounded-md border p-2",
        className,
      )}
    >
      {values.map((value) => (
        <Badge key={value} variant="secondary" className="gap-1">
          {value}
          <button
            type="button"
            onClick={() => removeValue(value)}
            className="ring-offset-background focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={values.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 border-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
