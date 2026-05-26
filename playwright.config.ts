import { defineConfig } from "@playwright/test";
import { env } from "./src/config/env";

export default defineConfig({
  testDir: "./src/tests",

  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,

    trace: "retain-on-failure",
    // screenshot: "only-on-failure",
    // video: "retain-on-failure"
  },

  reporter: [
    ["list"],
    ["./src/core/reporting/test-reporter.ts"]
  ]
});