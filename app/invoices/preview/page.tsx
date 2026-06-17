"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer, Send } from "lucide-react";
import Link from "next/link";

export default function InvoicePreviewPage() {
  const printInvoice = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8 no-print">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/invoices">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Invoice Preview
              </h1>
              <p className="text-slate-500">
                GST invoice preview for Novaprime Engineering.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={printInvoice}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>

            <Button onClick={printInvoice}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>

            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-xl">
          <InvoiceContent />
        </div>
      </div>

      <div className="print-only">
        <div className="a4-page">
          <InvoiceContent />
        </div>
      </div>
    </>
  );
}

function InvoiceContent() {
  return (
    <div className="text-slate-900">
      <div className="flex justify-between border-b-2 border-blue-700 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700">
            NOVAPRIME ENGINEERING
          </h1>
          <p>Construction Products & Engineering Solutions</p>
          <p>GSTIN: 27CUVPR9032E1Z0</p>
          <p>Email: novaprimeengineering@gmail.com</p>
          <p>Phone: +91 8591300722</p>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-light text-blue-700">
            TAX INVOICE
          </h2>
          <p className="mt-3 font-semibold">INV-2026-001</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <b>Invoice Date:</b> 03 Jun 2026
        </div>
        <div>
          <b>Due Date:</b> 10 Jun 2026
        </div>
        <div>
          <b>Place of Supply:</b> Maharashtra (27)
        </div>
        <div>
          <b>Payment Status:</b>{" "}
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            Paid
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Bill To
          </h3>
          <p className="font-semibold">Arya Engineering</p>
          <p>GSTIN: 27ABCDE1234F1Z5</p>
          <p>State: Maharashtra (27)</p>
          <p>Phone: 8591300722</p>
          <p>Email: aryaengineering@gmail.com</p>
          <p>Billing Address</p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Ship To
          </h3>
          <p className="font-semibold">Arya Engineering</p>
          <p>GSTIN: 27ABCDE1234F1Z5</p>
          <p>State: Maharashtra (27)</p>
          <p>Billing Address</p>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-50">
            <th className="border p-3 text-left">#</th>
            <th className="border p-3 text-left">Product</th>
            <th className="border p-3 text-left">HSN</th>
            <th className="border p-3 text-left">Qty</th>
            <th className="border p-3 text-left">Rate</th>
            <th className="border p-3 text-left">GST %</th>
            <th className="border p-3 text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="border p-3">1</td>
            <td className="border p-3">Rebar Coupler</td>
            <td className="border p-3">7308</td>
            <td className="border p-3">100</td>
            <td className="border p-3">₹40</td>
            <td className="border p-3">18%</td>
            <td className="border p-3 text-right">₹4,000</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Amount In Words
          </h3>
          <p>Four Thousand Seven Hundred Twenty Rupees Only</p>

          <h3 className="mt-6 mb-3 text-lg font-semibold text-blue-700">
            Bank Details
          </h3>
          <p>
            <b>Bank:</b> AXIS BANK
          </p>
          <p>
            <b>A/C No:</b> 926020011347605
          </p>
          <p>
            <b>IFSC:</b> UTIB0000341
          </p>
          <p>
            <b>Branch:</b> SHIVAJI PARK, MUMBAI
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <div className="flex justify-between border-b py-2">
            <span>Subtotal</span>
            <b>₹4,000</b>
          </div>

          <div className="flex justify-between border-b py-2">
            <span>CGST</span>
            <b>₹360</b>
          </div>

          <div className="flex justify-between border-b py-2">
            <span>SGST</span>
            <b>₹360</b>
          </div>

          <div className="flex justify-between border-b py-2">
            <span>Round Off</span>
            <b>₹0.00</b>
          </div>

          <div className="mt-3 flex justify-between border-t-2 border-blue-700 pt-3 text-xl">
            <span className="font-bold">Grand Total</span>
            <b className="text-blue-700">₹4,720</b>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h3 className="mb-3 text-lg font-semibold text-blue-700">
          Terms & Conditions
        </h3>
        <ol className="list-decimal pl-5">
          <li>Payment: 100% advance.</li>
          <li>Delivery: As per stock availability.</li>
          <li>GST extra as applicable.</li>
          <li>Transport charges extra.</li>
          <li>Material once sold will not be taken back.</li>
        </ol>
      </div>

      <div className="mt-10 text-right">
        <p>For Novaprime Engineering</p>
        <div className="h-16"></div>
        <b>Authorized Signatory</b>
      </div>
    </div>
  );
}
