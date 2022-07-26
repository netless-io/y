import type { AppContext, Storage } from "@netless/window-manager";

export class Observable<N = string> {
  _observers = new Map<N, Set<Function>>();
  on(name: N, f: Function) {
    let set = this._observers.get(name);
    !set && this._observers.set(name, (set = new Set()));
    set.add(f);
    return () => this.off(name, f);
  }
  off(name: N, f: Function) {
    const set = this._observers.get(name);
    set && set.delete(f) && set.size === 0 && this._observers.delete(name);
  }
  emit(name: N, args: Array<any>) {
    const set = this._observers.get(name);
    set && set.forEach((f) => f(...args));
  }
  destroy() {
    this._observers.clear();
  }
}

export class Vector extends Observable<"update"> {
  _context: AppContext;
  _storage: Storage;
  _clientId: string;
  _clock = 1;
  _disposers: Function[] = [];

  constructor(_context: AppContext, namespace: string) {
    super();

    this._context = _context;
    this._storage = _context.createStorage(namespace, {});

    this._clientId =
      _context.currentMember?.uid || Math.random().toString(36).slice(2, 8);

    this._disposers.push(
      this._storage.on("stateChanged", (diff) => {
        Object.keys(diff).forEach((key) => {
          const [clientId, _clock] = key.split("@");
          if (clientId === this._clientId) return;
          const one = diff[key];
          const update = one && one.newValue;
          update && this.emit("update", [update]);
        });
      })
    );

    Object.keys(this._storage.state).forEach((key) => {
      const [clientId, _clock] = key.split("@");
      if (clientId === this._clientId) {
        this._clock = Math.max(this._clock, Number(_clock) + 1);
      }
    });
  }
  get size() {
    return Object.keys(this._storage.state).length;
  }
  forEach(callback: (update: any, index: number) => void) {
    const state = this._storage.state;
    Object.keys(state).forEach((key, i) => callback(state[key], i));
  }
  push(update: any) {
    if (!this._context.isWritable) return;
    this._storage.setState({ [this._clientId + "@" + this._clock++]: update });
  }
  swap(updates: Array<any>) {
    if (!this._context.isWritable) return;
    this._storage.resetState();
    let newState: Record<string, any> = {};
    for (const update of updates) {
      newState[this._clientId + "@" + this._clock++] = update;
    }
    this._storage.setState(newState);
  }
  override destroy() {
    const disposers = this._disposers;
    this._disposers = [];
    disposers.forEach((dispose) => dispose());
    super.destroy();
  }
}

/**
 * ```js
 * const vector = createVector(context, 'doc');
 * // call vector.destroy() on destroy app
 * ```
 */
export function createVector(context: AppContext, namespace: string) {
  return new Vector(context, namespace);
}
