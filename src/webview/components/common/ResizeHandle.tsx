import { type FC, useCallback, useRef } from "react";

interface ResizeHandleProps {
  readonly onDrag: (deltaX: number) => void;
}

/**
 * Vertical drag handle for resizable panel borders.
 * Reports incremental deltaX on each mousemove.
 */
export const ResizeHandle: FC<ResizeHandleProps> = ({ onDrag }) => {
  const dragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      let lastX = e.clientX;

      const handleMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - lastX;
        lastX = ev.clientX;
        onDrag(delta);
      };

      const handleMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [onDrag]
  );

  return (
    <div
      className="w-1 shrink-0 cursor-col-resize group"
      style={{ background: "transparent" }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="w-full h-full transition-colors"
        style={{ background: "var(--cp-border)" }}
        onMouseEnter={(e) => {
          if (!dragging.current) {
            e.currentTarget.style.background = "var(--cp-primary)";
            e.currentTarget.style.opacity = "0.6";
          }
        }}
        onMouseLeave={(e) => {
          if (!dragging.current) {
            e.currentTarget.style.background = "var(--cp-border)";
            e.currentTarget.style.opacity = "1";
          }
        }}
      />
    </div>
  );
};
