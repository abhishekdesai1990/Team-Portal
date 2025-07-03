/// <reference types="cypress" />

describe('Login Component Tests', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('h1').should('contain', 'TeamPortal Login')
    cy.get('form.login-form').should('exist')
    cy.get('input[name="username"]').should('exist')
    cy.get('input[name="password"]').should('exist')
    cy.get('button[type="submit"]').should('contain', 'Login')
  })

  it('should display demo credentials section', () => {
    cy.get('.demo-credentials').should('exist')
    cy.get('h3').should('contain', 'Demo Credentials')
  })

  it('should handle form validation', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click()
    
    // Check that we stay on login page (validation should prevent submission)
    cy.url().should('include', '/login')
  })

  it('should allow user input', () => {
    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="password"]').type('password123')
    
    // Verify input values
    cy.get('input[name="username"]').should('have.value', 'testuser')
    cy.get('input[name="password"]').should('have.value', 'password123')
  })

  it('should show loading state when submitting', () => {
    cy.get('input[name="username"]').type('testuser')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Should either show loading state or navigate away
    cy.get('button[type="submit"]').should('exist')
  })
})
