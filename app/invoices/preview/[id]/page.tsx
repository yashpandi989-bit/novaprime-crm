"use client";

import { ToWords } from "to-words";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function InvoicePreviewPage() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(
        `http://192.168.0.106:5000/api/invoices/${id}`
      );
      setInvoice(res.data.invoice);
    } catch (error) {
      console.error("Invoice fetch error:", error);
      alert("Invoice load failed");
    }
  };

  if (!invoice) {
    return (
      <>
        <div className="p-8">Loading invoice...</div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/invoices">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <Button onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>

        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-10 shadow-xl">
          <InvoiceContent invoice={invoice} />
        </div>
      </div>
    </>
  );
}

function InvoiceContent({ invoice }: any) {
  const items = invoice.items || [];

  const toWords = new ToWords({
  localeCode: "en-IN",
});

const amountInWords =
  toWords.convert(invoice.grandTotal || 0) + " Rupees Only";

  return (
    <><div className="text-slate-900">
      <div className="flex justify-between border-b-2 border-blue-700 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700">
            NOVAPRIME ENGINEERING
          </h1>
          <p>GSTIN: 27CUVPR9032E1Z0</p>
          <p>Email: novaprimeengineering@gmail.com</p>
          <p>Phone: +91 8591300722</p>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-light text-blue-700">TAX INVOICE</h2>
          <p className="mt-3 font-semibold">{invoice.invoiceNo}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div><b>Invoice Date:</b> {invoice.invoiceDate || "-"}</div>
        <div><b>Due Date:</b> {invoice.dueDate || "-"}</div>
        <div>
          <b>Place of Supply:</b>{" "}
          {invoice.shipState || invoice.billState || "-"} (
          {invoice.shipStateCode || invoice.billStateCode || "-"})
        </div>
        <div><b>Status:</b> {invoice.status || "Pending"}</div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">Bill To</h3>
          <p className="font-semibold">{invoice.customerName || "-"}</p>
          <p>GSTIN: {invoice.billGstin || "-"}</p>
          <p>State: {invoice.billState || "-"} ({invoice.billStateCode || "-"})</p>
          <p>Phone: {invoice.phone || "-"}</p>
          <p>Email: {invoice.email || "-"}</p>
          <p>{invoice.billingAddress || "-"}</p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">Ship To</h3>
          <p className="font-semibold">{invoice.shipName || invoice.customerName || "-"}</p>
          <p>GSTIN: {invoice.shipGstin || invoice.billGstin || "-"}</p>
          <p>State: {invoice.shipState || invoice.billState || "-"} ({invoice.shipStateCode || invoice.billStateCode || "-"})</p>
          <p>{invoice.shippingAddress || invoice.billingAddress || "-"}</p>
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
          {items.map((item: any, index: number) => (
            <tr key={index}>
              <td className="border p-3">{index + 1}</td>
              <td className="border p-3">{item.product}</td>
              <td className="border p-3">{item.hsn}</td>
              <td className="border p-3">{item.qty}</td>
              <td className="border p-3">
                ₹{(item.rate || 0).toLocaleString("en-IN")}
              </td>
              <td className="border p-3">{item.gst}%</td>
              <td className="border p-3 text-right">
                ₹{((item.amount || item.qty * item.rate) || 0).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 grid md:grid-cols-2 gap-4">

        {/* Terms */}
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Terms & Conditions
          </h3>

          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Payment: 100% advance.</li>
            <li>Delivery: As per stock availability.</li>
            <li>GST and transport charges extra if applicable.</li>
            <li>Material once sold will not be taken back.</li>
          </ol>
        </div>

        {/* Amount + Bank */}
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Amount In Words
          </h3>

          <p className="mb-5 font-medium">
            {amountInWords}
          </p>

          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Bank Details
          </h3>

          <p><b>Bank:</b> AXIS BANK</p>
          <p><b>A/C No:</b> 926020011347605</p>
          <p><b>IFSC:</b> UTIB0000341</p>
          <p><b>Branch:</b> SHIVAJI PARK, MUMBAI</p>
        </div>

      </div>

      {/* Summary Separate */}
      <div className="mt-4 rounded-xl border p-4">
        <SummaryRow label="Subtotal" value={invoice.subtotal} />
        <SummaryRow label="Discount" value={invoice.discountAmount} minus />
        <SummaryRow label="Freight" value={invoice.freight} />
        <SummaryRow label="CGST" value={invoice.cgst} />
        <SummaryRow label="SGST" value={invoice.sgst} />
        <SummaryRow label="IGST" value={invoice.igst} />
        <SummaryRow label="Round Off" value={invoice.roundOff} />

        <div className="mt-3 flex justify-between border-t-2 border-blue-700 pt-3 text-xl">
          <span className="font-bold">Grand Total</span>
          <b className="text-blue-700">
            ₹{(invoice.grandTotal || 0).toLocaleString("en-IN")}
          </b>
        </div>
      </div>
    </div><div className="mt-10 text-right">
        <p>For Novaprime Engineering</p>
        <div className="h-16"></div>
        <b>Authorized Signatory</b>
      </div></>
    
  );
}

function SummaryRow({ label, value, minus }: any) {
  return (
    <div className="flex justify-between border-b py-2">
      <span>{label}</span>
      <b>{minus ? "- " : ""}₹{(value || 0).toLocaleString("en-IN")}</b>
    </div>
  );

  
  
}
