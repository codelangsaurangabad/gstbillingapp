import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../models';
import { StorageService } from '../../services/storage.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="container mt-4">
      <h2>Product Management</h2>
      
      <!-- Product Form -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">Add New Product</h5>
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" formControlName="name">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">HSN Code</label>
                <input type="text" class="form-control" formControlName="hsn">
              </div>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Rate</label>
                <input type="number" class="form-control" formControlName="rate">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Unit</label>
                <select class="form-control" formControlName="unit">
                  <option value="SET">SET</option>
                  <option value="PCS">PCS</option>
                  <option value="KG">KG</option>
                  <option value="MTR">MTR</option>
                </select>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!productForm.valid">Save Product</button>
          </form>
        </div>
      </div>

      <!-- Products List -->
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Products List</h5>
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>HSN Code</th>
                  <th>Rate</th>
                  <th>Unit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of products">
                  <td>{{ product.name }}</td>
                  <td>{{ product.hsn }}</td>
                  <td>{{ product.rate | currency:'INR' }}</td>
                  <td>{{ product.unit }}</td>
                  <td>
                    <button class="btn btn-sm btn-primary me-2" (click)="editProduct(product)">Edit</button>
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
export class ProductComponent implements OnInit {
  productForm: FormGroup;
  products: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private storageService: StorageService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      hsn: ['', Validators.required],
      rate: ['', [Validators.required, Validators.min(0)]],
      unit: ['SET', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.products = this.storageService.getProducts();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const product: Product = {
        id: Date.now().toString(),
        ...this.productForm.value
      };
      this.storageService.addProduct(product);
      this.productForm.reset({unit: 'SET'});
      this.loadProducts();
    }
  }

  editProduct(product: Product): void {
    this.productForm.patchValue(product);
  }
}