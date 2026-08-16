describe("Medicines CRUD", () => {
  beforeEach(() => {
    cy.login();
  });

  it("creates, edits and deletes a medicine", () => {
    const name = `Cypress medicine ${Date.now()}`;
    const editedName = `${name} (edited)`;

    cy.visit("/medicines");
    cy.contains("a", "New medicine").click();

    cy.url().should("include", "/medicines/new");
    cy.get("#name").type(name);
    cy.get("#unit").type("tablet");
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/medicines$/);
    cy.contains("tr", name).should("be.visible");

    cy.contains("tr", name).find('[title="Edit"]').click();
    cy.url().should("match", /\/medicines\/\d+$/);
    cy.get("#name").clear();
    cy.get("#name").type(editedName);
    cy.contains("label", "Requires prescription").find('input[type="checkbox"]').check();
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/medicines$/);
    cy.contains("tr", editedName).should("be.visible").and("contain.text", "Rx");

    cy.contains("tr", editedName).find('[title="Delete"]').click();
    cy.contains("tr", editedName).should("not.exist");
  });
});
