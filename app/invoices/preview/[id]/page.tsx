"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ToWords } from "to-words";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicePreviewPage() {
  const params = useParams();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
  try {
   const url = "https://novaprime-backend.vercel.app/api/invoices";

    console.log("FINAL API URL:", url);

    const res = await axios.get(url);

    console.log("API DATA:", res.data);

    const list = Array.isArray(res.data)
      ? res.data
      : res.data.invoices || [];

    const foundInvoice = list.find(
      (inv: any) => inv._id === id || inv.id === id
    );

    if (!foundInvoice) {
      throw new Error("Invoice not found");
    }

    setInvoice(foundInvoice);
  } catch (error: any) {
    console.error("Invoice fetch error:", error);
    console.log("STATUS:", error?.response?.status);
    console.log("URL:", error?.config?.url);
    console.log("DATA:", error?.response?.data);
  }
};

  if (!invoice) {
    return <div className="p-8">Loading invoice...</div>;
  }

  return (
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
    <div className="text-slate-900">
      <div className="flex justify-between border-b-2 border-blue-700 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            NOVAPRIME ENGINEERING
          </h1>
          <p>Engineering CRM</p>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-bold">TAX INVOICE</h2>
          <p>
            <b>Invoice No:</b> {invoice.invoiceNo || "-"}
          </p>
          <p>
            <b>Date:</b> {invoice.date || "-"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-semibold text-blue-700">Bill To</h3>
          <p>
            <b>{invoice.customerName || "-"}</b>
          </p>
          <p>{invoice.customerAddress || "-"}</p>
          <p>GSTIN: {invoice.customerGst || "-"}</p>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-2 font-semibold text-blue-700">Company Details</h3>
          <p>Novaprime Engineering</p>
          <p>Mumbai, Maharashtra</p>
          <p>GSTIN: -</p>
        </div>
      </div>

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-blue-700 text-white">
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
              <td className="border p-3">{item.product || item.name || "-"}</td>
              <td className="border p-3">{item.hsn || "-"}</td>
              <td className="border p-3">{item.qty || 0}</td>
              <td className="border p-3">
                ₹{(item.rate || 0).toLocaleString("en-IN")}
              </td>
              <td className="border p-3">{item.gst || 0}%</td>
              <td className="border p-3 text-right">
                ₹{((item.amount || item.qty * item.rate) || 0).toLocaleString(
                  "en-IN"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Terms & Conditions
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Payment: 100% advance.</li>
            <li>Delivery: As per stock availability.</li>
            <li>GST and transport charges extra if applicable.</li>
            <li>Material once sold will not be taken back.</li>
          </ol>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-lg font-semibold text-blue-700">
            Amount In Words
          </h3>
          <p className="mb-5 font-medium">{amountInWords}</p>

          <h3 className="mb-3 text-lg font-semibold text-blue-700">
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
      </div>

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

      <div className="mt-10 text-right">
        <p>For Novaprime Engineering</p>
        <div className="h-16"></div>
        <b>Authorized Signatory</b>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, minus }: any) {
  return (
    <div className="flex justify-between border-b py-2">
      <span>{label}</span>
      <b>
        {minus ? "- " : ""}₹{(value || 0).toLocaleString("en-IN")}
      </b>
    </div>
  );
}