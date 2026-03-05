import { type FC } from "react";

interface SpinnerProps {
  /** Tailwind size class, e.g. "w-3 h-3" or "w-3.5 h-3.5" */
  readonly size?: string;
}

export const Spinner: FC<SpinnerProps> = ({ size = "w-4 h-4" }) => (
  <svg
    className={`${size} animate-spin`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
