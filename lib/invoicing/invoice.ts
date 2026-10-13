import { logger } from '../logging';
import { LocalizationService } from './localization';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  billTo: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  language: string;
  paymentTerms: string;
  notes?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
}

export class InvoiceService {
  private static invoices = new Map<string, InvoiceData>();

  static async createInvoice(data: {
    billTo: string;
    items: InvoiceItem[];
    dueDate: Date;
    currency: string;
    language: string;
    paymentTerms?: string;
    notes?: string;
  }): Promise<InvoiceData | null> {
    try {
      const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const tax = subtotal * 0.1; // 10% tax
      const discount = 0;
      const total = subtotal + tax - discount;

      const invoice: InvoiceData = {
        id: `inv-${Date.now()}`,
        invoiceNumber: this.generateInvoiceNumber(),
        date: new Date(),
        dueDate: data.dueDate,
        billTo: data.billTo,
        items: data.items,
        subtotal,
        tax,
        discount,
        total,
        currency: data.currency,
        language: data.language,
        paymentTerms: data.paymentTerms || 'Net 30',
        notes: data.notes,
        status: 'draft',
        createdAt: new Date(),
      };

      this.invoices.set(invoice.id, invoice);
      logger.info('Invoice created', 'InvoiceService', { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber });
      return invoice;
    } catch (error) {
      logger.error('Failed to create invoice', error, 'InvoiceService');
      return null;
    }
  }

  static async getInvoice(invoiceId: string): Promise<InvoiceData | null> {
    try {
      return this.invoices.get(invoiceId) || null;
    } catch (error) {
      logger.error('Failed to get invoice', error, 'InvoiceService');
      return null;
    }
  }

  static async sendInvoice(invoiceId: string, email: string): Promise<boolean> {
    try {
      const invoice = this.invoices.get(invoiceId);
      if (!invoice) return false;

      invoice.status = 'sent';
      logger.info('Invoice sent', 'InvoiceService', { invoiceId, email });
      return true;
    } catch (error) {
      logger.error('Failed to send invoice', error, 'InvoiceService');
      return false;
    }
  }

  static async generatePDF(invoiceId: string): Promise<string | null> {
    try {
      const invoice = this.invoices.get(invoiceId);
      if (!invoice) return null;

      // Simulate PDF generation
      logger.info('PDF generated', 'InvoiceService', { invoiceId });
      return `https://invoices.example.com/${invoiceId}.pdf`;
    } catch (error) {
      logger.error('Failed to generate PDF', error, 'InvoiceService');
      return null;
    }
  }

  static async markAsPaid(invoiceId: string): Promise<boolean> {
    try {
      const invoice = this.invoices.get(invoiceId);
      if (!invoice) return false;

      invoice.status = 'paid';
      logger.info('Invoice marked as paid', 'InvoiceService', { invoiceId });
      return true;
    } catch (error) {
      logger.error('Failed to mark invoice as paid', error, 'InvoiceService');
      return false;
    }
  }

  static getHTMLPreview(invoiceId: string): string {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return '';

    const strings = LocalizationService.getStrings(invoice.language);

    return `
      <h1>${strings.invoice}</h1>
      <p>${strings.invoiceNumber}: ${invoice.invoiceNumber}</p>
      <p>${strings.billTo}: ${invoice.billTo}</p>
      <table>
        <tr>
          <th>${strings.description}</th>
          <th>${strings.quantity}</th>
          <th>${strings.unitPrice}</th>
          <th>${strings.amount}</th>
        </tr>
        ${invoice.items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td>${LocalizationService.formatCurrency(item.unitPrice, invoice.currency)}</td>
            <td>${LocalizationService.formatCurrency(item.quantity * item.unitPrice, invoice.currency)}</td>
          </tr>
        `).join('')}
      </table>
      <p>${strings.total}: ${LocalizationService.formatCurrency(invoice.total, invoice.currency)}</p>
    `;
  }

  private static generateInvoiceNumber(): string {
    return `INV-${Date.now().toString().slice(-6)}`;
  }
}
