import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents() {
      // no custom node event listeners yet
    },
  },
  env: {
    apiUrl: process.env.CYPRESS_API_URL ?? "http://localhost:8000",
    e2eUserEmail: process.env.E2E_USER_EMAIL ?? "e2e@vetapp.test",
    e2eUserPassword: process.env.E2E_USER_PASSWORD ?? "e2e-test-pass-123",
  },
});
