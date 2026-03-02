import { useEffect, useRef } from "react";
import { postMessage, onMessage } from "../services/vscode-message";

/**
 * Hook for communicating with the VSCode extension host.
 */
export function useVSCodeApi<TReceive = unknown>(
  onReceive?: (message: TReceive) => void
) {
  const callbackRef = useRef(onReceive);
  callbackRef.current = onReceive;

  useEffect(() => {
    const unsubscribe = onMessage<TReceive>((msg) => {
      callbackRef.current?.(msg);
    });
    return unsubscribe;
  }, []);

  return { postMessage };
}
