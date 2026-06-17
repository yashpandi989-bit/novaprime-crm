"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Download,
  Eye,
  IndianRupee,
  RefreshCw,
  Search,
  Wallet,
  Receipt,
  Printer,
  Clock,
} from "lucide-react";

type Invoice = {
  _id: string;
  invoiceNo?: string;
  invoiceDate?: string;
  dueDate?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  grandTotal?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

const ITEMS_PER_PAGE = 10;

export default function PaymentsPage() {
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://novaprime-backend.vercel.app";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Pending">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"date" | "amount" | "customer">("date");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/invoices`);
      setInvoices(res.data.invoices || []);
    } catch (error) {
      console.error("Payments load failed", error);
      alert("Payments load failed");
    } finally {
      setLoading(false);
    }
  };

  const received = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0);

  const pending = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0);

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal || 0),
    0
  );

  const paidInvoices = invoices.filter((invoice) => invoice.status === "Paid").length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== "Paid").length;

  const filteredInvoices = useMemo(() => {
    const list = invoices.filter((invoice) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        invoice.invoiceNo?.toLowerCase().includes(searchText) ||
        invoice.customerName?.toLowerCase().includes(searchText) ||
        invoice.phone?.toLowerCase().includes(searchText) ||
        invoice.email?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "Paid" && invoice.status === "Paid") ||
        (statusFilter === "Pending" && invoice.status !== "Paid");

      return matchesSearch && matchesStatus;
    });

    return list.sort((a, b) => {
      if (sortBy === "amount") {
        return Number(b.grandTotal || 0) - Number(a.grandTotal || 0);
      }

      if (sortBy === "customer") {
        return String(a.customerName || "").localeCompare(
          String(b.customerName || "")
        );
      }

      return (
        new Date(b.invoiceDate || b.createdAt || 0).getTime() -
        new Date(a.invoiceDate || a.createdAt || 0).getTime()
      );
    });
  }, [invoices, search, statusFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE)
  );

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const startItem =
    filteredInvoices.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredInvoices.length
  );

  const exportCSV = () => {
    const rows = filteredInvoices.map((invoice) => ({
      InvoiceNo: invoice.invoiceNo || "",
      Date: invoice.invoiceDate || invoice.createdAt || "",
      Customer: invoice.customerName || "",
      Phone: invoice.phone || "",
      Email: invoice.email || "",
      Amount: Number(invoice.grandTotal || 0),
      Status: invoice.status || "Pending",
    }));

    const header = Object.keys(
      rows[0] || {
        InvoiceNo: "",
        Date: "",
        Customer: "",
        Phone: "",
        Email: "",
        Amount: "",
        Status: "",
      }
    );

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => {
            const value = String(row[key as keyof typeof row] ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "novaprime-payments.csv";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const printPage = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="mt-1 text-slate-500">
            Track invoice payments, pending dues and customer billing status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchInvoices}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" onClick={printPage}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>

          <Button onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <IndianRupee className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-slate-500">Received</p>
              <h2 className="text-3xl font-bold">
                ₹{received.toLocaleString("en-IN")}
              </h2>
              <p className="text-sm text-slate-400">{paidInvoices} paid invoices</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Wallet className="h-10 w-10 text-orange-500" />
            <div>
              <p className="text-slate-500">Pending</p>
              <h2 className="text-3xl font-bold">
                ₹{pending.toLocaleString("en-IN")}
              </h2>
              <p className="text-sm text-slate-400">
                {pendingInvoices} pending invoices
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Receipt className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-slate-500">Total Invoices</p>
              <h2 className="text-3xl font-bold">{invoices.length}</h2>
              <p className="text-sm text-slate-400">All billing records</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Clock className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-slate-500">Total Billing</p>
              <h2 className="text-3xl font-bold">
                ₹{totalAmount.toLocaleString("en-IN")}
              </h2>
              <p className="text-sm text-slate-400">Paid + pending</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice, customer, phone"
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "Paid" | "Pending")
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "amount" | "customer")
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none"
            >
              <option value="date">Sort by Latest</option>
              <option value="amount">Sort by Amount</option>
              <option value="customer">Sort by Customer</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-sm">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="p-4 text-left">Invoice No</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Phone</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                      Loading payments...
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => {
                    const paid = invoice.status === "Paid";

                    return (
                      <tr key={invoice._id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-900">
                          {invoice.invoiceNo || "-"}
                        </td>

                        <td className="p-4">
                          {formatDate(invoice.invoiceDate || invoice.createdAt)}
                        </td>

                        <td className="p-4">{invoice.customerName || "-"}</td>

                        <td className="p-4">{invoice.phone || "-"}</td>

                        <td className="p-4 font-semibold">
                          ₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              paid
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {invoice.status || "Pending"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/invoices/preview/${invoice._id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/invoices/preview/${invoice._id}`)
                              }
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Showing {startItem} - {endItem} of {filteredInvoices.length}
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
