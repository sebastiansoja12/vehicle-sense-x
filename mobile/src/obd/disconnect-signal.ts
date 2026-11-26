export function createDisconnectSignal() {
  let closed = false;
  const listeners = new Set<() => void>();
  return {
    subscribe(listener: () => void): () => void {
      if (closed) listener(); else listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    close(): void {
      if (closed) return;
      closed = true;
      for (const listener of listeners) {
        try { listener(); } catch { /* An observer must not prevent transport cleanup. */ }
      }
      listeners.clear();
    },
  };
}
