'use client'

'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { ModalForm } from '@/components/shared/modal-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getStoredUser, Customer } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

const initialCustomer: Customer = {
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [authUser, setAuthUser] = useState<{ role_id?: number | string } | null>(null)

  useEffect(() => {
    fetchCustomers()
    setAuthUser(getStoredUser())
  }, [])

  const isStaff = Number(authUser?.role_id) === 2

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleDeleteCustomer = async (id: string | number | undefined) => {
    if (id == null) return
    try {
      await deleteCustomer(id)
      setCustomers(customers.filter((c) => c.id !== id))
      toast({
        title: 'Customer deleted',
        description: 'Customer was removed from the database.',
      })
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toast({
        title: 'Delete failed',
        description: 'Unable to remove the customer.',
        variant: 'destructive',
      })
    }
  }

  const handleSaveCustomer = async () => {
    const customerToSave = editingCustomer ?? initialCustomer

    const existing = customerToSave.id
      ? customers.find((c) => c.id === customerToSave.id)
      : undefined

    if (existing) {
      try {
        const updated = await updateCustomer(customerToSave.id as number | string, customerToSave)
        setCustomers(
          customers.map((c) =>
            c.id === updated.id ? updated : c
          )
        )
        toast({
          title: 'Customer updated',
          description: 'Customer changes were saved to the database.',
        })
      } catch (error) {
        console.error('Failed to update customer:', error)
        toast({
          title: 'Failed to update customer',
          description: 'There was an error saving the customer.',
          variant: 'destructive',
        })
      }
    } else {
      try {
        const created = await createCustomer(customerToSave)
        setCustomers([
          ...customers,
          {
            ...created,
            status: customerToSave.status || 'active',
            created_at: created.created_at || new Date().toISOString(),
          },
        ])
        toast({
          title: 'Customer added',
          description: 'Customer was saved to the database.',
        })
      } catch (error) {
        console.error('Failed to create customer:', error)
        toast({
          title: 'Failed to add customer',
          description: 'There was an error saving the customer.',
          variant: 'destructive',
        })
      }
    }

    setIsModalOpen(false)
    setEditingCustomer(null)
  }

  return (
    <MainLayout>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and contact information."
        action={
          <Button onClick={handleAddCustomer} className="gap-2" disabled={isStaff}>
            <Plus size={18} />
            Add Customer
          </Button>
        }
      />

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', label: 'Name', width: 'w-32' },
            {
              key: 'email',
              label: 'Email',
              render: (val) => (
                <a
                  href={`mailto:${String(val)}`}
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Mail size={14} />
                  {String(val)}
                </a>
              ),
            },
            {
              key: 'phone',
              label: 'Phone',
              render: (val) => (
                <span className="flex items-center gap-2">
                  <Phone size={14} />
                  {String(val)}
                </span>
              ),
            },
            { key: 'address', label: 'Address', width: 'w-52' },
            {
              key: 'created_at',
              label: 'Joined',
              render: (val) =>
                val ? formatDate(new Date(String(val))) : '-',
            },
            {
              key: 'id',
              label: 'Actions',
              render: (_, customer) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCustomer(customer as Customer)}
                    disabled={isStaff}
                    className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer((customer as Customer).id)}
                    disabled={isStaff}
                    className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredCustomers}
        />
      </div>

      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        onSubmit={handleSaveCustomer}
        submitLabel={editingCustomer ? 'Update' : 'Add'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              placeholder="Enter full name"
              defaultValue={editingCustomer?.name || ''}
              onChange={(e) =>
                setEditingCustomer(
                  editingCustomer
                    ? { ...editingCustomer, name: e.target.value }
                    : { ...initialCustomer, name: e.target.value }
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="Enter email address"
              defaultValue={editingCustomer?.email || ''}
              onChange={(e) =>
                setEditingCustomer(
                  editingCustomer
                    ? { ...editingCustomer, email: e.target.value }
                    : { ...initialCustomer, email: e.target.value }
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <Input
              placeholder="Enter phone number"
              defaultValue={editingCustomer?.phone || ''}
              onChange={(e) =>
                setEditingCustomer(
                  editingCustomer
                    ? { ...editingCustomer, phone: e.target.value }
                    : { ...initialCustomer, phone: e.target.value }
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input
              placeholder="Enter address"
              defaultValue={editingCustomer?.address || ''}
              onChange={(e) =>
                setEditingCustomer(
                  editingCustomer
                    ? { ...editingCustomer, address: e.target.value }
                    : { ...initialCustomer, address: e.target.value }
                )
              }
            />
          </div>
        </div>
      </ModalForm>
    </MainLayout>
  )
}

