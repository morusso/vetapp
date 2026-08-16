describe("Services CRUD", () => {
  beforeEach(() => {
    cy.login();
  });

  it("creates, edits and deletes a service", () => {
    const name = `Cypress service ${Date.now()}`;
    const editedName = `${name} (edited)`;

    cy.visit("/services");
    cy.contains("a", "New service").click();

    cy.url().should("include", "/services/new");
    cy.get("#name").type(name);
    cy.get("#price").type("49.99");
    cy.get("#duration_minutes").type("30");
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/services$/);
    cy.contains("tr", name).should("be.visible").and("contain.text", "30 min");

    cy.contains("tr", name).find('[title="Edit"]').click();
    cy.url().should("match", /\/services\/\d+$/);
    cy.get("#name").clear();
    cy.get("#name").type(editedName);
    cy.contains("label", "Active").find('input[type="checkbox"]').uncheck();
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/services$/);
    cy.contains("tr", editedName).should("be.visible").and("contain.text", "Inactive");

    cy.contains("tr", editedName).find('[title="Delete"]').click();
    cy.contains("tr", editedName).should("not.exist");
  });
});
