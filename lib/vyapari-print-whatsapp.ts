export interface PrintableBillItem {
  name: string;
  qty: number;
  price: number;
}

export interface PrintableBillData {
  shopName: string;
  ownerName?: string;
  shopPhone?: string;
  shopGst?: string;
  shopAddress?: string;
  invoiceNo: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerGst?: string;
  isGst: boolean;
  gstRate: number;
  items: PrintableBillItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  grandTotal: number;
  status: 'paid' | 'unpaid' | string;
  paymentMode?: string;
  notes?: string;
  createdAt?: string;
}

export interface PrintableKhataEntry {
  id: string;
  type: 'gave' | 'got';
  amount: number;
  note: string;
  date: string;
}

export interface PrintableKhataData {
  shopName: string;
  shopPhone?: string;
  customerName: string;
  customerPhone?: string;
  netBalance: number; // positive = Lena Hai (Customer owes shop), negative = Dena Hai
  entries: PrintableKhataEntry[];
}

function escapeHtml(value: string | number | undefined | null): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeWhatsAppPhone(rawPhone?: string): string {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits.slice(-10).length === 10 ? `91${digits.slice(-10)}` : digits;
}

export function numberToIndianWords(amount: number): string {
  const num = Math.round(Math.abs(Number(amount) || 0));
  if (num === 0) return 'Zero Rupees Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const twoDigits = (n: number): string => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ' ' + ones[n % 10] : ''}`;
  };

  let words = '';
  let rem = num;

  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundred = Math.floor(rem / 100);
  const lastTwo = rem % 100;

  if (crore > 0) words += `${twoDigits(crore)} Crore `;
  if (lakh > 0) words += `${twoDigits(lakh)} Lakh `;
  if (thousand > 0) words += `${twoDigits(thousand)} Thousand `;
  if (hundred > 0) words += `${ones[hundred]} Hundred `;
  if (lastTwo > 0) {
    if (words !== '') words += 'and ';
    words += `${twoDigits(lastTwo)} `;
  }

  return `Rupees ${words.trim()} Only`;
}

function triggerHtmlPrint(htmlDocument: string) {
  if (typeof window === 'undefined') return;

  const existingFrame = document.getElementById('bb-vyapari-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'bb-vyapari-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(htmlDocument);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 250);
}

/**
 * Prints a clean, dedicated A4 GST / Non-GST Pukka Invoice using an isolated print frame.
 */
export function printPukkaBill(bill: PrintableBillData) {
  const validItems = bill.items.filter((i) => i.name.trim() || Number(i.price) > 0);
  const itemsToRender =
    validItems.length > 0 ? validItems : [{ name: 'General Store Item', qty: 1, price: 0 }];

  const dateStr = bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const taxableAmount = Math.max(0, Number(bill.subtotal || 0) - Number(bill.discount || 0));
  const halfGstRate = Number((bill.gstRate / 2).toFixed(2));
  const halfGstAmt = Number((bill.gstAmount / 2).toFixed(2));
  const isPaid = String(bill.status).toLowerCase() === 'paid';

  const rowsHtml = itemsToRender
    .map((item, idx) => {
      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      const lineTotal = qty * price;
      return `
        <tr>
          <td class="center">${idx + 1}</td>
          <td class="item-name">${escapeHtml(item.name || `Item ${idx + 1}`)}</td>
          <td class="center">${qty}</td>
          <td class="right">₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td class="right bold">₹${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${escapeHtml(bill.invoiceNo)} - ${escapeHtml(bill.shopName)}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Segoe UI', Roboto, Arial, sans-serif;
      color: #111827;
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-size: 13px;
      line-height: 1.45;
    }
    .invoice-box {
      max-width: 780px;
      margin: 0 auto;
      border: 2px solid #1e1b4b;
      border-radius: 10px;
      overflow: hidden;
    }
    .top-banner {
      background: #1e1b4b;
      color: #ffffff;
      padding: 16px 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .badge {
      display: inline-block;
      background: #f59e0b;
      color: #111827;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 9px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 6px;
    }
    .shop-title {
      font-size: 22px;
      font-weight: 900;
      margin: 0;
      letter-spacing: 0.2px;
    }
    .shop-meta {
      font-size: 12px;
      color: #e0e7ff;
      margin-top: 4px;
    }
    .invoice-meta {
      text-align: right;
    }
    .inv-no {
      font-size: 18px;
      font-weight: 900;
      color: #fde68a;
    }
    .status-pill {
      display: inline-block;
      margin-top: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      background: ${isPaid ? '#10b981' : '#ef4444'};
      color: #ffffff;
    }
    .party-section {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 22px;
      background: #f8fafc;
      border-bottom: 1.5px solid #cbd5e1;
    }
    .party-block {
      flex: 1;
    }
    .section-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #4f46e5;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .cust-name {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
    }
    table.items-table th {
      background: #eef2ff;
      color: #1e1b4b;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 10px 14px;
      border-bottom: 1.5px solid #c7d2fe;
      text-align: left;
    }
    table.items-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 13px;
    }
    .center { text-align: center !important; }
    .right { text-align: right !important; }
    .bold { font-weight: 700; }
    .item-name { font-weight: 600; color: #0f172a; }
    .summary-wrapper {
      display: flex;
      justify-content: space-between;
      padding: 16px 22px;
      gap: 24px;
      border-top: 1.5px solid #1e1b4b;
    }
    .words-col {
      flex: 1.2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .words-box {
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 6px;
      padding: 10px 12px;
      margin-bottom: 10px;
    }
    .totals-col {
      flex: 1;
      max-width: 290px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 13px;
      color: #334155;
    }
    .total-row.discount {
      color: #059669;
      font-weight: 700;
    }
    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding: 10px 12px;
      background: #1e1b4b;
      color: #ffffff;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 900;
    }
    .footer-sign {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 14px 22px 18px;
      border-top: 1px dashed #cbd5e1;
      font-size: 11px;
      color: #475569;
    }
    .sign-box {
      text-align: right;
    }
    .sign-line {
      margin-top: 32px;
      border-top: 1.5px solid #1e1b4b;
      padding-top: 4px;
      font-weight: 800;
      color: #1e1b4b;
      min-width: 170px;
    }
    .brand-bar {
      background: #f1f5f9;
      text-align: center;
      padding: 7px;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="top-banner">
      <div>
        <div class="badge">${bill.isGst ? 'GST TAX INVOICE' : 'PUKKA CASH / RETAIL BILL'}</div>
        <h1 class="shop-title">${escapeHtml(bill.shopName || 'Bhartiyebazar Vyapari Store')}</h1>
        <div class="shop-meta">
          ${bill.ownerName ? `Prop: <strong>${escapeHtml(bill.ownerName)}</strong> &bull; ` : ''}
          ${bill.shopPhone ? `Mobile: <strong>+91 ${escapeHtml(bill.shopPhone)}</strong>` : ''}
          ${bill.shopGst ? `<br/>GSTIN: <strong>${escapeHtml(bill.shopGst)}</strong>` : ''}
          ${bill.shopAddress ? `<br/>${escapeHtml(bill.shopAddress)}` : ''}
        </div>
      </div>
      <div class="invoice-meta">
        <div class="inv-no">Bill #${escapeHtml(bill.invoiceNo)}</div>
        <div style="font-size: 12px; color: #e0e7ff; margin-top: 3px;">Date: <strong>${escapeHtml(dateStr)}</strong></div>
        ${bill.paymentMode ? `<div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Mode: ${escapeHtml(bill.paymentMode.toUpperCase())}</div>` : ''}
        <div class="status-pill">${isPaid ? '✓ PAID' : '⏳ UNPAID / DUE'}</div>
      </div>
    </div>

    <div class="party-section">
      <div class="party-block">
        <div class="section-label">Billed To (Customer Details)</div>
        <div class="cust-name">${escapeHtml(bill.customerName || 'Walk-in Customer')}</div>
        ${bill.customerPhone ? `<div style="font-size:12px; margin-top:2px;">Phone: <strong>+91 ${escapeHtml(bill.customerPhone)}</strong></div>` : ''}
        ${bill.customerAddress ? `<div style="font-size:12px; color:#475569;">Address: ${escapeHtml(bill.customerAddress)}</div>` : ''}
        ${bill.customerGst ? `<div style="font-size:12px; font-weight:700;">Customer GSTIN: ${escapeHtml(bill.customerGst)}</div>` : ''}
      </div>
      <div class="party-block" style="text-align:right;">
        <div class="section-label">Invoice Type</div>
        <div style="font-weight:800; font-size:13px; color:#1e1b4b;">
          ${bill.isGst ? `GST Invoice (${bill.gstRate}% Tax)` : 'Non-GST Retail Invoice'}
        </div>
        <div style="font-size:11px; color:#64748b; margin-top:3px;">Original Copy for Recipient</div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th class="center" style="width: 48px;">#</th>
          <th>Item / Particulars</th>
          <th class="center" style="width: 80px;">Qty</th>
          <th class="right" style="width: 130px;">Rate (₹)</th>
          <th class="right" style="width: 140px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="summary-wrapper">
      <div class="words-col">
        <div class="words-box">
          <div class="section-label">Amount in Words</div>
          <div style="font-weight: 800; color: #0f172a; font-size: 12.5px;">
            ${escapeHtml(numberToIndianWords(bill.grandTotal))}
          </div>
        </div>
        <div style="font-size: 11px; color: #475569;">
          <strong>Terms &amp; Conditions:</strong><br/>
          1. Goods once sold will not be taken back or exchanged.<br/>
          2. Computer generated Pukka Bill${bill.notes ? ` &bull; Note: ${escapeHtml(bill.notes)}` : ''}.
        </div>
      </div>

      <div class="totals-col">
        <div class="total-row">
          <span>Subtotal</span>
          <span class="bold">₹${Number(bill.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        ${
          Number(bill.discount) > 0
            ? `<div class="total-row discount">
                <span>Discount</span>
                <span>- ₹${Number(bill.discount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span>Taxable Amount</span>
                <span class="bold">₹${taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>`
            : ''
        }
        ${
          bill.isGst
            ? `<div class="total-row">
                <span>CGST (${halfGstRate}%)</span>
                <span>+ ₹${halfGstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span>SGST (${halfGstRate}%)</span>
                <span>+ ₹${halfGstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>`
            : ''
        }
        <div class="grand-total-row">
          <span>GRAND TOTAL</span>
          <span>₹${Number(bill.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>

    <div class="footer-sign">
      <div>
        <div>Thank you for your business! Visit again 🙏</div>
        ${bill.shopPhone ? `<div style="margin-top:3px; font-weight:700; color:#0f172a;">For Queries / UPI Payment: +91 ${escapeHtml(bill.shopPhone)}</div>` : ''}
      </div>
      <div class="sign-box">
        <div style="font-size:11px; font-weight:700; color:#475569;">For ${escapeHtml(bill.shopName || 'Store')}</div>
        <div class="sign-line">Authorized Signatory</div>
      </div>
    </div>

    <div class="brand-bar">
      🧾 Powered by <strong>Bhartiyebazar Vyapari Billing Software</strong> &bull; 100% Safe &amp; Verified Merchant Invoice
    </div>
  </div>
</body>
</html>`;

  triggerHtmlPrint(html);
}

/**
 * Prints a clean A4 Bahi-Khata / Udhaar Ledger Statement for a customer.
 */
export function printKhataStatement(data: PrintableKhataData) {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const isLena = data.netBalance > 0;
  const isDena = data.netBalance < 0;

  const rowsHtml =
    data.entries.length > 0
      ? data.entries
          .map(
            (e, idx) => `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${escapeHtml(e.date)}</td>
            <td><strong>${escapeHtml(e.note)}</strong></td>
            <td style="text-align:right; color:#dc2626; font-weight:700;">
              ${e.type === 'gave' ? `₹${Number(e.amount).toLocaleString('en-IN')}` : '—'}
            </td>
            <td style="text-align:right; color:#059669; font-weight:700;">
              ${e.type === 'got' ? `₹${Number(e.amount).toLocaleString('en-IN')}` : '—'}
            </td>
          </tr>
        `,
          )
          .join('')
      : `<tr><td colspan="5" style="text-align:center; padding:18px;">No entries recorded yet.</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bahi-Khata Statement - ${escapeHtml(data.customerName)}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 13px; }
    .box { max-width: 760px; margin: 0 auto; border: 2px solid #065f46; border-radius: 10px; overflow: hidden; }
    .header { background: #065f46; color: #fff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; }
    .summary { display: flex; justify-content: space-between; align-items: center; padding: 14px 22px; background: #ecfdf5; border-bottom: 1.5px solid #a7f3d0; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; }
    td { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; }
    .footer { padding: 14px 22px; text-align: center; background: #f8fafc; font-size: 11px; color: #475569; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="box">
    <div class="header">
      <div>
        <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#a7f3d0;">📒 DIGITAL BAHI-KHATA STATEMENT</div>
        <h1 style="margin:3px 0 0; font-size:20px;">${escapeHtml(data.shopName)}</h1>
        ${data.shopPhone ? `<div style="font-size:12px; color:#d1fae5;">Mobile: +91 ${escapeHtml(data.shopPhone)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:12px;">Statement Date: <strong>${escapeHtml(dateStr)}</strong></div>
      </div>
    </div>
    <div class="summary">
      <div>
        <div style="font-size:11px; color:#047857; font-weight:800; text-transform:uppercase;">Customer Account</div>
        <div style="font-size:16px; font-weight:900;">${escapeHtml(data.customerName)}</div>
        ${data.customerPhone ? `<div style="font-size:12px;">Phone: +91 ${escapeHtml(data.customerPhone)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:${isLena ? '#dc2626' : isDena ? '#059669' : '#475569'};">
          ${isLena ? 'KUL BAKI (LENA HAI)' : isDena ? 'ADVANCE (DENA HAI)' : 'HISAB CLEAR'}
        </div>
        <div style="font-size:20px; font-weight:900; color:${isLena ? '#dc2626' : isDena ? '#059669' : '#0f172a'};">
          ₹${Math.abs(data.netBalance).toLocaleString('en-IN')}
        </div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:45px; text-align:center;">#</th>
          <th style="width:120px;">Date</th>
          <th>Particulars / Note</th>
          <th style="width:140px; text-align:right;">Udhaar Diya (You Gave)</th>
          <th style="width:140px; text-align:right;">Jama Mila (You Got)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    <div class="footer">
      📒 Powered by <strong>Bhartiyebazar Digital Bahi-Khata Software</strong> &bull; 100% Safe Merchant Ledger
    </div>
  </div>
</body>
</html>`;

  triggerHtmlPrint(html);
}

/**
 * Generates a cleanly formatted WhatsApp Pukka Bill share link.
 */
export function buildWhatsAppPukkaBillUrl(bill: PrintableBillData): string {
  const validItems = bill.items.filter((i) => i.name.trim() || Number(i.price) > 0);
  const itemLines =
    validItems.length > 0
      ? validItems
          .map((item, idx) => {
            const qty = Number(item.qty || 1);
            const price = Number(item.price || 0);
            const total = qty * price;
            return `${idx + 1}. *${item.name.trim() || `Item ${idx + 1}`}*\n    ${qty} × ₹${price.toLocaleString('en-IN')} = *₹${total.toLocaleString('en-IN')}*`;
          })
          .join('\n')
      : '1. *General Items* = ₹0';

  const dateStr = bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

  const isPaid = String(bill.status).toLowerCase() === 'paid';
  const halfGstRate = Number((bill.gstRate / 2).toFixed(2));
  const halfGstAmt = Number((bill.gstAmount / 2).toFixed(2));

  const lines = [
    `🧾 *${(bill.shopName || 'Bhartiyebazar Store').toUpperCase()}*`,
    bill.isGst ? `📌 *OFFICIAL GST TAX INVOICE*` : `📌 *OFFICIAL PUKKA CASH BILL*`,
    bill.shopPhone ? `📞 Shop Mobile: +91 ${bill.shopPhone}` : null,
    bill.shopGst ? `🏛️ GSTIN: ${bill.shopGst}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔢 *Bill No:* ${bill.invoiceNo}`,
    `📅 *Date:* ${dateStr}`,
    `👤 *Customer:* ${bill.customerName || 'Walk-in Customer'}`,
    bill.customerPhone ? `📱 *Mobile:* +91 ${bill.customerPhone}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 *ITEMS DETAILS:*`,
    itemLines,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💵 Subtotal: ₹${Number(bill.subtotal || 0).toLocaleString('en-IN')}`,
    Number(bill.discount) > 0
      ? `🎁 Discount: - ₹${Number(bill.discount).toLocaleString('en-IN')}`
      : null,
    bill.isGst
      ? `📊 GST (${bill.gstRate}%): + ₹${Number(bill.gstAmount || 0).toLocaleString('en-IN')} _(CGST ${halfGstRate}%: ₹${halfGstAmt} + SGST ${halfGstRate}%: ₹${halfGstAmt})_`
      : null,
    `💰 *GRAND TOTAL: ₹${Number(bill.grandTotal || 0).toLocaleString('en-IN')}*`,
    `_(${numberToIndianWords(bill.grandTotal)})_`,
    `📌 *Bill Status:* ${isPaid ? '✅ PAID (Jama Ho Gaya)' : '⏳ UNPAID (Payment Baki Hai)'}`,
    `━━━━━━━━━━━━━━━━━━━━`,
    !isPaid && bill.shopPhone
      ? `🙏 *Kripya ₹${Number(bill.grandTotal || 0).toLocaleString('en-IN')} ka payment +91 ${bill.shopPhone} par karein.*`
      : `🙏 *Dhanyawad! Humari dukan par padharne ke liye shukriya.*`,
    `_Powered by Bhartiyebazar Vyapari Software_`,
  ]
    .filter(Boolean)
    .join('\n');

  const targetPhone = normalizeWhatsAppPhone(bill.customerPhone);
  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines)}`
    : `https://wa.me/?text=${encodeURIComponent(lines)}`;
}

/**
 * Generates a cleanly formatted WhatsApp Bahi-Khata Payment Reminder + Mini Ledger URL.
 */
export function buildWhatsAppKhataReminderUrl(data: PrintableKhataData): string {
  const recentEntries = data.entries.slice(0, 5);
  const entryLines =
    recentEntries.length > 0
      ? recentEntries
          .map(
            (e) =>
              `• ${e.date}: ${e.type === 'gave' ? '🔴 Udhaar Diya' : '🟢 Jama Mila'} *₹${Number(e.amount).toLocaleString('en-IN')}* (${e.note})`,
          )
          .join('\n')
      : '';

  const absBal = Math.abs(data.netBalance).toLocaleString('en-IN');

  const lines = [
    `📒 *${(data.shopName || 'Bhartiyebazar Store').toUpperCase()} - BAHI KHATA*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🙏 Namaste *${data.customerName}* ji,`,
    data.netBalance > 0
      ? `🔔 *${data.shopName}* par aapka kul *₹${absBal}* udhaar baki hai.`
      : data.netBalance < 0
        ? `✅ *${data.shopName}* par aapka *₹${absBal}* advance jama hai.`
        : `✅ *${data.shopName}* par aapka hisab bilkul clear (₹0) hai.`,
    entryLines ? `\n📋 *Recent Len-Den (Hisab):*\n${entryLines}` : null,
    `━━━━━━━━━━━━━━━━━━━━`,
    data.netBalance > 0
      ? `💰 *Kul Baki Amount: ₹${absBal}*\n🙏 Kripya jald se jald payment karein.${data.shopPhone ? `\n📲 Payment / UPI Mobile: *+91 ${data.shopPhone}*` : ''}`
      : `🙏 Dhanyawad!`,
    `_Powered by Bhartiyebazar Digital Bahi-Khata_`,
  ]
    .filter(Boolean)
    .join('\n');

  const targetPhone = normalizeWhatsAppPhone(data.customerPhone);
  return targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(lines)}`
    : `https://wa.me/?text=${encodeURIComponent(lines)}`;
}
