import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Invoice, Customer } from '../../models';
import { PaymentService, PaymentDetails } from '../../services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  template: `
    <div class="container">
      <h2>Payment Collection</h2>
      
      <div class="customers-table" *ngIf="customerPayments.length > 0">
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Total Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let payment of customerPayments">
              <td>{{ payment.customerName }}</td>
              <td>{{ payment.totalBalance | currency:'INR' }}</td>
              <td>
                <button class="collect-button" (click)="selectCustomerForPayment(payment)">Collect Payment</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="selectedPayment" class="payment-modal">
        <h3>Collect Payment - {{ selectedPayment.customerName }}</h3>

      <div *ngIf="pendingInvoices.length === 0" class="no-records">
        <p>No pending invoices found for selected customer.</p>
      </div>

      <div *ngIf="pendingInvoices.length > 0" class="payment-section">
        <table class="invoice-table">
          <thead>
            <tr>
              <th><input type="checkbox" [(ngModel)]="selectAll" (change)="toggleSelectAll()"></th>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Balance</th>
              <th>Payment Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let invoice of pendingInvoices">
              <td>
                <input type="checkbox" [(ngModel)]="invoice.selected" (change)="updateTotalPayment()">
              </td>
              <td>{{ invoice.invoiceNo }}</td>
              <td>{{ invoice.date | date:'mediumDate' }}</td>
              <td>{{ invoice.totalAmount | currency:'INR' }}</td>
              <td>{{ getBalanceAmount(invoice) | currency:'INR' }}</td>
              <td>
                <input type="number"
                  [disabled]="!invoice.selected"
                  [(ngModel)]="invoice.paymentAmount"
                  (ngModelChange)="updateTotalPayment()"
                  [max]="getBalanceAmount(invoice)"
                  min="0"
                  class="payment-input">
              </td>
            </tr>
          </tbody>
        </table>

        <div class="payment-summary">
          <div class="total-amount">
            <span>Total Payment Amount:</span>
            <span class="amount">{{ totalPaymentAmount | currency:'INR' }}</span>
          </div>
          <button class="pay-button" 
            [disabled]="totalPaymentAmount <= 0" 
            (click)="processPayment()">
            Process Payment
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .customers-table table {
      width: 100%;
      margin-bottom: 20px;
      border-collapse: collapse;
    }
    .customers-table th,
    .customers-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .customers-table th {
      background-color: #f5f5f5;
    }
    .collect-button {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .collect-button:hover {
      background-color: #0056b3;
    }
    .payment-modal {
      margin-top: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .invoice-table th,
    .invoice-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .invoice-table th {
      background-color: #f5f5f5;
    }
    .payment-input {
      width: 120px;
      padding: 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .payment-summary {
      margin-top: 20px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-amount {
      font-size: 1.2em;
    }
    .amount {
      font-weight: bold;
      margin-left: 10px;
    }
    .pay-button {
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .pay-button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
    .no-records {
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-top: 20px;
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ]
})
export class PaymentComponent implements OnInit {
  customerPayments: PaymentDetails[] = [];
  selectedPayment: PaymentDetails | null = null;
  selectedCustomer: Customer | null = null;
  pendingInvoices: (Invoice & { selected?: boolean; paymentAmount?: number; paymentMethod?: 'Cash' | 'Cheque' | 'Online'; referenceNumber?: string; remarks?: string })[] = [];
  selectAll: boolean = false;
  totalPaymentAmount: number = 0;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadCustomerPayments();
  }

  loadCustomerPayments() {
    this.customerPayments = this.paymentService.getAllCustomersWithBalance();
  }

  selectCustomerForPayment(payment: PaymentDetails) {
    this.selectedPayment = payment;
    this.pendingInvoices = payment.pendingInvoices.map(invoice => ({
      ...invoice,
      selected: false,
      paymentAmount: 0
    }));
  }

  loadCustomerInvoices() {
    if (!this.selectedCustomer) {
      this.pendingInvoices = [];
      return;
    }

    const storedInvoices = localStorage.getItem('invoices');
    if (storedInvoices) {
      const invoices = JSON.parse(storedInvoices) as Invoice[];
      this.pendingInvoices = invoices
        .filter(invoice => 
          invoice.customer.id === this.selectedCustomer?.id && 
          invoice.status === 'Pending'
        )
        .map(invoice => ({
          ...invoice,
          selected: false,
          paymentAmount: 0
        }));
    }
  }

  getBalanceAmount(invoice: Invoice): number {
    // In a real application, this would calculate the actual balance
    // by subtracting previous payments from the total amount
    return invoice.totalAmount;
  }

  toggleSelectAll() {
    this.pendingInvoices.forEach(invoice => {
      invoice.selected = this.selectAll;
      invoice.paymentAmount = this.selectAll ? this.getBalanceAmount(invoice) : 0;
    });
    this.updateTotalPayment();
  }

  updateTotalPayment() {
    this.totalPaymentAmount = this.pendingInvoices
      .filter(invoice => invoice.selected)
      .reduce((sum, invoice) => sum + (invoice.paymentAmount || 0), 0);
  }

  processPayment() {
    const selectedInvoices = this.pendingInvoices.filter(inv => inv.selected && inv.paymentAmount);
    const paymentDetails: { [key: string]: { amount: number, method: 'Cash' | 'Cheque' | 'Online', referenceNumber?: string, remarks?: string } } = {};
    
    selectedInvoices.forEach(invoice => {
      paymentDetails[invoice.id] = {
        amount: invoice.paymentAmount!,
        method: invoice.paymentMethod || 'Cash',
        referenceNumber: invoice.referenceNumber,
        remarks: invoice.remarks
      };
    });

    this.paymentService.processPayment(selectedInvoices, paymentDetails);
    this.loadCustomerPayments();
    this.selectedPayment = null;
  }
}