'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import html2pdf from 'html2pdf.js'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

interface InvoiceTemplateProps {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientAddress?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  dueDate: string
  issueDate: string
  companyName: string
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    routingNumber?: string
  }
}

export function InvoiceTemplate({
  invoiceNumber,
  clientName,
  clientEmail,
  clientPhone,
  clientAddress,
  items,
  subtotal,
  tax,
  discount,
  total,
  dueDate,
  issueDate,
  companyName,
  companyEmail,
  companyPhone,
  companyAddress,
  bankDetails
}: InvoiceTemplateProps) {

  const downloadPDF = () => {
    const element = document.getElementById('invoice-content')
    const opt = {
      margin: 10,
      filename: `Invoice-${invoiceNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    }
    html2pdf().set(opt).from(element).save()
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="w-full">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-4 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadPDF}
        >
          <Download size={16} className="mr-2" />
          Download PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={printInvoice}
        >
          <Printer size={16} className="mr-2" />
          Print
        </Button>
      </div>

      {/* Invoice Content */}
      <div
        id="invoice-content"
        className="bg-white p-8 max-w-4xl mx-auto border border-gray-300"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{companyName}</h1>
            <p className="text-sm text-gray-600 mt-1">{companyAddress}</p>
            {companyPhone && <p className="text-sm text-gray-600">{companyPhone}</p>}
            <p className="text-sm text-gray-600">{companyEmail}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-blue-600">INVOICE</h2>
            <p className="text-gray-600 mt-2">Invoice #{invoiceNumber}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(issueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(dueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <p className="text-sm font-bold text-gray-600 mb-2">BILL TO</p>
          <div className="bg-gray-50 p-4">
            <p className="font-semibold text-gray-900">{clientName}</p>
            {clientAddress && <p className="text-sm text-gray-600">{clientAddress}</p>}
            {clientPhone && <p className="text-sm text-gray-600">{clientPhone}</p>}
            <p className="text-sm text-gray-600">{clientEmail}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-4 font-bold text-gray-900">Description</th>
                <th className="text-right py-2 px-4 font-bold text-gray-900 w-20">Qty</th>
                <th className="text-right py-2 px-4 font-bold text-gray-900 w-24">Unit Price</th>
                <th className="text-right py-2 px-4 font-bold text-gray-900 w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 px-4 text-gray-900">{item.description}</td>
                  <td className="py-3 px-4 text-right text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900 font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900 font-semibold">${tax.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Discount</span>
                <span className="text-gray-900 font-semibold">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 bg-blue-50 px-4 -mx-4 mt-2">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-blue-600 text-lg">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {bankDetails && (
          <div className="bg-gray-50 p-4 mb-8">
            <p className="text-sm font-bold text-gray-600 mb-2">PAYMENT DETAILS</p>
            <div className="text-sm text-gray-900 space-y-1">
              <p><span className="font-semibold">Account Name:</span> {bankDetails.accountName}</p>
              <p><span className="font-semibold">Bank Name:</span> {bankDetails.bankName}</p>
              <p><span className="font-semibold">Account Number:</span> {bankDetails.accountNumber}</p>
              {bankDetails.routingNumber && (
                <p><span className="font-semibold">Routing Number:</span> {bankDetails.routingNumber}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
          <p>Thank you for your business!</p>
          <p className="mt-1">If you have any questions about this invoice, please contact us.</p>
        </div>
      </div>
    </div>
  )
}
