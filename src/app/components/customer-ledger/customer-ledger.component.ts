import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customer, Invoice } from '../../models';
import { StorageService } from '../../services/storage.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

interface LedgerEntry {
  date: string;
  type: 'invoice' | 'payment';
  invoiceNo?: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CustomerLedger {
  customer: Customer;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

@Component({
  selector: 'app-customer-ledger',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatCardModule,
    MatInputModule
  ],
  template: `
    <div class="container-fluid mt-4">
      <h2>Customer Ledger</h2>
      
      <mat-form-field class="w-100">
        <mat-label>Select Customer</mat-label>
        <mat-select (selectionChange)="onCustomerSelect($event)">
          <mat-option [value]="">Select a customer</mat-option>
          <mat-option *ngFor="let customer of customers" [value]="customer.id">
            {{ customer.name }} - {{ customer.gstin }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-card *ngIf="selectedLedger">
        <mat-card-content>
          <h4>{{ selectedLedger.customer.name }}</h4>
          <p>
            <strong>GSTIN:</strong> {{ selectedLedger.customer.gstin }}<br>
            <strong>Address:</strong> {{ selectedLedger.customer.address }}
          </p>
          
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Invoice No</th>
                  <th>Description</th>
                  <th class="text-end">Debit</th>
                  <th class="text-end">Credit</th>
                  <th class="text-end">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let entry of selectedLedger.entries">
                  <td>{{ entry.date | date:'dd/MM/yyyy' }}</td>
                  <td>{{ entry.type | titlecase }}</td>
                  <td>{{ entry.invoiceNo || '-' }}</td>
                  <td>{{ entry.description }}</td>
                  <td class="text-end">{{ entry.debit | currency:'INR' }}</td>
                  <td class="text-end">{{ entry.credit | currency:'INR' }}</td>
                  <td class="text-end">{{ entry.balance | currency:'INR' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-end"><strong>Total</strong></td>
                  <td class="text-end"><strong>{{ selectedLedger.totalDebit | currency:'INR' }}</strong></td>
                  <td class="text-end"><strong>{{ selectedLedger.totalCredit | currency:'INR' }}</strong></td>
                  <td class="text-end"><strong>{{ selectedLedger.balance | currency:'INR' }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class CustomerLedgerComponent implements OnInit {
  customers: Customer[] = [];
  selectedLedger: CustomerLedger | null = null;
  private invoices: Invoice[] = [];

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.customers = this.storageService.getCustomers();
    this.invoices = this.storageService.getInvoices();
  }

  onCustomerSelect(event: any): void {
    const customerId = event.value;
    if (!customerId) {
      this.selectedLedger = null;
      return;
    }

    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) return;

    const customerInvoices = this.invoices.filter(inv => inv.customer.id === customerId);
    const entries: LedgerEntry[] = [];
    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    // Sort all transactions by date
    const transactions = customerInvoices.flatMap(invoice => {
      const entries: { date: string; type: 'invoice' | 'payment'; invoice: Invoice; amount: number; isPayment: boolean }[] = [
        {
          date: invoice.date,
          type: 'invoice',
          invoice,
          amount: invoice.totalAmount,
          isPayment: false
        }
      ];

      // Add payment entries
      invoice.payments?.forEach(payment => {
        entries.push({
          date: payment.date,
          type: 'payment',
          invoice,
          amount: payment.amount,
          isPayment: true
        });
      });

      return entries;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Create ledger entries
    transactions.forEach(transaction => {
      if (transaction.isPayment) {
        runningBalance -= transaction.amount;
        totalCredit += transaction.amount;
        entries.push({
          date: transaction.date,
          type: 'payment',
          invoiceNo: transaction.invoice.invoiceNo,
          description: `Payment received for Invoice #${transaction.invoice.invoiceNo}`,
          debit: 0,
          credit: transaction.amount,
          balance: runningBalance
        });
      } else {
        runningBalance += transaction.amount;
        totalDebit += transaction.amount;
        entries.push({
          date: transaction.date,
          type: 'invoice',
          invoiceNo: transaction.invoice.invoiceNo,
          description: `Invoice #${transaction.invoice.invoiceNo} generated`,
          debit: transaction.amount,
          credit: 0,
          balance: runningBalance
        });
      }
    });

    this.selectedLedger = {
      customer,
      entries,
      totalDebit,
      totalCredit,
      balance: runningBalance
    };
  }
}