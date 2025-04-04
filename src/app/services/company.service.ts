import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company, CompanyDetails, BankDetails } from '../models/company.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private readonly defaultCompany: Company = {
    details: {
      name: 'Hisot IT Solutions Pvt. Ltd.',
      address: 'Plot no 30, Survey no 36/2, Chikhalthana, Aurangabad, 431001',
      phone: ['8830350465', '7020566733'],
      email: 'contact@hisofttechnology.com',
      gstin: '27BJJPS6000D1ZE',
      pan: 'BJJPS6000D',
      msme: 'UDYAM-MH-19-0073953'
    },
    bankDetails: {
      bankName: 'HDFC BANK',
      branchName: 'CHARNIROAD MUMBAI',
      accountNo: '0356 232 0004681',
      ifscCode: 'HDFC0000356'
    }
  };

  private companySubject = new BehaviorSubject<Company>(this.defaultCompany);

  getCompany(): Observable<Company> {
    return this.companySubject.asObservable();
  }

  updateCompany(company: Company): void {
    this.companySubject.next(company);
  }

  updateCompanyDetails(details: Partial<CompanyDetails>): void {
    const currentCompany = this.companySubject.value;
    this.companySubject.next({
      ...currentCompany,
      details: { ...currentCompany.details, ...details }
    });
  }

  updateBankDetails(details: Partial<BankDetails>): void {
    const currentCompany = this.companySubject.value;
    this.companySubject.next({
      ...currentCompany,
      bankDetails: { ...currentCompany.bankDetails, ...details }
    });
  }
}