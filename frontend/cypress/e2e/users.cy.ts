describe("Users", () => {
  beforeEach(() => {
    cy.login();
  });

  it("creates a user and lists it", () => {
    const email = `cypress.user.${Date.now()}@example.com`;
    const lastName = `Cypress user ${Date.now()}`;

    cy.visit("/users");
    cy.contains("a", "New user").click();

    cy.url().should("include", "/users/new");
    cy.get("#email").type(email);
    cy.get("#password").type("cypress-test-pass-123");
    cy.get("#password_confirm").type("cypress-test-pass-123");
    cy.get("#first_name").type("Cypress");
    cy.get("#last_name").type(lastName);
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/users$/);
    cy.contains("tr", lastName).should("be.visible").and("contain.text", email);
  });

  it("shows a validation error when passwords don't match", () => {
    cy.visit("/users/new");
    cy.get("#email").type(`cypress.mismatch.${Date.now()}@example.com`);
    cy.get("#password").type("cypress-test-pass-123");
    cy.get("#password_confirm").type("different-pass-456");
    cy.contains("button", "Create").click();

    cy.contains("Passwords do not match.").should("be.visible");
    cy.url().should("include", "/users/new");
  });

  it("denies the user list to non-staff accounts", () => {
    const email = `cypress.nonstaff.${Date.now()}@example.com`;
    const password = "cypress-test-pass-123";

    cy.apiRequest("POST", "/api/v1/user/", {
      email,
      password,
      first_name: "Cypress",
      last_name: "NonStaff",
      is_staff: false,
    }).then(() => {
      cy.login(email, password);
      cy.visit("/users");
      cy.contains(
        "Could not load users. You may not have permission to view this page."
      ).should("be.visible");
    });
  });
});
