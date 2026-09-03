import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tools/audio_systems_pilot_01/**/*.test.ts"],
  },
});
