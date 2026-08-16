describe("Medicine stock batches", () => {
  let medicineId: number;
  const medicineName = `Cypress fixture medicine ${Date.now()}`;

  before(() => {
    cy.apiRequest<{ id: number }>("POST", "/api/v1/clinical-data/medicines/", {
      name: medicineName,
      unit: "tablet",
    }).then(({ body }) => {
      medicineId = body.id;
    });
  });

  after(() => {
    cy.apiRequest("DELETE", `/api/v1/clinical-data/medicines/${medicineId}/`, undefined, {
      failOnStatusCode: false,
    });
  });

  beforeEach(() => {
    cy.login();
  });

  it("creates and deletes a stock batch", () => {
    const batchNumber = `CY-${Date.now()}`;
    const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    cy.visit("/medicine-batches");
    cy.contains("a", "New batch").click();

    cy.url().should("include", "/medicine-batches/new");
    cy.get("#medicine").click();
    cy.get('input[placeholder="Search..."]').type(medicineName);
    cy.contains('[role="option"]', medicineName).click();
    cy.get("#batch_number").type(batchNumber);
    cy.get("#quantity").type("100");
    cy.get("#supplier").type("Cypress Supplier Co.");
    cy.get("#expiry_date").type(expiryDate);
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/medicine-batches$/);
    cy.contains("tr", batchNumber).should("be.visible").and("contain.text", medicineName);

    cy.contains("tr", batchNumber).find('[title="Delete"]').click();
    cy.contains("tr", batchNumber).should("not.exist");
  });
});
