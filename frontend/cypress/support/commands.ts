// localStorage keys must match lib/auth.ts (not exported from there)
const ACCESS_TOKEN_KEY = "vetapp_access_token";
const REFRESH_TOKEN_KEY = "vetapp_refresh_token";

declare global {
  namespace Cypress {
    interface Chainable {
      /** Logs in via the API and restores the session across specs/tests, skipping the login form. */
      login(email?: string, password?: string): Chainable<void>;
      /** Makes an authenticated request straight to the API, bypassing the UI, for test setup/teardown. */
      apiRequest<T = unknown>(
        method: Cypress.HttpMethod,
        path: string,
        body?: unknown,
        options?: Partial<Cypress.RequestOptions>
      ): Chainable<Cypress.Response<T>>;
    }
  }
}

Cypress.Commands.add(
  "login",
  (
    email = Cypress.env("e2eUserEmail"),
    password = Cypress.env("e2eUserPassword")
  ) => {
    cy.session(
      [email, password],
      () => {
        cy.request("POST", `${Cypress.env("apiUrl")}/api/v1/token/`, {
          email,
          password,
        }).then(({ body }) => {
          cy.visit("/login");
          cy.window().then((win) => {
            win.localStorage.setItem(ACCESS_TOKEN_KEY, body.access);
            win.localStorage.setItem(REFRESH_TOKEN_KEY, body.refresh);
          });
        });
      },
      {
        validate() {
          cy.window().its(`localStorage.${ACCESS_TOKEN_KEY}`).should("exist");
        },
      }
    );
  }
);

Cypress.Commands.add("apiRequest", (method, path, body, options = {}) => {
  return cy
    .request("POST", `${Cypress.env("apiUrl")}/api/v1/token/`, {
      email: Cypress.env("e2eUserEmail"),
      password: Cypress.env("e2eUserPassword"),
    })
    .then(({ body: tokens }) =>
      cy.request({
        method,
        url: `${Cypress.env("apiUrl")}${path}`,
        headers: { Authorization: `Bearer ${tokens.access}` },
        body,
        ...options,
      })
    );
});

export {};
