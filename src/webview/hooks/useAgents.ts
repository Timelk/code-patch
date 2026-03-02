import { useState, useCallback } from "react";
import { postMessage } from "../services/vscode-message";

export interface AgentInfo {
  readonly name: string;
  readonly displayName: string;
  readonly skillsDir: string;
  readonly globalSkillsDir: string | null;
  readonly isUniversal: boolean;
  readonly installed: boolean;
}

export function useAgents() {
  const [agents, setAgents] = useState<readonly AgentInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const detectAgents = useCallback(() => {
    setLoading(true);
    postMessage({ type: "agents:detect" });
  }, []);

  const handleAgentsDetected = useCallback((payload: readonly AgentInfo[]) => {
    setAgents(payload);
    setLoading(false);
  }, []);

  const installedAgents = agents.filter((a) => a.installed);

  return {
    agents,
    installedAgents,
    loading,
    detectAgents,
    handleAgentsDetected,
  };
}
