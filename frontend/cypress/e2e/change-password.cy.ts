// localStorage keys must match lib/auth.ts (not exported from there)
const ACCESS_TOKEN_KEY = "vetapp_access_token";
const REFRESH_TOKEN_KEY = "vetapp_refresh_token";

const originalPassword = Cypress.env("e2eUserPassword");
const tempPassword = "cypress-temp-pass-456";

// Changing the password revokes every outstanding token for the user, so this
// spec authenticates with fresh cy.request calls instead of the cached
// cy.session from commands.ts - a stale cached session would otherwise reuse
// a token that the backend has already blacklisted.
function loginWithPassword(password: string) {
  cy.request("POST", `${Cypress.env("apiUrl")}/api/v1/token/`, {
    email: Cypress.env("e2eUserEmail"),
    password,
  }).then(({ body }) => {
    cy.visit("/login");
    cy.window().then((win) => {
      win.localStorage.setItem(ACCESS_TOKEN_KEY, body.access);
      win.localStorage.setItem(REFRESH_TOKEN_KEY, body.refresh);
    });
  });
}

describe("Change password", () => {
  afterEach(() => {
    // Best-effort revert in case a test left the password changed.
    cy.request({
      method: "POST",
      url: `${Cypress.env("apiUrl")}/api/v1/token/`,
      body: { email: Cypress.env("e2eUserEmail"), password: tempPassword },
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status !== 200) return;
      cy.request({
        method: "POST",
        url: `${Cypress.env("apiUrl")}/api/v1/user/change-password/`,
        headers: { Authorization: `Bearer ${res.body.access}` },
        body: { old_password: tempPassword, new_password: originalPassword },
      });
    });
  });

  it("changes the password and logs the user out", () => {
    loginWithPassword(originalPassword);
    cy.visit("/change-password");
    cy.get("#old-password").type(originalPassword);
    cy.get("#new-password").type(tempPassword);
    cy.get("#new-password-confirm").type(tempPassword);
    cy.contains("button", "Change password").click();

    cy.url().should("include", "/login");
    cy.contains("a", "Log in").should("be.visible");

    cy.get("#email").type(Cypress.env("e2eUserEmail"));
    cy.get("#password").type(tempPassword);
    cy.contains("button", "Log in").click();
    cy.url().should("eq", `${Cypress.config("baseUrl")}/dashboard`);
  });

  it("shows a validation error when the confirmation doesn't match", () => {
    loginWithPassword(originalPassword);
    cy.visit("/change-password");
    cy.get("#old-password").type(originalPassword);
    cy.get("#new-password").type("some-new-pass-123");
    cy.get("#new-password-confirm").type("different-pass-456");
    cy.contains("button", "Change password").click();

    cy.contains("Passwords do not match.").should("be.visible");
    cy.url().should("include", "/change-password");
  });

  it("shows a server error for an incorrect current password", () => {
    loginWithPassword(originalPassword);
    cy.visit("/change-password");
    cy.get("#old-password").type("wrong-current-password");
    cy.get("#new-password").type(tempPassword);
    cy.get("#new-password-confirm").type(tempPassword);
    cy.contains("button", "Change password").click();

    cy.contains("Incorrect current password.").should("be.visible");
    cy.url().should("include", "/change-password");
  });
});
