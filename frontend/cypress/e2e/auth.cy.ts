describe("Authentication", () => {
  it("logs in through the UI and back out again", () => {
    cy.visit("/login");
    cy.get("#email").type(Cypress.env("e2eUserEmail"));
    cy.get("#password").type(Cypress.env("e2eUserPassword"));
    cy.contains("button", "Log in").click();

    cy.url().should("eq", `${Cypress.config("baseUrl")}/dashboard`);
    cy.contains("Log out").click();
    cy.contains("a", "Log in").should("be.visible");

    cy.visit("/animal-types");
    cy.url().should("include", "/login");
  });

  it("shows an error for invalid credentials", () => {
    cy.visit("/login");
    cy.get("#email").type("wrong@example.com");
    cy.get("#password").type("wrong-password");
    cy.contains("button", "Log in").click();

    cy.contains("Incorrect email or password.").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("redirects unauthenticated visitors away from protected pages", () => {
    cy.visit("/animal-types");
    cy.url().should("include", "/login");
  });
});
