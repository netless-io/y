import { describe, expect, test, vi } from "vitest";
import { createVector } from "../index";
import { createAppContext, createStorage } from "./helpers";

describe("Vector", () => {
  const storage = createStorage();
  const context = createAppContext(storage);
  const remote = createVector(context);
  const local = createVector(context);

  test("push", () => {
    const onUpdate = vi.fn();
    const dispose = local.on("update", onUpdate);

    remote.push(1);

    expect(local.size).toBe(1);
    expect(onUpdate).toHaveBeenCalledWith(1);

    dispose();
  });

  test("swap", () => {
    const onUpdate = vi.fn();
    const dispose = local.on("update", onUpdate);

    remote.swap([1, 2, 3]);

    expect(local.size).toBe(3);
    expect(onUpdate).toHaveBeenCalledTimes(3);

    dispose();
  });

  test("forEach", () => {
    remote.swap([1, 2, 3]);

    const updates: any[] = [];
    local.forEach((e) => updates.push(e));
    expect(updates.sort()).toEqual([1, 2, 3]);
  });
});
