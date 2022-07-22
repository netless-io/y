import type { Vector } from "./index";

import * as Y from "yjs";
import { fromUint8Array, toUint8Array } from "js-base64";

export interface ConnectOptions {
  /** shrink vector size when it is bigger than this number */
  optimizeAt?: number;
}

/**
 * ```js
 * const doc = new Y.Doc();
 * const vector = createVector(context, 'doc');
 * const dispose = connect(vector, doc);
 * // call dispose() and vector.destroy() on destroy app
 * ```
 */
export function connect(
  vector: Vector,
  doc: Y.Doc,
  { optimizeAt = 1000 }: ConnectOptions = {}
) {
  if (optimizeAt <= 0) {
    throw new Error("[optimizeAt] must be greater than 0");
  }

  const remoteOrigin = "remote";

  // restore state
  vector.forEach((update: string) => {
    Y.applyUpdate(doc, toUint8Array(update), remoteOrigin);
  });

  // doc -> vector -> other clients
  function onDocUpdate(update: Uint8Array, origin: unknown) {
    if (origin !== remoteOrigin) {
      vector.push(fromUint8Array(update));
      if (vector.size > optimizeAt) {
        vector.swap([fromUint8Array(Y.encodeStateAsUpdate(doc))]);
      }
    }
  }
  doc.on("update", onDocUpdate);
  const disposeDocListener = () => doc.off("update", onDocUpdate);

  // other clients -> vector -> doc
  const disposeVectorListener = vector.on("update", (update: string) => {
    Y.applyUpdate(doc, toUint8Array(update), remoteOrigin);
  });

  return function dispose() {
    disposeVectorListener();
    disposeDocListener();
  };
}
