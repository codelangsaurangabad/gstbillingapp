import { Injectable } from '@angular/core';
import { Invoice, InvoiceItem } from '../models';
import { CompanyService } from './company.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  constructor(private companyService: CompanyService) {}

  private numberToWords(num: number): string {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return units[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + units[n % 10] : '');
      return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    let words = '';
    let scaleIndex = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        const chunk = convertLessThanThousand(num % 1000);
        words = chunk + (scales[scaleIndex] ? ' ' + scales[scaleIndex] + ' ' : '') + words;
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }

    return words.trim();
  }
  printInvoice(invoice: Invoice): void {
    // Get company details
    this.companyService.getCompany().subscribe(company => {
      // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Add print-specific styles
    const styles = `
      <style>
        @media print {
          @page { size: A4; margin: 8mm; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          body { -webkit-print-color-adjust: exact; }
        }
        body { 
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          font-size: 10px;
          line-height: 1.2;
        }
        .page-break { page-break-after: always; }
        .invoice-header { 
          text-align: center;
          margin-bottom: 10px;
          border: 1px solid #000;
          padding: 5px;
        }
        .invoice-header h1 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }
        .company-info {
          text-align: center;
        }
        .company-info h2 {
          margin: 0 0 3px 0;
          font-size: 14px;
        }
        .company-info p {
          margin: 1px 0;
        }
        .details-section {
          margin: 8px 0;
          border: 1px solid #000;
          padding: 8px;
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 10px;
        }
        .customer-section {
          display: grid;
          grid-template-columns: 1fr;
        }
        .billing-details {
          border: 1px solid #000;
          padding: 8px;
        }
        .billing-details h3 {
          margin: 0 0 3px 0;
          font-size: 12px;
          font-weight: bold;
        }
        .invoice-info {
          border: 1px solid #000;
          padding: 8px;
        }
        .invoice-info p {
          margin: 1px 0;
        }
        .invoice-items {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
          page-break-inside: avoid;
        }
        .invoice-items th, .invoice-items td {
          border: 1px solid #000;
          padding: 3px;
          text-align: center;
          font-size: 10px;
        }
        .invoice-items th {
          font-weight: bold;
          background-color: #f5f5f5;
        }
        .tax-summary {
          margin: 8px 0;
        }
        .tax-breakdown {
          width: 100%;
          border-collapse: collapse;
        }
        .tax-breakdown th, .tax-breakdown td {
          border: 1px solid #000;
          padding: 3px;
          text-align: center;
          font-size: 10px;
        }
        .footer-section {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 10px;
        }
        .bank-details {
          border: 1px solid #000;
          padding: 5px;
          font-size: 10px;
        }
        .terms-conditions {
          font-size: 9px;
          margin: 5px 0;
        }
        .terms-conditions ol {
          margin: 0;
          padding-left: 15px;
        }
        .irn-section {
          font-size: 9px;
          margin: 5px 0;
        }
        .signature {
          text-align: right;
          margin-top: 10px;
          page-break-inside: avoid;
        }
        .amount-in-words {
          font-style: italic;
          margin: 5px 0;
          font-size: 10px;
        }
        .totals {
          text-align: right;
          margin-top: 10px;
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 150px;
          margin-left: auto;
          margin-top: 20px;
        }
      </style>
    `;

    // Generate invoice HTML
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${invoice.invoiceNo}</title>
          ${styles}
        </head>
        <body>
          <div class="invoice-header">
            <h1>TAX INVOICE</h1>
            <div class="company-info">
              <h2>${company.details.name}</h2>
              <p>${company.details.address}</p>
              <p>Tel: ${company.details.phone.join(' ')} | Email: ${company.details.email}</p>
              <p><strong>GSTIN:</strong> ${company.details.gstin} | <strong>PAN:</strong> ${company.details.pan} | <strong>MSME:</strong> ${company.details.msme}</p>
            </div>
          </div>

          <div class="details-section">
            <div class="customer-section">
              <div class="billing-details">
                <h3>Billing & Shipping Details</h3>
                <p><strong>${invoice.customer.name}</strong></p>
                <p>${invoice.customer.address}</p>
                <p>Tel: ${invoice.customer.phone} | State: ${invoice.customer.state}</p>
                <p>GSTIN: ${invoice.customer.gstin || 'N/A'} | PAN: ${invoice.customer.pan || 'N/A'}</p>
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-details">
                <p><strong>Invoice No:</strong> ${invoice.invoiceNo} | <strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-IN')}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.paymentDue).toLocaleDateString('en-IN')} | <strong>Terms:</strong> ${invoice.paymentTerms || '30 Days'}</p>
                <p><strong>Place of Supply:</strong> ${invoice.placeOfSupply || invoice.customer.state} | <strong>Reverse Charge:</strong> ${invoice.reverseCharge ? 'Yes' : 'No'}</p>
                <p><strong>Dispatch:</strong> ${invoice.dispatchThrough || 'N/A'} | <strong>Packs:</strong> ${invoice.numberOfPacks || 'N/A'}</p>
                <p><strong>Order No:</strong> ${invoice.orderNo || 'N/A'} | <strong>LR/Courier No:</strong> ${invoice.lrNo || invoice.courierNo || 'N/A'}</p>
                ${invoice.ewayBillNo ? `<p><strong>E-way Bill No:</strong> ${invoice.ewayBillNo}</p>` : ''}
              </div>
            </div>
          </div>

          <table class="invoice-items">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Product Name</th>
                <th>HSN/SAC</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Disc%</th>
                <th>CD%</th>
                <th>Taxable</th>
                <th>GST%</th>
                <th>GST Amt</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.product.name}</td>
                  <td>${item.product.hsn}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit || 'SET'}</td>
                  <td>${item.rate.toFixed(2)}</td>
                  <td>${item.discountPercentage || ''}</td>
                  <td>${item.cdPercentage || ''}</td>
                  <td>${item.taxableAmount.toFixed(2)}</td>
                  <td>${item.gstPercentage}</td>
                  <td>${item.gstAmount.toFixed(2)}</td>
                  <td>${item.totalAmount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="8">Total</td>
                <td>${invoice.totalTaxableAmount.toFixed(2)}</td>
                <td></td>
                <td>${invoice.totalGstAmount.toFixed(2)}</td>
                <td>${invoice.totalAmount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="tax-summary">
            <table class="tax-breakdown">
              <tr>
                <th>Tax%</th>
                <th>Gross Amt</th>
                <th>Disc Amt</th>
                <th>Taxable</th>
                <th>CGST %</th>
                <th>CGST Amt</th>
                <th>SGST %</th>
                <th>SGST Amt</th>
                <th>IGST%</th>
                <th>IGST Amt</th>
                <th>Total Amt</th>
              </tr>
              ${Object.entries(invoice.items.reduce<Record<string, {
                items: InvoiceItem[];
                grossAmount: number;
                discountAmount: number;
                taxableAmount: number;
                gstAmount: number;
                totalAmount: number;
              }>>((acc, item) => {
                const gstKey = item.gstPercentage.toString();
                if (!acc[gstKey]) {
                  acc[gstKey] = {
                    items: [],
                    grossAmount: 0,
                    discountAmount: 0,
                    taxableAmount: 0,
                    gstAmount: 0,
                    totalAmount: 0
                  };
                }
                acc[gstKey].items.push(item);
                acc[gstKey].grossAmount += item.quantity * item.rate;
                acc[gstKey].discountAmount += item.discountPercentage ? (item.quantity * item.rate * item.discountPercentage / 100) : 0;
                acc[gstKey].taxableAmount += item.taxableAmount;
                acc[gstKey].gstAmount += item.gstAmount;
                acc[gstKey].totalAmount += item.totalAmount;
                return acc;
              }, {})).map(([gstPercentage, data]) => `
              <tr>
                <td>GST @ ${gstPercentage}%</td>
                <td>${data.taxableAmount.toFixed(2)}</td>
                <td></td>
                <td>${data.taxableAmount.toFixed(2)}</td>
                <td>${Number(gstPercentage) / 2}</td>
                <td>${(data.gstAmount / 2).toFixed(2)}</td>
                <td>${Number(gstPercentage) / 2}</td>
                <td>${(data.gstAmount / 2).toFixed(2)}</td>
                <td></td>
                <td></td>
                <td>${data.totalAmount.toFixed(2)}</td>
              </tr>`).join('')}
              <tr>
                <td>Total</td>
                <td>${invoice.totalTaxableAmount.toFixed(2)}</td>
                <td></td>
                <td>${invoice.totalTaxableAmount.toFixed(2)}</td>
                <td></td>
                <td>${(invoice.totalGstAmount / 2).toFixed(2)}</td>
                <td></td>
                <td>${(invoice.totalGstAmount / 2).toFixed(2)}</td>
                <td></td>
                <td></td>
                <td>${invoice.totalAmount.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div class="amount-in-words">
            <p><strong>Amount in Words:</strong> ${this.numberToWords(invoice.totalAmount)} Only</p>
          </div>

          <div class="footer-section">
            <div class="bank-details">
              <div class="qr-code">
                <!-- QR code will be added here -->
              </div>
              <div class="bank-info">
                <p><strong>Bank Details:</strong></p>
                <p><strong>Bank Name:</strong> ${company.bankDetails.bankName}</p>
                <p><strong>Branch Name:</strong> ${company.bankDetails.branchName}</p>
                <p><strong>Account No.:</strong> ${company.bankDetails.accountNo}</p>
                <p><strong>IFSC Code.:</strong> ${company.bankDetails.ifscCode}</p>
              </div>
            </div>

            <div class="terms-conditions">
              <ol>
                <li>Interest at the rate of 18% will be charged on all account after one month</li>
                <li>Goods once sold will not be taken back.</li>
              </ol>
            </div>

            <div class="irn-section">
              <p><strong>IRN No.:</strong> ${invoice.irnNo || 'e9dd221c7f6550dbccfd7d5246c82f90b7b3a9632fb8cf77'}</p>
              <p><strong>ACK No.:</strong> ${invoice.ackNo || '122424170547301'}</p>
              <p><strong>ACK Dt.:</strong> ${invoice.ackDate || '28/11/2024 05:38:00 PM'}</p>
            </div>

            <div class="signature">
              <p>For Hisoft IT Solutions Pvt. ltd.</p>
              <div class="signature-image">
                <!-- Signature image will be added here -->
              </div>
              <p>E&OE.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Write to the print window and print
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();

    // Wait for resources to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
    });
  }
}