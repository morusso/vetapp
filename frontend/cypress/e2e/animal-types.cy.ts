describe("Animal types CRUD", () => {
  beforeEach(() => {
    cy.login();
  });

  it("creates, edits and deletes an animal type", () => {
    const name = `Cypress type ${Date.now()}`;
    const editedName = `${name} (edited)`;

    cy.visit("/animal-types");
    cy.contains("a", "New animal type").click();

    cy.url().should("include", "/animal-types/new");
    cy.get("#name").type(name);
    cy.get("#description").type("Created by a Cypress e2e test.");
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/animal-types$/);
    cy.contains("li", name).should("be.visible");

    cy.contains("li", name).contains("a", "Edit").click();
    cy.get("#name").clear();
    cy.get("#name").type(editedName);
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/animal-types$/);
    cy.contains("li", editedName).should("be.visible");

    cy.contains("li", editedName).contains("button", "Delete").click();
    cy.contains("li", editedName).should("not.exist");
  });

  it("shows a validation error for a duplicate name", () => {
    const name = `Cypress duplicate ${Date.now()}`;

    cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/types/", { name }).then(
      ({ body }) => {
        cy.visit("/animal-types/new");
        cy.get("#name").type(name);
        cy.contains("button", "Create").click();

        cy.get("#name").parent().should("contain.text", "already exists");
        cy.url().should("include", "/animal-types/new");

        cy.apiRequest("DELETE", `/api/v1/animals/types/${body.id}/`);
      }
    );
  });
});
