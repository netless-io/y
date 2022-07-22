import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index", "src/yjs"],
  declaration: true,
  externals: ["@netless/window-manager", "yjs"],
  rollup: { inlineDependencies: true },
});
