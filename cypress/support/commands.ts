// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('button, a').contains(/logout|sign out/i).click()
})

// Command to wait for Angular to be ready
Cypress.Commands.add('waitForAngular', () => {
  cy.window().then((win: any) => {
    return new Promise<void>((resolve) => {
      if (win.getAllAngularTestabilities) {
        const testabilities = win.getAllAngularTestabilities()
        if (!testabilities || testabilities.length === 0) {
          resolve()
          return
        }
        
        let count = testabilities.length
        testabilities.forEach((testability: any) => {
          testability.whenStable(() => {
            count--
            if (count === 0) {
              resolve()
            }
          })
        })
      } else {
        resolve()
      }
    })
  })
})

// Declare custom commands for TypeScript (moved to end of file)
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<any>
      logout(): Chainable<any>
      waitForAngular(): Chainable<any>
    }
  }
}

export {}
