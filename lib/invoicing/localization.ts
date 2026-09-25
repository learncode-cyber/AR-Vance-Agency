interface LanguageStrings {
  invoice: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  billTo: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  paymentTerms: string;
  notes: string;
  thank_you: string;
}

export class LocalizationService {
  private static languages: Record<string, LanguageStrings> = {
    en: {
      invoice: 'Invoice',
      invoiceNumber: 'Invoice Number',
      date: 'Date',
      dueDate: 'Due Date',
      billTo: 'Bill To',
      description: 'Description',
      quantity: 'Quantity',
      unitPrice: 'Unit Price',
      amount: 'Amount',
      subtotal: 'Subtotal',
      tax: 'Tax',
      discount: 'Discount',
      total: 'Total',
      paymentTerms: 'Payment Terms',
      notes: 'Notes',
      thank_you: 'Thank you for your business!',
    },
    bn: {
      invoice: 'ইনভয়েস',
      invoiceNumber: 'ইনভয়েস নম্বর',
      date: 'তারিখ',
      dueDate: 'পেমেন্ট তারিখ',
      billTo: 'বিল প্রাপক',
      description: 'বর্ণনা',
      quantity: 'পরিমাণ',
      unitPrice: 'একক মূল্য',
      amount: 'মূল্য',
      subtotal: 'মোট',
      tax: 'ট্যাক্স',
      discount: 'ছাড়',
      total: 'সর্বমোট',
      paymentTerms: 'পেমেন্ট শর্ত',
      notes: 'নোট',
      thank_you: 'আপনার ব্যবসার জন্য ধন্যবাদ!',
    },
    ar: {
      invoice: 'فاتورة',
      invoiceNumber: 'رقم الفاتورة',
      date: 'التاريخ',
      dueDate: 'تاريخ الاستحقاق',
      billTo: 'إلى',
      description: 'الوصف',
      quantity: 'الكمية',
      unitPrice: 'سعر الوحدة',
      amount: 'المبلغ',
      subtotal: 'المجموع الفرعي',
      tax: 'الضريبة',
      discount: 'الخصم',
      total: 'الإجمالي',
      paymentTerms: 'شروط الدفع',
      notes: 'ملاحظات',
      thank_you: 'شكرا لك على عملك!',
    },
    es: {
      invoice: 'Factura',
      invoiceNumber: 'Número de Factura',
      date: 'Fecha',
      dueDate: 'Fecha de Vencimiento',
      billTo: 'Facturar a',
      description: 'Descripción',
      quantity: 'Cantidad',
      unitPrice: 'Precio Unitario',
      amount: 'Monto',
      subtotal: 'Subtotal',
      tax: 'Impuesto',
      discount: 'Descuento',
      total: 'Total',
      paymentTerms: 'Términos de Pago',
      notes: 'Notas',
      thank_you: '¡Gracias por su negocio!',
    },
    ja: {
      invoice: '請求書',
      invoiceNumber: '請求書番号',
      date: '日付',
      dueDate: '支払期限',
      billTo: '請求先',
      description: '説明',
      quantity: '数量',
      unitPrice: '単価',
      amount: '金額',
      subtotal: '小計',
      tax: '税金',
      discount: '割引',
      total: '合計',
      paymentTerms: '支払条件',
      notes: '注記',
      thank_you: 'ご利用ありがとうございました!',
    },
  };

  private static currencies: Record<string, { symbol: string; decimal: number }> = {
    USD: { symbol: '$', decimal: 2 },
    EUR: { symbol: '€', decimal: 2 },
    GBP: { symbol: '£', decimal: 2 },
    BDT: { symbol: '৳', decimal: 0 },
    AED: { symbol: 'د.إ', decimal: 2 },
    JPY: { symbol: '¥', decimal: 0 },
    CNY: { symbol: '¥', decimal: 2 },
    INR: { symbol: '₹', decimal: 2 },
    AUD: { symbol: 'A$', decimal: 2 },
  };

  static getStrings(language: string): LanguageStrings {
    return this.languages[language] || this.languages.en;
  }

  static getCurrency(currency: string) {
    return this.currencies[currency] || this.currencies.USD;
  }

  static formatCurrency(amount: number, currency: string): string {
    const cur = this.getCurrency(currency);
    return `${cur.symbol}${amount.toFixed(cur.decimal)}`;
  }
}
