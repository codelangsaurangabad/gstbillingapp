import { Component, OnInit } from '@angular/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { Invoice, Customer } from '../../models';
import { PrintService } from '../../services/print.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-history',
  standalone: true,
  template: `
    <div class="container">
      <h2>Invoice History</h2>
      <div class="search-bar" *ngIf="invoices.length > 0">
        <ng-select
          [items]="customers"
          [searchable]="true"
          [clearable]="true"
          bindLabel="name"
          placeholder="Search by customer"
          [(ngModel)]="selectedCustomer"
          (change)="filterInvoices()">
        </ng-select>
        <ng-select
          [items]="dateFilters"
          [searchable]="false"
          [clearable]="true"
          bindLabel="label"
          bindValue="value"
          placeholder="Filter by date"
          [(ngModel)]="filterCriteria"
          (change)="filterInvoices()">
        </ng-select>
        <ng-select
          [items]="statusFilters"
          [searchable]="false"
          [clearable]="true"
          bindLabel="label"
          bindValue="value"
          placeholder="Filter by status"
          [(ngModel)]="selectedStatus"
          (change)="filterInvoices()">
        </ng-select>
      </div>
      <div *ngIf="invoices.length === 0" class="no-records">
        <p>No invoice records found.</p>
      </div>
      <table class="invoice-table" *ngIf="invoices.length > 0">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let invoice of filteredInvoices">
            <td>{{ invoice.invoiceNo }}</td>
            <td>{{ invoice.date | date:'mediumDate' }}</td>
            <td>{{ invoice.customer.name }}</td>
            <td>{{ invoice.totalAmount | currency:'INR' }}</td>
            <td>{{ invoice.status }}</td>
            <td>
              <button (click)="printInvoice(invoice)">Print</button>
              <button (click)="viewInvoice(invoice)">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    .search-bar {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    .search-bar input,
    .search-bar select {
      padding: 8px;
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
    button {
      margin-right: 5px;
      padding: 5px 10px;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    .no-records {
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 4px;
      margin-top: 20px;
    }
    .no-records p {
      margin: 0;
      color: #6c757d;
      font-size: 1.1em;
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule
  ]
})
export class InvoiceHistoryComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  selectedCustomer: any = null;
  filterCriteria: string = 'all';
  selectedStatus: string = '';
  customers: Customer[] = [];
  dateFilters = [
    { label: 'All', value: 'all' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'This Year', value: 'thisYear' }
  ];
  statusFilters = [
    { label: 'All', value: '' },
    { label: 'Paid', value: 'paid' },
    { label: 'Pending', value: 'pending' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  constructor(private printService: PrintService) {}

  ngOnInit() {
    // TODO: Load invoices from a service
    this.loadInvoices();
  }

  loadInvoices() {
    const storedInvoices = localStorage.getItem('invoices');
    this.invoices = storedInvoices ? JSON.parse(storedInvoices) as Invoice[] : [];
    this.filteredInvoices = [...this.invoices];
    
    // Extract unique customers from invoices
    const uniqueCustomers = new Set<string>();
    this.invoices.forEach(invoice => {
      uniqueCustomers.add(JSON.stringify(invoice.customer));
    });
    this.customers = Array.from(uniqueCustomers).map(customer => JSON.parse(customer) as Customer);
  }

  filterInvoices() {
    this.filteredInvoices = this.invoices.filter(invoice => {
      // Customer filter
      if (this.selectedCustomer && invoice.customer.id !== this.selectedCustomer.id) {
        return false;
      }

      // Status filter
      if (this.selectedStatus && invoice.status !== this.selectedStatus) {
        return false;
      }

      // Date filter
      if (this.filterCriteria === 'all') {
        return true;
      }
      
      const invoiceDate = new Date(invoice.date);
      const now = new Date();
      const invoiceYear = invoiceDate.getFullYear();
      const invoiceMonth = invoiceDate.getMonth();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      switch(this.filterCriteria) {
        case 'thisMonth':
          return invoiceYear === currentYear && invoiceMonth === currentMonth;
        case 'lastMonth':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return invoiceYear === lastMonthYear && invoiceMonth === lastMonth;
        case 'thisYear':
          return invoiceYear === currentYear;
        default:
          return true;
      }
    });
  }

  printInvoice(invoice: Invoice) {
    this.printService.printInvoice(invoice);
  }

  viewInvoice(invoice: Invoice) {
    // TODO: Implement invoice viewing logic
  }
}