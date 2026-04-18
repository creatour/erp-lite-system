describe('Order Management', () => {
  beforeEach(() => {
    cy.loginUi('admin@erp.com', 'admin123')
  })

  it('creates a new order through the order modal', () => {
    cy.visit('/orders')
    cy.contains('Orders Management').should('be.visible')
    cy.contains('button', 'Add Order').should('be.enabled').click()

    cy.contains('Select a customer…').click()
    cy.get('[role="option"]').filter(':visible').first().click()

    cy.contains('Choose product…').click()
    cy.get('[role="option"]').filter(':visible').first().click()

    cy.get('input[type="number"]').first().clear().type('1')
    cy.contains('button', 'Create Order').should('be.enabled').click()

    cy.contains('Order created').should('be.visible')
  })
})
