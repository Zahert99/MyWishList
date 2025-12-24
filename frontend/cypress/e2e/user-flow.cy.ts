describe("Fullständigt användarflöde med cy.intercept", () => {
  const timestamp = Date.now();
  const testUser = {
    username: `tester_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: "Password123!",
    wishlistTitle: "Mina önskningar 2025",
    itemName: "Playstation 5",
    itemPrice: "5400",
    itemLink: "https://sony.se/ps5",
  };

  beforeEach(() => {
    // Sätt upp intercepts för att övervaka API-trafik och säkerställa stabilitet
    cy.intercept("POST", "/api/users").as("registerRequest");
    cy.intercept("POST", "/api/users/login").as("loginRequest");
    cy.intercept("GET", "/api/users/me").as("getMeRequest");
    cy.intercept("POST", "/api/wishlists/*").as("createWishlistRequest");
    cy.intercept("GET", "/api/wishlists/user/*").as("getUserListsRequest");
    cy.intercept("POST", "/api/wishlist-items/*").as("addItemRequest");
    cy.intercept("GET", "/api/wishlist-items/wishlist/*").as("getItemsRequest");
  });

  it("ska registrera, logga in, skapa lista och lägga till item", () => {
    // 1. Besök startsidan
    cy.visit("/");

    // 2. Registrering
    cy.contains("Logga in").click();
    cy.contains("button", "Registrera").click();

    cy.get('input[autoComplete="username"]').type(testUser.username);
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[autoComplete="new-password"]').type(testUser.password);
    cy.get('input[type="checkbox"]').check(); // Godkänn integritetspolicy

    cy.get('button[type="submit"]').click();
    cy.wait("@registerRequest").its("response.statusCode").should("eq", 201);

    // 3. Inloggning
    cy.get('input[autoComplete="username email"]').type(testUser.username);
    cy.get('input[autoComplete="current-password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);

    // 4. Navigera till Min Profil
    cy.get("button").contains(testUser.username).click();
    cy.contains("Min Profil").click();

    cy.wait("@getMeRequest");
    cy.wait("@getUserListsRequest");
    cy.url().should("include", "/me");

    // 5. Skapa en Wishlist - FIX: Använd within för att hantera modal-overlay
    cy.contains("button", "Create List").click();

    // Vi filtrerar fram den aktiva modalen för att inte klicka på element i bakgrunden
    cy.get("div")
      .filter((_, el) => el.style.position === "fixed")
      .last()
      .within(() => {
        cy.get('input[placeholder="List title"]').type(testUser.wishlistTitle);
        // Regex /^Create$/ säkerställer att vi inte råkar klicka på "Create List" i bakgrunden
        cy.get("button")
          .contains(/^Create$/)
          .click();
      });

    cy.wait("@createWishlistRequest")
      .its("response.statusCode")
      .should("eq", 201);

    // 6. Öppna listan och lägg till ett föremål
    // Vi klickar på det specifika kortet som skapades
    cy.get(".list-card").contains(testUser.wishlistTitle).click();
    cy.wait("@getItemsRequest");

    // Använd within igen för att hantera ListDetails-modalen
    cy.get("div")
      .filter((_, el) => el.style.position === "fixed")
      .last()
      .within(() => {
        cy.get('input[placeholder="Namn på föremål"]').type(testUser.itemName);
        cy.get('input[placeholder="Pris"]').type(testUser.itemPrice);
        cy.get('input[placeholder="Produktlänk"]').type(testUser.itemLink);

        cy.get("button").contains("Lägg till").click();
      });

    cy.wait("@addItemRequest").its("response.statusCode").should("eq", 201);

    // // 7. Slutlig verifiering
    // cy.contains("h4", testUser.itemName).should("be.visible");
    // cy.contains("div", `${testUser.itemPrice} kr`).should("be.visible");
  });
});
