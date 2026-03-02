import { type FC } from "react";

interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
}

export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-2.5 pr-7 py-1 text-xs rounded border outline-none transition-colors"
        style={{
          background: "var(--cp-input-bg)",
          borderColor: "var(--cp-input-border)",
          color: "var(--cp-text)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--cp-focus)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--cp-input-border)";
        }}
      />
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
        style={{ color: "var(--cp-text-muted)" }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
};
