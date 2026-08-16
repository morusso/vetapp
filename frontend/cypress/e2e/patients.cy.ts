describe("Patients CRUD", () => {
  let clientId: number;
  let animalTypeId: number;
  let breedId: number;
  const ownerLastName = `Cypress owner ${Date.now()}`;
  const breedName = `Cypress fixture breed ${Date.now()}`;

  before(() => {
    cy.apiRequest<{ id: number }>("POST", "/api/v1/clients/", {
      first_name: "Cypress",
      last_name: ownerLastName,
      email: `cypress.patient.owner.${Date.now()}@example.com`,
      phone_number: "+48 123 456 789",
      street: "Testowa 1",
      city: "Warszawa",
      postal_code: "00-950",
    }).then(({ body }) => {
      clientId = body.id;
    });

    cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/types/", {
      name: `Cypress fixture type ${Date.now()}`,
    }).then(({ body }) => {
      animalTypeId = body.id;
      return cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/", {
        name: breedName,
        animal_type: animalTypeId,
      });
    }).then(({ body }) => {
      breedId = body.id;
    });
  });

  after(() => {
    cy.apiRequest("DELETE", `/api/v1/animals/${breedId}/`, undefined, {
      failOnStatusCode: false,
    });
    cy.apiRequest("DELETE", `/api/v1/animals/types/${animalTypeId}/`, undefined, {
      failOnStatusCode: false,
    });
    cy.apiRequest("DELETE", `/api/v1/clients/${clientId}/`, undefined, {
      failOnStatusCode: false,
    });
  });

  beforeEach(() => {
    cy.login();
  });

  it("creates, edits and deletes a patient", () => {
    const name = `Cypress patient ${Date.now()}`;
    const editedName = `${name} (edited)`;

    cy.visit("/patients");
    cy.contains("a", "New patient").click();

    cy.url().should("include", "/patients/new");
    cy.get("#name").type(name);
    cy.get("#owner").click();
    cy.get('input[placeholder="Search..."]').type(ownerLastName);
    cy.contains('[role="option"]', ownerLastName).click();
    cy.get("#breed").click();
    cy.get('input[placeholder="Search..."]').type(breedName);
    cy.contains('[role="option"]', breedName).click();
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/patients$/);
    cy.contains("tr", name)
      .should("be.visible")
      .and("contain.text", breedName)
      .and("contain.text", ownerLastName);

    cy.contains("tr", name).find('[title="Edit"]').click();
    cy.url().should("match", /\/patients\/\d+$/);
    cy.get("#name").clear();
    cy.get("#name").type(editedName);
    cy.contains("label", "Deceased").find('input[type="checkbox"]').check();
    cy.get("#date_of_death").type("2026-01-15");
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/patients$/);
    cy.contains("tr", editedName).should("be.visible").and("contain.text", "Deceased");

    cy.contains("tr", editedName).find('[title="Delete"]').click();
    cy.contains("tr", editedName).should("not.exist");
  });
});
