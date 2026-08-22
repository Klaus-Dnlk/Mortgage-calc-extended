/**
 * C: Creates and organizes end-to-end tests —
 * Smoke E2E: app loads and primary navigation is reachable.
 */
describe('Mortgage calculator smoke', () => {
  it('loads the application shell', () => {
    cy.visit('/');
    cy.contains(/mortgage|bank|calc/i).should('exist');
  });
});
