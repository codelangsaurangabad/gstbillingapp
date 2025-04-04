import { Routes } from '@angular/router';
import { CustomerComponent } from './components/customer/customer.component';
import { ProductComponent } from './components/product/product.component';
import { InvoiceComponent } from './components/invoice/invoice.component';
import { InvoiceHistoryComponent } from './components/invoice-history/invoice-history.component';
import { CompanyDetailsComponent } from './components/company/company-details.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CustomerLedgerComponent } from './components/customer-ledger/customer-ledger.component';

export const routes: Routes = [
  { path: '', redirectTo: 'invoice', pathMatch: 'full' },
  { path: 'customers', component: CustomerComponent },
  { path: 'products', component: ProductComponent },
  { path: 'invoice', component: InvoiceComponent },
  { path: 'invoice-history', component: InvoiceHistoryComponent },
  { path: 'company', component: CompanyDetailsComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'customer-ledger', component: CustomerLedgerComponent }
];
