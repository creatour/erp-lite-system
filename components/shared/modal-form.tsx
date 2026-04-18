'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ModalFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onSubmit?: () => void
  submitLabel?: string
  isLoading?: boolean
  submitDisabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function ModalForm({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  isLoading = false,
  submitDisabled = false,
  size = 'md',
}: ModalFormProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-background border border-border rounded-lg shadow-lg w-full ${sizeClass[size]} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {onSubmit && (
          <div className="sticky bottom-0 flex gap-3 p-6 border-t border-border bg-background">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1"
              disabled={isLoading || submitDisabled}
            >
              {submitLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
