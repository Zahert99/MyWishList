// Import commands.js using ES2015 syntax:
import "./commands.ts";

// Import Cypress component testing
import { mount } from "cypress/react";

// Augment the Cypress namespace to include type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add("mount", mount);

// Example use:
// cy.mount(<MyComponent />)
