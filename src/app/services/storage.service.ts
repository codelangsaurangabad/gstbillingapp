import { Injectable } from '@angular/core';
import { Customer, Product, Invoice } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly CUSTOMERS_KEY = 'customers';
  private readonly PRODUCTS_KEY = 'products';
  private readonly INVOICES_KEY = 'invoices';

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(this.CUSTOMERS_KEY)) {
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.PRODUCTS_KEY)) {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.INVOICES_KEY)) {
      localStorage.setItem(this.INVOICES_KEY, JSON.stringify([]));
    }
  }

  // Customer operations
  getCustomers(): Customer[] {
    return JSON.parse(localStorage.getItem(this.CUSTOMERS_KEY) || '[]');
  }

  addCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    customers.push(customer);
    localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers));
  }

  updateCustomer(customer: Customer): void {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      customers[index] = customer;
      localStorage.setItem(this.CUSTOMERS_KEY, JSON.stringify(customers));
    }
  }

  // Product operations
  getProducts(): Product[] {
    return JSON.parse(localStorage.getItem(this.PRODUCTS_KEY) || '[]');
  }

  addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
  }

  updateProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      products[index] = product;
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    }
  }

  // Invoice operations
  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(this.INVOICES_KEY) || '[]');
  }

  addInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    invoices.push(invoice);
    localStorage.setItem(this.INVOICES_KEY, JSON.stringify(invoices));
  }

  updateInvoice(invoice: Invoice): void {
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index !== -1) {
      invoices[index] = invoice;
      localStorage.setItem(this.INVOICES_KEY, JSON.stringify(invoices));
    }
  }

  getNextInvoiceNumber(): string {
    const invoices = this.getInvoices();
    const lastInvoice = invoices[invoices.length - 1];
    if (!lastInvoice) return 'INV-001';
    
    const lastNumber = parseInt(lastInvoice.invoiceNo.split('-')[1]);
    return `INV-${String(lastNumber + 1).padStart(3, '0')}`;
  }
}