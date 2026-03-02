import { type FC } from "react";

export interface McpServer {
  readonly name: string;
  readonly command: string;
  readonly args?: readonly string[];
  readonly source: string;
  readonly sourcePath: string;
}

interface McpListProps {
  readonly servers: readonly McpServer[];
  readonly loading: boolean;
}

export const McpList: FC<McpListProps> = ({ servers, loading }) => {
  if (loading) {
    return (
      <div className="p-3 text-xs text-center" style={{ color: "var(--cp-text-muted)" }}>
        Scanning...
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="p-3 text-xs text-center" style={{ color: "var(--cp-text-muted)" }}>
        No MCP servers found
      </div>
    );
  }

  // Group by source
  const grouped = servers.reduce<Record<string, McpServer[]>>((acc, srv) => {
    const group = acc[srv.source] ?? [];
    group.push(srv);
    acc[srv.source] = group;
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([source, items]) => (
        <div key={source}>
          <h4
            className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1"
            style={{ color: "var(--cp-text-muted)" }}
          >
            {source}
          </h4>
          <div className="space-y-0.5">
            {items.map((server) => (
              <div
                key={`${source}:${server.name}`}
                className="px-2 py-1.5 rounded text-xs transition-colors"
                style={{ color: "var(--cp-text)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--cp-list-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--cp-success)" }}
                  />
                  <span className="font-medium truncate">{server.name}</span>
                </div>
                <div
                  className="text-[10px] mt-0.5 ml-3 truncate"
                  style={{
                    color: "var(--cp-text-muted)",
                    fontFamily: "var(--vscode-editor-font-family, monospace)",
                  }}
                >
                  {server.command}
                  {server.args && server.args.length > 0
                    ? ` ${server.args.join(" ")}`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
