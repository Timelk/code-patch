/**
 * Type-safe wrapper for VSCode Webview postMessage API.
 */

interface VSCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VSCodeApi;

let vscodeApi: VSCodeApi | null = null;

/**
 * Gets the VSCode API instance (singleton).
 */
export function getVSCodeApi(): VSCodeApi {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

/**
 * Posts a typed message to the extension host.
 */
export function postMessage(message: unknown): void {
  getVSCodeApi().postMessage(message);
}

/**
 * Subscribes to messages from the extension host.
 */
export function onMessage<T = unknown>(
  handler: (message: T) => void
): () => void {
  const listener = (event: MessageEvent<T>) => {
    try {
      handler(event.data);
    } catch (err) {
      console.error("[code-patch] Error in message handler:", err);
    }
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
