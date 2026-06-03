import { defineConfig } from "@playwright/test";
import { env } from "./src/config/env";

export default defineConfig({
  testDir: "./src/tests",
  workers: 1,

  use: {
    baseURL: process.env.TARGET_URL,
    headless: env.HEADLESS,

    trace: "retain-on-failure",
    // screenshot: "only-on-failure",
    // video: "retain-on-failure"
    launchOptions: {
      args: ["--disable-dev-shm-usage", "--no-sandbox"]
    }
  },

  reporter: [
    ["list"],
    ["./src/core/reporting/test-reporter.ts"]
  ]
});