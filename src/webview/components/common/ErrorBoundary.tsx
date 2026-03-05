import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  readonly children: ReactNode;
}

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[code-patch] Dashboard crashed:", error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center"
          style={{ color: "var(--cp-text-muted)" }}
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: "var(--vscode-errorForeground, #f85149)" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm font-medium" style={{ color: "var(--cp-text)" }}>
            Something went wrong
          </p>
          <p className="text-xs max-w-xs" style={{ color: "var(--cp-text-muted)" }}>
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            className="px-3 py-1.5 rounded text-xs font-medium border mt-1"
            style={{
              borderColor: "var(--cp-border)",
              color: "var(--cp-text)",
              background: "var(--cp-surface)",
              cursor: "pointer",
            }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
