'use client'

'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable } from '@/components/shared/data-table'
import { ModalForm } from '@/components/shared/modal-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { getProducts, createProduct, deleteProduct, updateProduct, getStoredUser, Product } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

const initialProduct: Partial<Product> = {
  name: '',
  sku: '',
  stock: 0,
  price: 0,
  status: 'In Stock',
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>(initialProduct)
  const [authUser, setAuthUser] = useState<{ role_id?: number | string } | null>(null)

  useEffect(() => {
    fetchProducts()
    setAuthUser(getStoredUser())
  }, [])

  const isStaff = Number(authUser?.role_id) === 2

  const fetchProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    }
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setNewProduct(initialProduct)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (id: number | string | undefined) => {
    if (id == null) return

    try {
      await deleteProduct(id)
      setProducts(products.filter((p) => p.id !== id))
      toast({
        title: 'Product deleted',
        description: 'The product was removed from inventory.',
      })
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast({
        title: 'Failed to delete product',
        description: 'There was an error deleting the product from the database.',
        variant: 'destructive',
      })
    }
  }

  const handleSaveProduct = async () => {
    try {
      if (editingProduct && editingProduct.id != null) {
        await updateProduct(editingProduct.id, {
          name: editingProduct.name,
          sku: editingProduct.sku,
          price: editingProduct.price,
          stock: editingProduct.stock,
        })
        toast({
          title: 'Product updated',
          description: 'Product changes were saved to the database.',
        })
      } else {
        const productToCreate = {
          name: newProduct.name || '',
          sku: newProduct.sku || '',
          price: newProduct.price || 0,
          stock: newProduct.stock || 0,
        }
        await createProduct(productToCreate)
        toast({
          title: 'Product added',
          description: 'The product was saved to the database.',
        })
      }

      await fetchProducts()
      setEditingProduct(null)
      setNewProduct(initialProduct)
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to save product:', error)
      toast({
        title: 'Failed to save product',
        description: 'There was an error saving the product.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  return (
    <MainLayout>
      <PageHeader
        title="Inventory Management"
        description="Manage your product inventory and stock levels."
        action={
          <Button onClick={handleAddProduct} className="gap-2" disabled={isStaff}>
            <Plus size={18} />
            Add Product
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', label: 'Product Name', width: 'w-40' },
            { key: 'sku', label: 'SKU', width: 'w-24' },
            { key: 'stock', label: 'Stock', width: 'w-20' },
            {
              key: 'price',
              label: 'Price',
              render: (val) => formatCurrency(val as number),
            },
            {
              key: 'status',
              label: 'Status',
              render: (val) => (
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(val as string)}`}>
                  {val}
                </span>
              ),
            },
            {
              key: 'id',
              label: 'Actions',
              render: (_, product) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditProduct(product)}
                    disabled={isStaff}
                    className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={isStaff}
                    className="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              ),
            },
          ]}
          data={products}
        />
      </div>

      {/* Add/Edit Modal */}
      <ModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        onSubmit={handleSaveProduct}
        submitLabel={editingProduct ? 'Update' : 'Add'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <Input
              placeholder="Enter product name"
              value={editingProduct?.name || newProduct.name || ''}
              onChange={(e) => {
                if (editingProduct) {
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                } else {
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>
            <Input
              placeholder="Enter SKU"
              value={editingProduct?.sku || newProduct.sku || ''}
              onChange={(e) => {
                if (editingProduct) {
                  setEditingProduct({ ...editingProduct, sku: e.target.value })
                } else {
                  setNewProduct({ ...newProduct, sku: e.target.value })
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stock</label>
              <Input
                type="number"
                placeholder=""
                value={editingProduct?.stock ?? newProduct.stock ?? ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0
                  if (editingProduct) {
                    setEditingProduct({ ...editingProduct, stock: value })
                  } else {
                    setNewProduct({ ...newProduct, stock: value })
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <Input
                type="number"
                placeholder="0.00"
                value={editingProduct?.price ?? newProduct.price ?? ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  if (editingProduct) {
                    setEditingProduct({ ...editingProduct, price: value })
                  } else {
                    setNewProduct({ ...newProduct, price: value })
                  }
                }}
              />
            </div>
          </div>
        </div>
      </ModalForm>
    </MainLayout>
  )
}
