import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../models';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Customer Management</h2>
      
      <!-- Customer Form -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Add New Customer</h5>
          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" formControlName="name">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Phone</label>
                <input type="text" class="form-control" formControlName="phone">
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Address</label>
              <textarea class="form-control" formControlName="address" rows="2"></textarea>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">GSTIN</label>
                <input type="text" class="form-control" formControlName="gstin">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">PAN</label>
                <input type="text" class="form-control" formControlName="pan">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">State</label>
                <input type="text" class="form-control" formControlName="state">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">State Code</label>
                <input type="text" class="form-control" formControlName="stateCode">
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!customerForm.valid">Save Customer</button>
          </form>
        </div>
      </div>

      <!-- Customers List -->
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Customers List</h5>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>GSTIN</th>
                  <th>Phone</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of customers">
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.gstin }}</td>
                  <td>{{ customer.phone }}</td>
                  <td>{{ customer.state }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary me-2" (click)="editCustomer(customer)">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomerComponent implements OnInit {
  customerForm: FormGroup;
  customers: Customer[] = [];

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService
  ) {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      gstin: [''],
      pan: [''],
      state: ['', Validators.required],
      stateCode: ['', Validators.required],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customers = this.storageService.getCustomers();
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      const customer: Customer = {
        id: Date.now().toString(),
        ...this.customerForm.value
      };
      this.storageService.addCustomer(customer);
      this.customerForm.reset();
      this.loadCustomers();
    }
  }

  editCustomer(customer: Customer): void {
    this.customerForm.patchValue(customer);
  }
}