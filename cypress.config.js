/**
 * C: Configures test framework / Creates and organizes end-to-end tests —
 * Cypress config organizes browser-level smoke specs under cypress/e2e.
 * Install cypress as a devDependency to execute: npx cypress open|run
 */
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    video: false,
  },
});
