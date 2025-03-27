
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search files...", 
  className 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  
  // Update local state when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [inputValue, onChange, value]);

  return (
    <div
      className={cn(
        "relative flex items-center rounded-lg border transition-all duration-200",
        isFocused ? "border-primary ring-1 ring-primary/20" : "border-input hover:border-muted-foreground/30",
        className
      )}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="h-10 w-full rounded-lg bg-transparent pl-10 pr-10 outline-none placeholder:text-muted-foreground/70"
      />
      
      {inputValue && (
        <button
          onClick={() => {
            setInputValue("");
            onChange("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
