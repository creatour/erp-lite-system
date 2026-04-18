// Custom Cypress commands can be added here.
// Example:
// Cypress.Commands.add('login', (email, password) => { ... })

Cypress.Commands.add('loginUi', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('#identifier').should('be.visible').clear().type(email)
  cy.get('#password').should('be.visible').clear().type(password)
  cy.contains('button', 'Login').should('be.enabled').click()
  cy.location('pathname').should('eq', '/dashboard')
})

Cypress.Commands.add('loginApi', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { identifier: email, password },
  }).then((response) => {
    expect(response.status).to.eq(200)
    const { token, user } = response.body
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('erp_lite_user', JSON.stringify(user))
  })
})

Cypress.Commands.add('createStaffUser', (adminEmail: string, adminPassword: string, staffEmail: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { identifier: adminEmail, password: adminPassword },
  }).then((loginResponse) => {
    expect(loginResponse.status).to.eq(200)
    const { token } = loginResponse.body
    const staffUsername = staffEmail.split('@')[0]

    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/users`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        username: staffUsername,
        email: staffEmail,
        password: 'staff123',
        role_name: 'Staff',
        role: 'Staff',
        status: 'active',
      },
      failOnStatusCode: false,
    }).then((createResponse) => {
      expect([200, 201]).to.include(createResponse.status)
      return createResponse.body
    })
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginUi(email: string, password: string): Chainable<void>
      loginApi(email: string, password: string): Chainable<void>
      createStaffUser(adminEmail: string, adminPassword: string, staffEmail: string): Chainable<any>
    }
  }
}

export {}
