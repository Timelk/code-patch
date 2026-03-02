import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface McpServerConfig {
  readonly name: string;
  readonly command: string;
  readonly args?: readonly string[];
  readonly env?: Readonly<Record<string, string>>;
  readonly source: string;
  readonly sourcePath: string;
}

/**
 * Known locations of MCP configuration files.
 */
const MCP_CONFIG_PATHS: readonly {
  readonly label: string;
  readonly pathFn: () => string;
}[] = [
  {
    label: "Claude Code (project)",
    pathFn: () => ".mcp.json",
  },
  {
    label: "Claude Code (user)",
    pathFn: () => path.join(os.homedir(), ".claude", "mcp.json"),
  },
  {
    label: "Cursor",
    pathFn: () => path.join(os.homedir(), ".cursor", "mcp.json"),
  },
  {
    label: "Windsurf",
    pathFn: () => path.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json"),
  },
  {
    label: "VSCode (user)",
    pathFn: () => path.join(os.homedir(), ".vscode", "mcp.json"),
  },
];

/**
 * Parse an MCP config file and extract server definitions.
 */
async function parseMcpConfig(
  filePath: string,
  source: string
): Promise<readonly McpServerConfig[]> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : filePath; // project-relative paths handled by caller
    try {
      await fs.promises.access(resolvedPath, fs.constants.F_OK);
    } catch {
      return [];
    }

    const raw = await fs.promises.readFile(resolvedPath, "utf-8");
    const config = JSON.parse(raw) as Record<string, unknown>;

    // Support both { mcpServers: {...} } and { servers: {...} } formats
    const servers =
      (config["mcpServers"] as Record<string, unknown>) ??
      (config["servers"] as Record<string, unknown>) ??
      {};

    return Object.entries(servers).map(([name, value]) => {
      const srv = value as Record<string, unknown>;
      return {
        name,
        command: (srv["command"] as string) ?? "unknown",
        args: srv["args"] as string[] | undefined,
        env: srv["env"] as Record<string, string> | undefined,
        source,
        sourcePath: resolvedPath,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Scan all known MCP config locations and return discovered servers.
 */
export async function scanMcpServers(
  workspaceRoot?: string
): Promise<readonly McpServerConfig[]> {
  const allServers: McpServerConfig[] = [];
  const seenNames = new Set<string>();

  for (const { label, pathFn } of MCP_CONFIG_PATHS) {
    let configPath = pathFn();

    // Resolve project-relative paths
    if (!path.isAbsolute(configPath) && workspaceRoot) {
      configPath = path.join(workspaceRoot, configPath);
    } else if (!path.isAbsolute(configPath)) {
      continue; // Skip project-relative if no workspace
    }

    const servers = await parseMcpConfig(configPath, label);
    for (const server of servers) {
      const key = `${server.source}:${server.name}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        allServers.push(server);
      }
    }
  }

  return allServers;
}
