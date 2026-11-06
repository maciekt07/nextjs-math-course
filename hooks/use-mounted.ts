import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server and hydration snapshot
  );
}
