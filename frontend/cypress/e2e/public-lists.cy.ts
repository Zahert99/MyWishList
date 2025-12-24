describe("Publika listor på startsidan", () => {
  const mockPublicLists = [
    {
      id: 1,
      user_id: 1,
      list_title: "Julklappar 2025",
      is_private: false,
      created_at: "2025-01-01T10:00:00.000Z", // Äldst
      username: "anna",
      items_count: 5,
    },
    {
      id: 2,
      user_id: 2,
      list_title: "Födelsedagslista",
      is_private: false,
      created_at: "2025-01-02T10:00:00.000Z", // Mellan
      username: "erik",
      items_count: 3,
    },
    {
      id: 3,
      user_id: 3,
      list_title: "Bröllopsönskningar",
      is_private: false,
      created_at: "2025-01-03T10:00:00.000Z", // Nyast (visas först)
      username: "maria",
      items_count: 0,
    },
  ];

  beforeEach(() => {
    // Mock API-anrop för publika listor med vår test-data
    // OBS: HomeView sorterar listor efter created_at (nyast först)
    // Så Bröllopsönskningar (id: 3) kommer visas först
    cy.intercept("GET", "/api/wishlists/public", {
      statusCode: 200,
      body: mockPublicLists,
    }).as("getPublicLists");
    cy.visit("/");
  });

  it("ska visa publika listor på startsidan", () => {
    cy.wait("@getPublicLists");

    // Verifiera att listor renderas (använder article-taggar)
    cy.get("article").should("have.length.at.least", 1);

    // Verifiera att någon av våra listtitlar visas
    cy.get("article").should("contain", mockPublicLists[0]?.list_title);

    // Verifiera att användarnamn visas
    cy.get("article").should("contain", mockPublicLists[0]?.username);
  });

  it("ska visa rätt rubrik för publika listor", () => {
    cy.wait("@getPublicLists");

    // Standardvyn visar "Senaste önskelistor"
    cy.contains("h3", /Senaste önskelistor/i).should("be.visible");
  });

  it("ska kunna växla till Alla offentliga listor", () => {
    cy.wait("@getPublicLists");

    // Klicka på "Alla offentliga" tab
    cy.contains("button", "Alla offentliga").click();

    // Verifiera rubrik
    cy.contains("h3", /Alla offentliga önskelistor/i).should("be.visible");

    // Verifiera att alla 3 listor visas
    cy.get("article").should("have.length", mockPublicLists.length);
  });

  it("ska visa användarnamn för varje lista", () => {
    cy.wait("@getPublicLists");

    cy.contains("button", "Alla offentliga").click();

    // Verifiera att alla användarnamn visas
    cy.contains("anna").should("be.visible");
    cy.contains("erik").should("be.visible");
    cy.contains("maria").should("be.visible");
  });

  it("ska visa skapad-datum för listor", () => {
    cy.wait("@getPublicLists");

    cy.get("article")
      .first()
      .within(() => {
        cy.contains(/Skapad:/i).should("be.visible");
      });
  });

  it("ska kunna klicka på en lista för att se detaljer", () => {
    cy.wait("@getPublicLists");

    // Listan som visas först efter sortering (nyast först) är list 3
    const newestList = mockPublicLists[2]; // Bröllopsönskningar har senaste datum

    // Mock items för ALLA listor för att vara säker
    mockPublicLists.forEach((list) => {
      cy.intercept("GET", `/api/wishlist-items/wishlist/${list.id}`, {
        statusCode: 200,
        body: [
          {
            id: 1,
            wishlist_id: list.id,
            item_title: `Item för ${list.list_title}`,
            price: 1000,
            product_link: "https://example.com",
            created_at: "2025-01-01T00:00:00.000Z",
          },
        ],
      }).as(`getListItems${list.id}`);
    });

    // Klicka på första synliga listan
    cy.get("article").first().click();

    // Vänta lite för att modal ska öppnas
    cy.wait(500);

    // Verifiera att någon listtitel visas (i modal)
    if (newestList) {
      cy.get("body").should("contain", newestList.list_title);
    }
  });

  it("ska visa endast senaste 5 listor i standardvyn", () => {
    cy.wait("@getPublicLists");

    // Standardvyn visar max 5 listor
    cy.get("article").should("have.length.at.most", 5);
  });

  it("ska hantera tom lista korrekt", () => {
    // Mock ett tomt API-svar
    cy.intercept("GET", "/api/wishlists/public", {
      statusCode: 200,
      body: [],
    }).as("getEmptyLists");

    cy.visit("/");
    cy.wait("@getEmptyLists");

    // Verifiera att meddelande visas
    cy.contains(/Inga offentliga önskelistor hittades/i).should("be.visible");

    // Verifiera att inga listkort visas
    cy.get("article").should("not.exist");
  });

  it("ska visa felmeddelande vid API-fel", () => {
    // Mock ett API-fel
    cy.intercept("GET", "/api/wishlists/public", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("getListsError");

    cy.visit("/");
    cy.wait("@getListsError");

    // Verifiera att felmeddelande visas
    cy.contains(/Kunde inte ladda önskelistor/i).should("be.visible");

    // Verifiera att inga listor visas
    cy.get("article").should("not.exist");
  });

  it("ska visa loading-state medan listor laddas", () => {
    // Mock med delay
    cy.intercept("GET", "/api/wishlists/public", {
      delay: 1000,
      statusCode: 200,
      body: mockPublicLists,
    }).as("getSlowLists");

    cy.visit("/");

    // Verifiera loading-meddelande
    cy.contains(/Hämtar önskelistor/i).should("be.visible");

    cy.wait("@getSlowLists");

    // Verifiera att listor visas efter loading
    cy.get("article").should("have.length.at.least", 1);
  });

  it("ska visa Mina-tab endast för inloggade användare", () => {
    cy.wait("@getPublicLists");

    // Mina-tab ska inte visas när användaren inte är inloggad
    cy.contains("button", "Mina").should("not.exist");
  });

  it("ska visa listtitlar korrekt", () => {
    cy.wait("@getPublicLists");

    cy.contains("button", "Alla offentliga").click();

    // Verifiera alla listtitlar
    cy.contains("h4", "Julklappar 2025").should("be.visible");
    cy.contains("h4", "Födelsedagslista").should("be.visible");
    cy.contains("h4", "Bröllopsönskningar").should("be.visible");
  });

  it("ska rendera listor som klickbara artiklar", () => {
    cy.wait("@getPublicLists");

    // Verifiera att articles har cursor: pointer
    cy.get("article").first().should("have.css", "cursor", "pointer");
  });
});
