import React from "react";
import LoginForm from "../../src/components/LoginForm.tsx";
import { BrowserRouter } from "react-router-dom";
import type { User } from "../../src/types.js";

describe("LoginForm - Kan man logga in?", () => {
  let mockOnLogin: Cypress.Agent<sinon.SinonSpy>;
  let mockOnClose: Cypress.Agent<sinon.SinonSpy>;

  const mockUser: User = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    is_admin: false,
    created_at: "2025-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    mockOnLogin = cy.stub().as("onLogin");
    mockOnClose = cy.stub().as("onClose");
  });

  it("ska kunna logga in med användarnamn och lösenord", () => {
    cy.mount(
      <BrowserRouter>
        <LoginForm isOpen={true} onLogin={mockOnLogin} onClose={mockOnClose} />
      </BrowserRouter>
    );

    cy.intercept("POST", "/api/users/login", {
      statusCode: 200,
      body: {
        user: mockUser,
        token: "mock-token-123",
      },
    }).as("loginRequest");

    // Fyll i formulär
    cy.get('input[type="text"]').type("testuser");
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();

    // Verifiera att rätt data skickas
    cy.wait("@loginRequest").its("request.body").should("deep.equal", {
      username: "testuser",
      password: "password123",
    });

    // Verifiera att callback anropas
    cy.get("@onLogin").should("have.been.calledOnce");
  });

  it("ska kunna registrera ny användare", () => {
    cy.mount(
      <BrowserRouter>
        <LoginForm isOpen={true} onLogin={mockOnLogin} onClose={mockOnClose} />
      </BrowserRouter>
    );

    cy.intercept("POST", "/api/users", {
      statusCode: 201,
      body: {
        user: {
          id: 2,
          username: "newuser",
          email: "new@example.com",
          is_admin: false,
          created_at: "2025-01-01T00:00:00.000Z",
        },
      },
    }).as("registerRequest");

    // Växla till registrering
    cy.contains("button", "Registrera").click();

    // Fyll i formulär
    cy.get('input[type="text"]').type("newuser");
    cy.get('input[type="email"]').type("new@example.com");
    cy.get('input[type="password"]').type("password123");
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // Verifiera att rätt data skickas
    cy.wait("@registerRequest").its("request.body").should("deep.equal", {
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    });

    // Verifiera success-meddelande
    cy.contains("Konto skapat").should("be.visible");
  });

  it("ska visa felmeddelande vid fel lösenord", () => {
    cy.mount(
      <BrowserRouter>
        <LoginForm isOpen={true} onLogin={mockOnLogin} onClose={mockOnClose} />
      </BrowserRouter>
    );

    cy.intercept("POST", "/api/users/login", {
      statusCode: 401,
      body: { error: "Ogiltiga inloggningsuppgifter" },
    }).as("loginRequest");

    cy.get('input[type="text"]').type("testuser");
    cy.get('input[type="password"]').type("wrongpass");
    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest");
    cy.contains("Ogiltiga inloggningsuppgifter").should("be.visible");
  });
});
