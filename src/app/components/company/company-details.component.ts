import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Company } from '../../models';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-details',
  standalone: true,
  template: `
    <div class="container">
      <h2>Company Details</h2>
      <form *ngIf="company" (ngSubmit)="saveCompany()" #companyForm="ngForm">
        <div class="section">
          <h3>Business Information</h3>
          <div class="form-group">
            <label for="name">Company Name</label>
            <input type="text" id="name" name="name" [(ngModel)]="company.details.name" required>
          </div>
          <div class="form-group">
            <label for="address">Address</label>
            <textarea id="address" name="address" [(ngModel)]="company.details.address" required></textarea>
          </div>
          <div class="form-group">
            <label for="phone">Phone Numbers</label>
            <div class="phone-inputs">
              <input type="tel" [(ngModel)]="company.details.phone[0]" name="phone1" required>
              <input type="tel" [(ngModel)]="company.details.phone[1]" name="phone2">
            </div>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" [(ngModel)]="company.details.email" required>
          </div>
          <div class="form-group">
            <label for="gstin">GSTIN</label>
            <input type="text" id="gstin" name="gstin" [(ngModel)]="company.details.gstin" required>
          </div>
          <div class="form-group">
            <label for="pan">PAN</label>
            <input type="text" id="pan" name="pan" [(ngModel)]="company.details.pan" required>
          </div>
          <div class="form-group">
            <label for="msme">MSME Number</label>
            <input type="text" id="msme" name="msme" [(ngModel)]="company.details.msme">
          </div>
        </div>

        <div class="section">
          <h3>Bank Details</h3>
          <div class="form-group">
            <label for="bankName">Bank Name</label>
            <input type="text" id="bankName" name="bankName" [(ngModel)]="company.bankDetails.bankName" required>
          </div>
          <div class="form-group">
            <label for="branchName">Branch Name</label>
            <input type="text" id="branchName" name="branchName" [(ngModel)]="company.bankDetails.branchName" required>
          </div>
          <div class="form-group">
            <label for="accountNo">Account Number</label>
            <input type="text" id="accountNo" name="accountNo" [(ngModel)]="company.bankDetails.accountNo" required>
          </div>
          <div class="form-group">
            <label for="ifscCode">IFSC Code</label>
            <input type="text" id="ifscCode" name="ifscCode" [(ngModel)]="company.bankDetails.ifscCode" required>
          </div>
        </div>

        <div class="actions">
          <button type="submit" [disabled]="!companyForm.form.valid">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .section {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    h2 {
      color: #333;
      margin-bottom: 20px;
    }
    h3 {
      color: #666;
      margin-bottom: 15px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: #666;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    textarea {
      height: 100px;
      resize: vertical;
    }
    .phone-inputs {
      display: flex;
      gap: 10px;
    }
    .phone-inputs input {
      flex: 1;
    }
    .actions {
      margin-top: 20px;
      text-align: right;
    }
    button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class CompanyDetailsComponent implements OnInit {
  company: Company | null = null;

  constructor(private companyService: CompanyService) {}

  ngOnInit() {
    this.companyService.getCompany().subscribe(company => {
      this.company = company;
    });
  }

  saveCompany() {
    if (this.company) {
      this.companyService.updateCompany(this.company);
    }
  }
}