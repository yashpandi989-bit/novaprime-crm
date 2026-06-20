"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Eye,
  IndianRupee,
  Plus,
  Receipt,
  Send,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

type Invoice = {
  _id: string;
  invoiceNo: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;
  grandTotal: number;
  status: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
  try {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://novaprime-backend.vercel.app";

    const res = await axios.get(`${API_BASE}/api/invoices`);

    setInvoices(res.data.invoices || []);
  } catch (error) {
    console.error("Invoice fetch error:", error);
  }
};

  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.grandTotal || 0),
    0
  );

  const paidAmount = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Invoices
            </h1>
            <p className="text-slate-500">
              GST invoices, payments and outstanding tracking.
            </p>
          </div>

          <Link href="/invoices/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
          </Link>
        </div>
        

        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Receipt className="h-10 w-10 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Total Invoices</p>
                <h2 className="text-3xl font-bold">{invoices.length}</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <IndianRupee className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">Received</p>
                <h2 className="text-3xl font-bold">
                  ₹{paidAmount.toLocaleString("en-IN")}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Wallet className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-sm text-slate-500">Outstanding</p>
                <h2 className="text-3xl font-bold">
                  ₹{pendingAmount.toLocaleString("en-IN")}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Receipt className="h-10 w-10 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Total Value</p>
                <h2 className="text-3xl font-bold">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </h2>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Invoices</h2>

             <input
  className="w-full md:w-80 rounded-2xl border bg-slate-50 px-4 py-2 outline-none"
  placeholder="Search invoice..."
/>
            </div>

            <div className="overflow-x-auto rounded-2xl border">
  <table className="min-w-[950px] w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-4 text-left">Invoice No</th>
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Due Date</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="border-t">
                      <td className="p-4 font-semibold text-blue-600">
                        {invoice.invoiceNo}
                      </td>

                      <td className="p-4">
                        {invoice.customerName || "No Customer"}
                      </td>

                      <td className="p-4">
                        {invoice.invoiceDate || "-"}
                      </td>

                      <td className="p-4">
                        {invoice.dueDate || "-"}
                      </td>

                      <td className="p-4 font-semibold">
                        ₹{(invoice.grandTotal || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            invoice.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : invoice.status === "Partial"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {invoice.status || "Pending"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-1 md:gap-3">
  <Link href={`/invoices/preview/${invoice._id}`}>
    <button className="rounded-lg border p-1.5 md:p-2 hover:bg-slate-100" title="View">
      <Eye className="h-4 w-4" />
    </button>
  </Link>

  <button
    className="rounded-lg border p-1.5 md:p-2 hover:bg-slate-100"
    title="Download"
    onClick={() => {
      window.open(`/invoices/preview/${invoice._id}`, "_blank");
    }}
  >
    <Download className="h-4 w-4 text-blue-600" />
  </button>

  <button
    className="rounded-lg border p-1.5 md:p-2 hover:bg-slate-100"
    title="WhatsApp"
    onClick={() => {
      const invoiceUrl = `${window.location.origin}/invoices/preview/${invoice._id}`;
      const message = `Novaprime Engineering Invoice\nInvoice No: ${invoice.invoiceNo}\nAmount: ₹${(
        invoice.grandTotal || 0
      ).toLocaleString("en-IN")}\n${invoiceUrl}`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }}
  >
    <Send className="h-4 w-4 text-green-600" />
  </button>
</div>
                      </td>
                    </tr>
                  ))}

                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No invoices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
