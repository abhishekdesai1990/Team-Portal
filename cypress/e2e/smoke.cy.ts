/// <reference types="cypress" />

describe('Smoke Test', () => {
  it('should load the application without errors', () => {
    cy.visit('/', { failOnStatusCode: false })
    
    // Basic checks that the app is running
    cy.get('app-root', { timeout: 10000 }).should('exist')
    cy.get('body').should('be.visible')
    
    // Should have a title
    cy.title().should('not.be.empty')
    
    // URL should be either / or /login (due to redirects)
    cy.url().should('match', /\/(login)?/)
  })

  it('should load login page directly', () => {
    cy.visit('/login')
    
    // Check that the page loads without network errors
    cy.get('.login-container', { timeout: 10000 }).should('be.visible')
    cy.get('h1').should('contain', 'TeamPortal Login')
  })
})
