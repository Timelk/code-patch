import { type FC, type CSSProperties } from "react";

interface VibeTipsCardProps {
  readonly title: string;
  readonly description: string;
  readonly icon?: string;
  readonly tags?: readonly string[];
  readonly stars?: string;
  readonly gradient?: string;
  readonly count?: string;
  readonly onClick?: () => void;
  readonly style?: CSSProperties;
  readonly animationDelay?: number;
}

export const VibeTipsCard: FC<VibeTipsCardProps> = ({
  title,
  description,
  icon,
  tags,
  stars,
  gradient,
  count,
  onClick,
  style,
  animationDelay = 0,
}) => {
  const hasGradient = !!gradient;

  return (
    <button
      className="vibetips-card text-left rounded-lg p-4 transition-all duration-150 ease-out border w-full"
      style={{
        background: hasGradient ? gradient : "var(--cp-surface)",
        borderColor: hasGradient ? "transparent" : "var(--cp-border)",
        color: hasGradient ? "#fff" : "var(--cp-text)",
        animationDelay: `${animationDelay}ms`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = hasGradient
          ? "0 8px 24px rgba(0,0,0,0.3)"
          : "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header row: icon + title + stars/count */}
      <div className="flex items-start gap-2 mb-1.5">
        {icon && <span className="text-lg shrink-0 leading-none mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{title}</span>
            {stars && (
              <span
                className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: hasGradient ? "rgba(255,255,255,0.2)" : "var(--cp-badge-bg)",
                  color: hasGradient ? "#fff" : "var(--cp-badge-fg)",
                }}
              >
                {"\u2605"} {stars}
              </span>
            )}
            {count && (
              <span
                className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                }}
              >
                {count}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-xs leading-relaxed mb-2"
        style={{
          color: hasGradient ? "rgba(255,255,255,0.85)" : "var(--cp-text-muted)",
        }}
      >
        {description}
      </p>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                background: hasGradient ? "rgba(255,255,255,0.15)" : "var(--cp-primary)",
                color: hasGradient ? "rgba(255,255,255,0.9)" : "var(--cp-primary-fg)",
                opacity: hasGradient ? 1 : 0.85,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};
