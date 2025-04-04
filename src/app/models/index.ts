export * from './company.model';

export interface Customer {
    id: string;
    name: string;
    address: string;
    gstin?: string;
    pan?: string;
    state: string;
    stateCode: string;
    phone: string;
}

export interface Product {
    id: string;
    name: string;
    hsn: string;
    rate: number;
    unit: string;
}

export interface InvoiceItem {
    product: Product;
    quantity: number;
    rate: number;
    unit?: string;
    discountPercentage?: number;
    cdPercentage?: number;
    taxableAmount: number;
    gstPercentage: number;
    gstAmount: number;
    totalAmount: number;
}

export interface PaymentRecord {
    date: string;
    amount: number;
    method: 'Cash' | 'Cheque' | 'Online';
    referenceNumber?: string;
    remarks?: string;
}

export interface Invoice {
    id: string;
    invoiceNo: string;
    date: string;
    createdAt: string;
    customer: Customer;
    items: InvoiceItem[];
    totalTaxableAmount: number;
    totalGstAmount: number;
    totalAmount: number;
    paymentDue: string;
    placeOfSupply: string;
    status: 'Paid' | 'Pending' | 'Overdue';
    payments: PaymentRecord[];
    dispatchThrough?: string;
    dispatchNo?: string;
    ewayBillNo?: string;
    reverseCharge: boolean;
    paymentTerms?: string;
    numberOfPacks?: string;
    orderNo?: string;
    lrNo?: string;
    trIdNo?: string;
    courierNo?: string;
    irnNo?: string;
    ackNo?: string;
    ackDate?: string;
}