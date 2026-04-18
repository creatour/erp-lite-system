describe('Role-based Access', () => {
  const staffEmail = `staff.${Date.now()}@erp.com`

  it('prevents staff from creating orders and accessing admin-only user management', () => {
    cy.createStaffUser('admin@erp.com', 'admin123', staffEmail).then(() => {
      cy.loginUi(staffEmail, 'staff123')
      cy.visit('/orders')
      cy.contains('button', 'Add Order').should('be.disabled')
      cy.visit('/user-management')
      cy.location('pathname').should('eq', '/dashboard')
    })
  })
})
