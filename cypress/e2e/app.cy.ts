/// <reference types="cypress" />

describe('Team Portal App', () => {
  it('should load the application', () => {
    cy.visit('/')
    // Since the app redirects to /login when not authenticated, check for that
    cy.url().should('include', '/login')
    cy.get('app-root').should('exist')
    cy.get('body').should('be.visible')
  })

  it('should have correct page title', () => {
    cy.visit('/')
    cy.title().should('eq', 'TeamPortal')
  })

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/home')
    cy.url().should('include', '/login')
  })

  it('should have responsive design', () => {
    cy.visit('/')
    
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')
    
    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
  })
})
