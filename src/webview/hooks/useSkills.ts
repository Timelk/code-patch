import { useState, useCallback, useMemo } from "react";
import { postMessage } from "../services/vscode-message";

export interface Skill {
  readonly name: string;
  readonly description: string;
  readonly content: string;
  readonly rawContent: string;
  readonly filePath: string;
  readonly sourceAgent: string;
  readonly isSymlink: boolean;
  readonly metadata: Record<string, unknown>;
}

export type Scope = "global" | "project";

export function useSkills() {
  const [skills, setSkills] = useState<readonly Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [scope, setScope] = useState<Scope>("project");
  const [agentFilter, setAgentFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadSkills = useCallback(
    (targetScope: Scope, targetFilter: string | undefined) => {
      setLoading(true);
      postMessage({
        type: "skills:load",
        payload: { scope: targetScope, agentFilter: targetFilter },
      });
    },
    []
  );

  const handleSkillsLoaded = useCallback(
    (payload: readonly Skill[]) => {
      setSkills(payload);
      setLoading(false);
      // Keep selected skill if still in list (functional update avoids stale closure)
      setSelectedSkill((prev) => {
        if (!prev) return null;
        return payload.find((s) => s.name === prev.name) ?? null;
      });
    },
    []
  );

  const changeScope = useCallback(
    (newScope: Scope) => {
      setScope(newScope);
      setSelectedSkill(null);
      loadSkills(newScope, agentFilter);
    },
    [agentFilter, loadSkills]
  );

  const changeAgentFilter = useCallback(
    (filter: string | undefined) => {
      setAgentFilter(filter);
      setSelectedSkill(null);
      loadSkills(scope, filter);
    },
    [scope, loadSkills]
  );

  const filteredSkills = useMemo(
    () =>
      searchQuery
        ? skills.filter((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : skills,
    [skills, searchQuery]
  );

  return {
    skills: filteredSkills,
    allSkills: skills,
    selectedSkill,
    setSelectedSkill,
    scope,
    changeScope,
    agentFilter,
    changeAgentFilter,
    loading,
    loadSkills,
    handleSkillsLoaded,
    searchQuery,
    setSearchQuery,
  };
}
