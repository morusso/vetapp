describe("Animals CRUD", () => {
  let animalTypeId: number;
  const animalTypeName = `Cypress fixture type ${Date.now()}`;

  before(() => {
    cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/types/", {
      name: animalTypeName,
    }).then(({ body }) => {
      animalTypeId = body.id;
    });
  });

  after(() => {
    cy.apiRequest("DELETE", `/api/v1/animals/types/${animalTypeId}/`, undefined, {
      failOnStatusCode: false,
    });
  });

  beforeEach(() => {
    cy.login();
  });

  it("creates, edits and deletes an animal", () => {
    const name = `Cypress animal ${Date.now()}`;
    const editedName = `${name} (edited)`;

    cy.visit("/animals");
    cy.contains("a", "New animal").click();

    cy.url().should("include", "/animals/new");
    cy.get("#name").type(name);
    cy.get("#animal_type").select(animalTypeName);
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/animals$/);
    cy.contains("tr", name).should("be.visible").and("contain.text", animalTypeName);

    cy.contains("tr", name).find('[title="Edit"]').click();
    cy.get("#name").clear();
    cy.get("#name").type(editedName);
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/animals$/);
    cy.contains("tr", editedName).should("be.visible");

    cy.contains("tr", editedName).find('[title="Delete"]').click();
    cy.contains("tr", editedName).should("not.exist");
  });
});
