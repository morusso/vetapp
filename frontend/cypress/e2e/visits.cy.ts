describe("Visits CRUD", () => {
  let clientId: number;
  let animalTypeId: number;
  let breedId: number;
  let patientId: number;
  const patientName = `Cypress patient ${Date.now()}`;
  const vetLastName = `Cypress vet ${Date.now()}`;

  before(() => {
    cy.apiRequest<{ id: number }>("POST", "/api/v1/clients/", {
      first_name: "Cypress",
      last_name: `Visit owner ${Date.now()}`,
      email: `cypress.visit.owner.${Date.now()}@example.com`,
      phone_number: "+48 123 456 789",
      street: "Testowa 1",
      city: "Warszawa",
      postal_code: "00-950",
    })
      .then(({ body }) => {
        clientId = body.id;
        return cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/types/", {
          name: `Cypress fixture type ${Date.now()}`,
        });
      })
      .then(({ body }) => {
        animalTypeId = body.id;
        return cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/", {
          name: `Cypress fixture breed ${Date.now()}`,
          animal_type: animalTypeId,
        });
      })
      .then(({ body }) => {
        breedId = body.id;
        return cy.apiRequest<{ id: number }>("POST", "/api/v1/animals/patients/", {
          name: patientName,
          owner: clientId,
          breed: breedId,
        });
      })
      .then(({ body }) => {
        patientId = body.id;
        return cy.apiRequest("POST", "/api/v1/user/", {
          email: `cypress.vet.${Date.now()}@example.com`,
          password: "cypress-test-pass-123",
          first_name: "Cypress",
          last_name: vetLastName,
        });
      });
  });

  after(() => {
    cy.apiRequest("DELETE", `/api/v1/animals/patients/${patientId}/`, undefined, {
      failOnStatusCode: false,
    });
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

  it("creates, edits and deletes a visit", () => {
    cy.visit("/visits");
    cy.contains("a", "New visit").click();

    cy.url().should("include", "/visits/new");
    cy.get("#patient").click();
    cy.get('input[placeholder="Search..."]').type(patientName);
    cy.contains('[role="option"]', patientName).click();
    cy.get("#veterinarian").click();
    cy.get('input[placeholder="Search..."]').type(vetLastName);
    cy.contains('[role="option"]', vetLastName).click();
    cy.get("#visit_date").type("2026-06-01T10:30");
    cy.get("#diagnosis").type("Routine checkup.");
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/visits\/\d+$/);
    cy.contains("h2", patientName).should("be.visible");
    cy.contains("Routine checkup.").should("be.visible");

    cy.contains("a", "Edit").click();
    cy.url().should("include", "/edit");
    cy.get("#diagnosis").click().type("{selectall}{backspace}Follow-up needed.");
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/visits\/\d+$/);
    cy.contains("Follow-up needed.").should("be.visible");

    cy.visit("/visits");
    cy.contains("tr", patientName).find('[title="Delete"]').click();
    cy.contains("tr", patientName).should("not.exist");
  });
});
