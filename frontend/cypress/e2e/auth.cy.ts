describe("Autentisering", () => {
  it("ska låta en användare logga in och se sin profil", () => {
    cy.visit("/");
    cy.contains("Logga in").click();

    cy.get('input[type="text"]').type("zzz");
    cy.get('input[type="password"]').type("123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/");
  });
});
