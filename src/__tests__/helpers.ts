import type { AppContext, Storage } from "@netless/window-manager";

type DiffOne<T> = { oldValue?: T; newValue?: T };
type Diff = Record<string, DiffOne<any>>;
type StorageStateChangedListener = (diff: Diff) => void;

export function createAppContext(storage: Storage): AppContext {
  return {
    createStorage: () => storage,
    isWritable: true,
    currentMember: undefined,
  } as unknown as AppContext;
}

export function createStorage(): Storage {
  let state: Record<string, any> = {};
  let listeners = new Set<StorageStateChangedListener>();

  function makeDiff<T>(oldValue?: T, newValue?: T): DiffOne<T> {
    return { oldValue, newValue };
  }

  function setState(partial: Record<string, any>) {
    for (let key in partial) {
      if (state[key] === partial[key]) continue;
      const diff = { [key]: makeDiff(state[key], partial[key]) };
      if (partial[key] === undefined) {
        delete state[key];
      } else {
        state[key] = partial[key];
      }
      // synchronously notify listeners
      // in real-world, it should be async
      listeners.forEach((f) => f(diff));
    }
  }

  function resetState() {
    let partial: Record<string, undefined> = {};
    for (let key in state) {
      partial[key] = undefined;
    }
    setState(partial);
  }

  function on(_: string, fn: StorageStateChangedListener) {
    listeners.add(fn);
    return () => void listeners.delete(fn);
  }

  return {
    get state() {
      return state;
    },
    setState,
    resetState,
    on,
  } as Storage;
}
