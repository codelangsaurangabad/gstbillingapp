import { Injectable } from '@angular/core';
import { Invoice, Customer } from '../models';

export interface PaymentDetails {
  customerId: string;
  customerName: string;
  totalBalance: number;
  pendingInvoices: Invoice[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor() {}

  getAllCustomersWithBalance(): PaymentDetails[] {
    const storedInvoices = localStorage.getItem('invoices');
    if (!storedInvoices) return [];

    const invoices = JSON.parse(storedInvoices) as Invoice[];
    const customerMap = new Map<string, PaymentDetails>();

    invoices.forEach(invoice => {
      if (invoice.status === 'Pending') {
        const customerId = invoice.customer.id;
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            customerId: customerId,
            customerName: invoice.customer.name,
            totalBalance: 0,
            pendingInvoices: []
          });
        }

        const customerDetails = customerMap.get(customerId)!;
        customerDetails.totalBalance += invoice.totalAmount;
        customerDetails.pendingInvoices.push(invoice);
      }
    });

    return Array.from(customerMap.values());
  }

  processPayment(invoices: Invoice[], paymentDetails: { [key: string]: { amount: number, method: 'Cash' | 'Cheque' | 'Online', referenceNumber?: string, remarks?: string } }): void {
    const storedInvoices = localStorage.getItem('invoices');
    if (!storedInvoices) return;

    const allInvoices = JSON.parse(storedInvoices) as Invoice[];
    
    invoices.forEach(payingInvoice => {
      const payment = paymentDetails[payingInvoice.id];
      const index = allInvoices.findIndex(inv => inv.id === payingInvoice.id);
      
      if (index !== -1) {
        if (!allInvoices[index].payments) {
          allInvoices[index].payments = [];
        }
        
        allInvoices[index].payments.push({
          date: new Date().toISOString(),
          amount: payment.amount,
          method: payment.method,
          referenceNumber: payment.referenceNumber,
          remarks: payment.remarks
        });

        const totalPaid = allInvoices[index].payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid >= allInvoices[index].totalAmount) {
          allInvoices[index].status = 'Paid';
        }
      }
    });

    localStorage.setItem('invoices', JSON.stringify(allInvoices));
  }
}