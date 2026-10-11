'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
})

const quoteSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string(),
  clientId: z.string().min(1, 'Client required'),
  items: z.array(quoteItemSchema).min(1, 'At least one item required'),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  validUntil: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteFormProps {
  clientId?: string
  onSubmit: (data: QuoteFormData) => Promise<void>
  isLoading?: boolean
}

export function QuoteForm({
  clientId,
  onSubmit,
  isLoading = false
}: QuoteFormProps) {
  const [items, setItems] = useState<typeof quoteItemSchema._type[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ])

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      title: '',
      description: '',
      clientId: clientId || '',
      items: items,
      tax: 0,
      discount: 0,
    }
  })

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index)
      setItems(newItems)
      form.setValue('items', newItems)
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
    form.setValue('items', newItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const subtotal = calculateSubtotal()
  const tax = form.watch('tax')
  const discount = form.watch('discount')
  const total = subtotal + tax - discount

  async function handleSubmit(data: QuoteFormData) {
    data.items = items
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Quote Details</h3>
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote Title</FormLabel>
                <FormControl>
                  <Input placeholder="Web Development Project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Project description..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Input placeholder="Client ID" {...field} disabled={!!clientId} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Quote Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Line Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="w-20">
                  <label className="text-sm font-medium text-gray-700">Qty</label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="w-24">
                  <label className="text-sm font-medium text-gray-700">Price</label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                    placeholder="0"
                    step="0.01"
                  />
                </div>
                <div className="w-24 text-right">
                  <p className="text-sm font-medium text-gray-700">Total</p>
                  <p className="font-bold text-gray-900">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      step="0.01"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      step="0.01"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="border-t-2 pt-2 flex justify-between">
            <span className="font-bold text-lg text-gray-900">Total</span>
            <span className="font-bold text-lg text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Quote...' : 'Create Quote'}
        </Button>
      </form>
    </Form>
  )
}
