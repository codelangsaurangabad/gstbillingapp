import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomerComponent } from './components/customer/customer.component';
import { ProductComponent } from './components/product/product.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { PaymentComponent } from './components/payment/payment.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    CustomerComponent,
    ProductComponent,
    InvoiceComponent,
    PaymentComponent
  ],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">GST Billing App</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" routerLink="/invoice" routerLinkActive="active">Generate Invoice</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/invoice-history" routerLinkActive="active">Previous Bills</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/customers" routerLinkActive="active">Customers</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">Products</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/company" routerLinkActive="active">Company</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/payment" routerLinkActive="active">Payment Collection</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/customer-ledger" routerLinkActive="active">Customers Ledger</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .navbar {
      margin-bottom: 20px;
    }
  `]
})
export class AppComponent {
  title = 'GST Billing App';
}
