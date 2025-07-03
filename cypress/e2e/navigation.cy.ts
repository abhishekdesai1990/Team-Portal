/// <reference types="cypress" />

describe('Navigation Tests', () => {
  it('should redirect to login from root', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('should redirect protected routes to login when not authenticated', () => {
    // Test home route
    cy.visit('/home')
    cy.url().should('include', '/login')
    
    // Test jobs route
    cy.visit('/jobs')
    cy.url().should('include', '/login')
    
    // Test suggestions route
    cy.visit('/suggestions')
    cy.url().should('include', '/login')
    
    // Test admin route
    cy.visit('/admin')
    cy.url().should('include', '/login')
  })

  it('should handle invalid routes', () => {
    cy.visit('/invalid-route')
    cy.url().should('include', '/login')
  })

  it('should have proper page structure on login page', () => {
    cy.visit('/login')
    cy.get('app-root').should('exist')
    cy.get('body').should('be.visible')
    cy.get('.login-container').should('exist')
  })
})
