describe('ERP Login Page', () => {
  it('logs in as admin and redirects to dashboard', () => {
    // Visit the login page
    cy.visit('http://localhost:3000/login')

    // Fill out login credentials
    cy.get('#identifier')
      .should('be.visible')
      .clear()
      .type('admin@erp.com')

    cy.get('#password')
      .should('be.visible')
      .clear()
      .type('admin123')

    // Submit the login form
    cy.contains('button', 'Login')
      .should('be.enabled')
      .click()

    // Verify the user is redirected to the dashboard
    cy.location('pathname').should('eq', '/dashboard')

    // Confirm the dashboard page is visible
    cy.contains('Dashboard').should('be.visible')
  })
})
