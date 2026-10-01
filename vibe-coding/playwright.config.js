import { defineConfig } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
const dataDir = mkdtempSync(path.join(tmpdir(), "talentflow-e2e-"));
process.env.TF_E2E_DATA_DIR = dataDir;
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  globalTeardown: "./tests/e2e/teardown.js",
  use: {
    baseURL: "http://127.0.0.1:3101",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node server/index.js",
    env: {
      ...process.env,
      ALLOWED_ORIGINS: "http://127.0.0.1:3101",
      DATA_DIR: dataDir,
      SEED_DEMO: "true",
      PORT: "3101",
      OPENAI_API_KEY: "",
      OPENAI_MODEL: "",
      BOOTSTRAP_PASSWORD: "TalentFlow@demo2026",
    },
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
  },
  reporter: "list",
});
