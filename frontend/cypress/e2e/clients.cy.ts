describe("Clients CRUD", () => {
  beforeEach(() => {
    cy.login();
  });

  it("creates, edits and deletes a client", () => {
    const lastName = `Cypress client ${Date.now()}`;
    const editedLastName = `${lastName} (edited)`;

    cy.visit("/clients");
    cy.contains("a", "New client").click();

    cy.url().should("include", "/clients/new");
    cy.get("#first_name").type("Cypress");
    cy.get("#last_name").type(lastName);
    cy.get("#email").type(`cypress.client.${Date.now()}@example.com`);
    cy.get("#phone_number").type("+48 123 456 789");
    cy.get("#street").type("Testowa 1");
    cy.get("#city").type("Warszawa");
    cy.get("#postal_code").type("00-950");
    cy.contains("button", "Create").click();

    cy.url().should("match", /\/clients$/);
    cy.contains("tr", lastName).should("be.visible");

    cy.contains("tr", lastName).find('[title="Edit"]').click();
    cy.url().should("include", "/edit");
    cy.get("#last_name").clear();
    cy.get("#last_name").type(editedLastName);
    cy.contains("button", "Save").click();

    cy.url().should("match", /\/clients\/\d+$/);
    cy.contains("h2", editedLastName).should("be.visible");

    cy.visit("/clients");
    cy.contains("tr", editedLastName).find('[title="Delete"]').click();
    cy.contains("tr", editedLastName).should("not.exist");
  });

  it("shows a live validation error for an invalid email", () => {
    cy.visit("/clients/new");
    cy.get("#email").type("not-an-email");
    cy.get("#email").parent().should("contain.text", "Enter a valid email address.");
  });

  it("shows a live validation error for an invalid phone number", () => {
    cy.visit("/clients/new");
    cy.get("#phone_number").type("abc");
    cy.get("#phone_number")
      .parent()
      .should("contain.text", "Enter a valid phone number");
  });
});
