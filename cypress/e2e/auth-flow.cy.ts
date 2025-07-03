/// <reference types="cypress" />

describe('Authentication Flow', () => {
  it('should successfully login with demo credentials', () => {
    cy.visit('/login')
    
    // Check if demo credentials are visible
    cy.get('.demo-credentials').should('exist')
    
    // Try to login with demo credentials (adjust based on what's available)
    // We'll use the custom login command
    cy.get('input[name="username"]').type('admin')
    cy.get('input[name="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    
    // After successful login, should redirect away from login page
    // This might take a moment, so we'll wait a bit
    cy.url({ timeout: 10000 }).should('not.include', '/login')
  })

//   it('should show error for invalid credentials', () => {
//     cy.visit('/login')
    
//     cy.get('input[name="username"]').type('wronguser')
//     cy.get('input[name="password"]').type('wrongpass')
//     cy.get('button[type="submit"]').click()
    
//     // Should stay on login page and show error
//     cy.url().should('include', '/login')
//     // Check for error message (if implemented)
//     cy.get('.error-message').should('exist')
//   })

  it('should require both username and password', () => {
    cy.visit('/login')
    
    // Try submitting with only username
    cy.get('input[name="username"]').type('admin')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
    
    // Clear and try with only password
    cy.get('input[name="username"]').clear()
    cy.get('input[name="password"]').type('password')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/login')
  })
})
