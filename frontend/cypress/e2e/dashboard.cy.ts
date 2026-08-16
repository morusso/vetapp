describe("Dashboard", () => {
  beforeEach(() => {
    cy.login();
  });

  it("links out to the main modules", () => {
    cy.visit("/dashboard");
    cy.contains("h1", "Dashboard").should("be.visible");

    cy.contains("a", "Clients").click();
    cy.url().should("include", "/clients");

    cy.visit("/dashboard");
    cy.contains("a", "Patients").click();
    cy.url().should("include", "/patients");

    cy.visit("/dashboard");
    cy.contains("a", "Users").click();
    cy.url().should("include", "/users");
  });
});
