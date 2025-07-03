/// <reference types="cypress" />

describe('Basic Cypress Test', () => {
  it('should be able to visit a page', () => {
    cy.visit('http://localhost:4200', { timeout: 30000 })
    cy.get('body').should('exist')
  })
})
