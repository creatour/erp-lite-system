describe('Dashboard Page', () => {
  beforeEach(() => {
    cy.loginUi('admin@erp.com', 'admin123')
  })

  it('loads data summary and renders chart elements', () => {
    cy.visit('/dashboard')
    cy.contains('Dashboard').should('be.visible')
    cy.contains('Total Sales').should('be.visible')
    cy.contains('Sales Overview').should('be.visible')
    cy.contains('Recent Transactions').should('be.visible')
    cy.get('svg').should('exist')
    cy.contains('button', '1M').click()
    cy.contains('button', '7D').click()
  })
})
