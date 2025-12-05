import React, { useState, useCallback, useMemo } from "react";
import { Search, Filter, X, ChevronDown, Check } from "lucide-react";
import { cn, Input, Button } from "./UI";
import { useDebounce } from "../hooks/useAsync";

/**
 * Search input with debounce
 */
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Update parent when debounced value changes
  React.useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Sync local value when external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-9 pr-9"
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue("");
            onChange("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

/**
 * Filter dropdown for single selection
 */
interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  showCount?: boolean;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  className,
  showCount = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
          value && value !== "all"
            ? "bg-primary-50 border-primary-200 text-primary-700"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        )}
      >
        {icon || <Filter className="w-4 h-4" />}
        <span>{selectedOption?.label || label}</span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[180px] py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                  option.value === value && "bg-primary-50 text-primary-700"
                )}
              >
                <span className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
                <span className="flex items-center gap-2">
                  {showCount && option.count !== undefined && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {option.count}
                    </span>
                  )}
                  {option.value === value && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Multi-select filter
 */
interface MultiFilterSelectProps {
  label: string;
  values: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
  icon?: React.ReactNode;
  className?: string;
}

export const MultiFilterSelect: React.FC<MultiFilterSelectProps> = ({
  label,
  values,
  options,
  onChange,
  icon,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
          values.length > 0
            ? "bg-primary-50 border-primary-200 text-primary-700"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        )}
      >
        {icon || <Filter className="w-4 h-4" />}
        <span>{values.length > 0 ? `${label} (${values.length})` : label}</span>
        <ChevronDown
          className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[200px] py-1">
            {values.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 text-left border-b border-gray-100"
              >
                Clear all
              </button>
            )}
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => toggleValue(option.value)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center",
                    values.includes(option.value)
                      ? "bg-primary-600 border-primary-600"
                      : "border-gray-300"
                  )}
                >
                  {values.includes(option.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Date range filter
 */
interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  className,
}) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Input
      type="date"
      value={startDate}
      onChange={(e) => onStartChange(e.target.value)}
      className="w-40"
    />
    <span className="text-gray-400">to</span>
    <Input
      type="date"
      value={endDate}
      onChange={(e) => onEndChange(e.target.value)}
      className="w-40"
    />
  </div>
);

/**
 * Active filters display with remove functionality
 */
interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  displayValue: string;
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemove,
  onClearAll,
  className,
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-sm text-gray-500">Active filters:</span>
      {filters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
        >
          <span className="font-medium">{filter.label}:</span>
          <span>{filter.displayValue}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 hover:bg-primary-100 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Clear all
      </button>
    </div>
  );
};

/**
 * Combined search and filter bar
 */
interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  actions,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between",
      className
    )}
  >
    <div className="flex flex-1 flex-wrap items-center gap-3">
      <SearchInput
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="w-full sm:w-72"
      />
      {filters}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default {
  SearchInput,
  FilterSelect,
  MultiFilterSelect,
  DateRangeFilter,
  ActiveFilters,
  SearchFilterBar,
};
