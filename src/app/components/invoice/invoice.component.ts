import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer, Product, Invoice, InvoiceItem } from '../../models';
import { StorageService } from '../../services/storage.service';
import { PrintService } from '../../services/print.service';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="container-fluid mt-4">
      <h2>Generate Invoice</h2>
      
      <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
        <div class="row">
          <!-- Customer Details -->
          <div class="col-md-6 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Customer Details</h5>
                <div class="mb-3">
                  <label class="form-label">Select Customer</label>
                  <select class="form-control" (change)="onCustomerSelect($event)">
                    <option value="">Select a customer</option>
                    <option *ngFor="let customer of customers" [value]="customer.id">
                      {{ customer.name }} - {{ customer.gstin }}
                    </option>
                  </select>
                </div>
                <div *ngIf="selectedCustomer">
                  <p><strong>Address:</strong> {{ selectedCustomer.address }}</p>
                  <p><strong>GSTIN:</strong> {{ selectedCustomer.gstin }}</p>
                  <p><strong>State:</strong> {{ selectedCustomer.state }} ({{ selectedCustomer.stateCode }})</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="col-md-6 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Invoice Details</h5>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Invoice No</label>
                    <input type="text" class="form-control" formControlName="invoiceNo" readonly>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Date</label>
                    <input type="date" class="form-control" formControlName="date">
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Payment Due</label>
                    <input type="date" class="form-control" formControlName="paymentDue">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Place of Supply</label>
                    <input type="text" class="form-control" formControlName="placeOfSupply">
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Dispatch Through</label>
                    <input type="text" class="form-control" formControlName="dispatchThrough">
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">E-way Bill No</label>
                    <input type="text" class="form-control" formControlName="ewayBillNo">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Items Section -->
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title d-flex justify-content-between align-items-center">
              Items
              <button type="button" class="btn btn-primary btn-sm" (click)="addItem()">Add Item</button>
            </h5>
            
            <div class="table-responsive">
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>HSN/SAC</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Discount %</th>
                    <th>Taxable Amount</th>
                    <th>GST %</th>
                    <th>GST Amount</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody formArrayName="items">
                  <tr *ngFor="let item of items.controls; let i=index" [formGroupName]="i">
                    <td>
                      <select class="form-control" formControlName="productId" (change)="onProductSelect($event, i)">
                        <option value="">Select a product</option>
                        <option *ngFor="let product of products" [value]="product.id">
                          {{ product.name }}
                        </option>
                      </select>
                    </td>
                    <td>{{ getProduct(item.value.productId)?.hsn }}</td>
                    <td><input type="number" class="form-control" formControlName="quantity" (input)="calculateItemTotals(i)"></td>
                    <td><input type="number" class="form-control" formControlName="rate" (input)="calculateItemTotals(i)"></td>
                    <td><input type="number" class="form-control" formControlName="discountPercentage" (input)="calculateItemTotals(i)"></td>
                    <td>{{ item.value.taxableAmount | currency:'INR' }}</td>
                    <td><input type="number" class="form-control" formControlName="gstPercentage" (input)="calculateItemTotals(i)"></td>
                    <td>{{ item.value.gstAmount | currency:'INR' }}</td>
                    <td>{{ item.value.totalAmount | currency:'INR' }}</td>
                    <td>
                      <button type="button" class="btn btn-danger btn-sm" (click)="removeItem(i)">Remove</button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="5" class="text-end"><strong>Total:</strong></td>
                    <td>{{ totalTaxableAmount | currency:'INR' }}</td>
                    <td></td>
                    <td>{{ totalGstAmount | currency:'INR' }}</td>
                    <td>{{ totalAmount | currency:'INR' }}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end mb-4">
          <button type="submit" class="btn btn-primary" >
            Generate Invoice
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class InvoiceComponent implements OnInit {
  invoiceForm: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];
  selectedCustomer: Customer | null = null;
  existingInvoices: Invoice[] = [];

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService,
    private printService: PrintService
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNo: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      customerId: ['', Validators.required],
      paymentDue: ['', Validators.required],
      placeOfSupply: ['', Validators.required],
      dispatchThrough: [''],
      ewayBillNo: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.customers = this.storageService.getCustomers();
    this.products = this.storageService.getProducts();
    this.existingInvoices = this.storageService.getInvoices();
    this.invoiceForm.patchValue({
      invoiceNo: this.storageService.getNextInvoiceNumber()
    });
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0],
      taxableAmount: [0],
      gstPercentage: [28, [Validators.required, Validators.min(0)]],
      gstAmount: [0],
      totalAmount: [0]
    });

    this.items.push(itemForm);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotals();
  }

  onCustomerSelect(event: any): void {
    const customerId = event.target.value;
    this.selectedCustomer = this.customers.find(c => c.id === customerId) || null;
    if (this.selectedCustomer) {
      this.invoiceForm.patchValue({
        placeOfSupply: this.selectedCustomer.state,
        customerId: customerId
      });
    }
  }

  onProductSelect(event: any, index: number): void {
    const productId = event.target.value;
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const itemForm = this.items.at(index);
      itemForm.patchValue({
        rate: product.rate
      });
      this.calculateItemTotals(index);
    }
  }

  getProduct(productId: string): Product | undefined {
    return this.products.find(p => p.id === productId);
  }

  calculateItemTotals(index: number): void {
    const itemForm = this.items.at(index);
    const quantity = itemForm.get('quantity')?.value || 0;
    const rate = itemForm.get('rate')?.value || 0;
    const discountPercentage = itemForm.get('discountPercentage')?.value || 0;
    const gstPercentage = itemForm.get('gstPercentage')?.value || 0;

    const amount = quantity * rate;
    const discount = (amount * discountPercentage) / 100;
    const taxableAmount = amount - discount;
    const gstAmount = (taxableAmount * gstPercentage) / 100;
    const totalAmount = taxableAmount + gstAmount;

    itemForm.patchValue({
      taxableAmount: taxableAmount,
      gstAmount: gstAmount,
      totalAmount: totalAmount
    }, { emitEvent: false });

    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totalTaxableAmount = this.items.controls.reduce(
      (sum, item) => sum + (item.get('taxableAmount')?.value || 0), 0
    );
    this.totalGstAmount = this.items.controls.reduce(
      (sum, item) => sum + (item.get('gstAmount')?.value || 0), 0
    );
    this.totalAmount = this.items.controls.reduce(
      (sum, item) => sum + (item.get('totalAmount')?.value || 0), 0
    );
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.selectedCustomer) {
      const formValue = this.invoiceForm.value;
      const invoice: Invoice = {
        id: Date.now().toString(),
        invoiceNo: formValue.invoiceNo,
        date: formValue.date,
        createdAt: new Date().toISOString(),
        customer: this.selectedCustomer,
        items: formValue.items.map((item: any) => ({
          product: this.getProduct(item.productId)!,
          quantity: item.quantity,
          rate: item.rate,
          discountPercentage: item.discountPercentage,
          taxableAmount: item.taxableAmount,
          gstPercentage: item.gstPercentage,
          gstAmount: item.gstAmount,
          totalAmount: item.totalAmount
        })),
        totalTaxableAmount: this.totalTaxableAmount,
        totalGstAmount: this.totalGstAmount,
        totalAmount: this.totalAmount,
        paymentDue: formValue.paymentDue,
        placeOfSupply: formValue.placeOfSupply,
        dispatchThrough: formValue.dispatchThrough,
        ewayBillNo: formValue.ewayBillNo,
        reverseCharge: false,
        status: 'Pending',
        payments: []
      };

      this.storageService.addInvoice(invoice);
      this.invoiceForm.reset({
        invoiceNo: this.storageService.getNextInvoiceNumber(),
        date: new Date().toISOString().split('T')[0]
      });
      this.items.clear();
      this.selectedCustomer = null;
    }
  }

  totalTaxableAmount = 0;
  totalGstAmount = 0;
  totalAmount = 0;

  reprintInvoice(invoice: Invoice): void {
    this.printService.printInvoice(invoice);
  }
}