## @netless/y

> Glue between netless app and CRDT libraries

```js
import { createVector } from "@netless/y";
// var App = { kind, setup(context) {
const vector = createVector(context, "namespace");
vector.forEach((update) => CRDT.applyUpdate(update));
CRDT.on("update", (update) => vector.push(update));
vector.on("update", (update) => CRDT.applyUpdate(update));
```

See [src/yjs.ts](./src/yjs.ts) for a more real-life use case.

### Structure

#### Vector

Think of it as a growing array, you can push CRDT operations into it.

```ts
type Value = any; // any JSON-serializable value

class Vector {
  readonly size: number;
  forEach(callback: (update: Value) => void): void;
  push(update: Value): void;
  swap(updates: Value[]): void;
  on(event: "update", callback: (update: Value) => void): void;
}
```

## License

MIT @ [netless](https://github.com/netless-io)
