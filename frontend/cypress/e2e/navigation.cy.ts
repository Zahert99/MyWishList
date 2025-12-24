describe("Navigation - Viktiga Tester", () => {
  const mockPublicLists = [
    {
      id: 1,
      user_id: 1,
      list_title: "Testlista",
      is_private: false,
      created_at: "2025-01-01T00:00:00.000Z",
      username: "testuser",
      items_count: 2,
    },
  ];

  beforeEach(() => {
    cy.intercept("GET", "/api/wishlists/public", {
      statusCode: 200,
      body: mockPublicLists,
    }).as("getPublicLists");

    cy.visit("/");
  });

  it("ska ladda startsidan korrekt", () => {
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains(/Önskelistan|Wishlist/i).should("be.visible");
  });

  it("ska kunna växla tema (dark/light mode)", () => {
    cy.get("button")
      .contains(/Dark|Light|Mörkt|Ljust/i)
      .click();
    cy.get("body").should("have.attr", "data-theme");
  });

  it("ska visa inloggningsformulär när man klickar Logga in", () => {
    cy.contains("button", "Logga in").click();
    cy.get('input[type="text"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
  });

  it("ska kunna stänga inloggningsformulär", () => {
    cy.contains("button", "Logga in").click();
    cy.get('input[type="text"]').should("be.visible");

    // Stäng modal
    cy.contains("×").click();
    cy.get('input[type="text"]').should("not.exist");
  });

  it("ska visa publika önskelistor på startsidan", () => {
    cy.wait("@getPublicLists");
    cy.get("article").should("have.length.at.least", 1);
    cy.contains("Testlista").should("be.visible");
  });
});
