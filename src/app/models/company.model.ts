export interface CompanyDetails {
    name: string;
    address: string;
    phone: string[];
    email: string;
    gstin: string;
    pan: string;
    msme: string;
}

export interface BankDetails {
    bankName: string;
    branchName: string;
    accountNo: string;
    ifscCode: string;
}

export interface Company {
    details: CompanyDetails;
    bankDetails: BankDetails;
}