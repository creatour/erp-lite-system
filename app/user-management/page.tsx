'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { ModalForm } from '@/components/shared/modal-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, Search, Shield } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUsers, createUser, updateUser, deleteUser, getStoredUser, User } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

const initialUser: Partial<User> = {
  username: '',
  email: '',
  role_name: 'Staff',
  role: 'Staff',
  password: '',
  status: 'active',
}

const roleOptions = ['Admin', 'Manager', 'Staff'] as const
const statusOptions = ['active', 'inactive'] as const

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formUser, setFormUser] = useState<Partial<User>>(initialUser)
  const [authUser, setAuthUser] = useState<{ role_id?: number | string; role_name?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    setAuthUser(storedUser)
    
    // Redirect non-admin users away from User Management
    if (storedUser && Number(storedUser.role_id) !== 1) {
      router.replace('/dashboard')
      return
    }
    
    setIsLoading(false)
    fetchUsers()
  }, [router])

  // Get user role from stored user
  const userRoleId = Number(authUser?.role_id)
  const userRole = authUser?.role_name || 'Staff'
  const isAdmin = userRoleId === 1
  const isManager = userRoleId === 2
  
  // If not admin, don't render the page content
  if (!isAdmin && !isLoading) {
    return null
  }

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast({
        title: 'Unable to load users',
        description: 'There was a problem loading the user list.',
        variant: 'destructive',
      })
    }
  }

  const filteredUsers = users.filter((u) =>
    String(u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = () => {
    // Ensure form is clean - reset to initial state
    setFormUser({ ...initialUser })
    // Clear editing state
    setEditingUser(null)
    // Open modal
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    // Set editing state
    setEditingUser(user)
    // Populate form with user data
    setFormUser({
      username: user.username,
      email: user.email,
      role_name: user.role_name || 'Staff',
      role: user.role || 'Staff',
      status: user.status || 'active',
      // Don't include password when editing
    })
    // Open modal
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    // Close modal
    setIsModalOpen(false)
    // Clear editing state
    setEditingUser(null)
    // Reset form - this ensures next modal open is clean
    setFormUser({ ...initialUser })
    // Search state remains untouched
  }

  const handleDeleteUser = async (id: number | string | undefined) => {
    if (!id) return
    try {
      await deleteUser(id)
      setUsers(users.filter((u) => u.id !== id))
      toast({
        title: 'User deleted',
        description: 'User was removed from the database.',
      })
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: 'Delete failed',
        description: 'Unable to remove this user.',
        variant: 'destructive',
      })
    }
  }

  const handleSaveUser = async () => {
    if (!formUser.username?.trim() || !formUser.email?.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please enter both a name and email address.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      username: formUser.username.trim(),
      email: formUser.email.trim(),
      role_name: formUser.role_name || 'Staff',
      role: formUser.role || 'Staff',
      password: formUser.password?.trim() || undefined,
      status: formUser.status || 'active',
    }

    try {
      if (editingUser?.id) {
        const updated = await updateUser(editingUser.id, payload)
        setUsers(users.map((u) => (u.id === updated.id ? updated : u)))
        toast({
          title: 'User updated',
          description: 'User details were saved to the database.',
        })
      } else {
        const created = await createUser(payload)
        setUsers([created, ...users])
        toast({
          title: 'User added',
          description: 'New user was saved to the database.',
        })
      }
      handleCloseModal()
    } catch (error) {
      console.error('Failed to save user:', error)
      toast({
        title: 'Save failed',
        description: 'Unable to save this user.',
        variant: 'destructive',
      })
    }
  }

  const toggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'inactive' ? 'active' : 'inactive'
    try {
      const updated = await updateUser(user.id!, {
        ...user,
        status: nextStatus,
      })
      setUsers(users.map((u) => (u.id === user.id ? updated : u)))
      toast({
        title: 'Status updated',
        description: `User status changed to ${nextStatus}.`,
      })
    } catch (error) {
      console.error('Failed to update status:', error)
      toast({
        title: 'Status update failed',
        description: 'Unable to change the user status.',
        variant: 'destructive',
      })
    }
  }

  const getRoleBadgeColor = (role = '') => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getStatusBadgeColor = (status = '') => {
    return status === 'active'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <MainLayout>
      <PageHeader
        title="User Management"
        description="Manage team members and their access permissions."
        action={
          isAdmin && (
            <Button onClick={handleAddUser} className="gap-2">
              <Plus size={18} />
              Add User
            </Button>
          )
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
            {
              key: 'username',
              label: 'Name',
              render: (val, user) => (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                    {(user as User).username
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  {val}
                </div>
              ),
            },
            { key: 'email', label: 'Email', width: 'w-48' },
            {
              key: 'role_name',
              label: 'Role',
              render: (val) => (
                <div className="flex items-center gap-2">
                  <Shield size={14} />
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeColor(val as string)}`}>
                    {val}
                  </span>
                </div>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (val, user) => (
                <button
                  onClick={() => toggleUserStatus(user as User)}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(val as string)} transition-colors hover:opacity-80`}
                >
                  {String(val)}
                </button>
              ),
            },
            {
              key: 'created_at',
              label: 'Join Date',
              render: (val) =>
                val
                  ? new Date(String(val)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-',
            },
            {
              key: 'id',
              label: 'Actions',
              render: (_, user) => (
                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditUser(user as User)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit user"
                      >
                        <Edit size={16} className="text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser((user as User).id)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredUsers}
        />
      </div>

      <ModalForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
        onSubmit={handleSaveUser}
        submitLabel={editingUser ? 'Update' : 'Add'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <Input
              placeholder="Enter full name"
              value={formUser.username || ''}
              onChange={(e) =>
                setFormUser({ ...formUser, username: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formUser.email || ''}
              onChange={(e) =>
                setFormUser({ ...formUser, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter a password'}
              value={formUser.password || ''}
              onChange={(e) =>
                setFormUser({ ...formUser, password: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <Select
              value={formUser.role_name || 'Staff'}
              onValueChange={(value) =>
                setFormUser({ ...formUser, role_name: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={formUser.status || 'active'}
              onValueChange={(value) =>
                setFormUser({ ...formUser, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ModalForm>
    </MainLayout>
  )
}
