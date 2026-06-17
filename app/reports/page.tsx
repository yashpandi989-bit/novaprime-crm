"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  AlertTriangle,
  BarChart3,
  Download,
  FileText,
  IndianRupee,
  Package,
  Receipt,
  RefreshCw,
  Search,
  Users,
  Wallet,
} from "lucide-react";

type Product = {
  _id: string;
  name?: string;
  category?: string;
  hsn?: string;
  rate?: number;
  stock?: number;
  unit?: string;
  gst?: number;
  status?: string;
};

type Customer = {
  _id: string;
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  totalSales?: number;
  status?: string;
};

type Invoice = {
  _id: string;
  invoiceNo?: string;
  invoiceDate?: string;
  customerName?: string;
  grandTotal?: number;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  status?: string;
  createdAt?: string;
};

const LOW_STOCK_LIMIT = 10;

export default function ReportsPage() {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://novaprime-backend.vercel.app";

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [reportFilter, setReportFilter] = useState<
    "all" | "sales" | "gst" | "inventory" | "customers"
  >("all");

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      const [productsRes, customersRes, invoicesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products`),
        axios.get(`${API_BASE}/api/customers`),
        axios.get(`${API_BASE}/api/invoices`),
      ]);

      setProducts(productsRes.data.products || []);
      setCustomers(customersRes.data.customers || []);
      setInvoices(invoicesRes.data.invoices || []);
    } catch (error) {
      console.error("Reports load failed", error);
      alert("Reports load failed");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.grandTotal || 0),
    0
  );

  const paidAmount = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0);

  const pendingAmount = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0);

  const taxableAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.subtotal || 0),
    0
  );

  const totalCGST = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.cgst || 0),
    0
  );

  const totalSGST = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.sgst || 0),
    0
  );

  const totalIGST = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.igst || 0),
    0
  );

  const totalGST = totalCGST + totalSGST + totalIGST;

  const stockValue = products.reduce(
    (sum, product) =>
      sum + Number(product.stock || 0) * Number(product.rate || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.stock || 0) < LOW_STOCK_LIMIT
  );

  const filteredInvoices = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      if (!searchText) return true;

      return (
        invoice.invoiceNo?.toLowerCase().includes(searchText) ||
        invoice.customerName?.toLowerCase().includes(searchText) ||
        invoice.status?.toLowerCase().includes(searchText)
      );
    });
  }, [invoices, search]);

  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((product) => {
      if (!searchText) return true;

      return (
        product.name?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText) ||
        product.hsn?.toLowerCase().includes(searchText)
      );
    });
  }, [products, search]);

  const filteredCustomers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return customers.filter((customer) => {
      if (!searchText) return true;

      return (
        customer.name?.toLowerCase().includes(searchText) ||
        customer.company?.toLowerCase().includes(searchText) ||
        customer.phone?.toLowerCase().includes(searchText) ||
        customer.email?.toLowerCase().includes(searchText)
      );
    });
  }, [customers, search]);

  const monthlySales = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(2026, index).toLocaleString("en-US", {
        month: "short",
      }),
      revenue: 0,
      invoices: 0,
    }));

    invoices.forEach((invoice) => {
      const date = new Date(invoice.invoiceDate || invoice.createdAt || "");
      const monthIndex = date.getMonth();

      if (!Number.isNaN(monthIndex) && months[monthIndex]) {
        months[monthIndex].revenue += Number(invoice.grandTotal || 0);
        months[monthIndex].invoices += 1;
      }
    });

    return months;
  }, [invoices]);

  const exportCSV = (type: "sales" | "gst" | "inventory" | "customers") => {
    let rows: Record<string, string | number>[] = [];
    let fileName = "report.csv";

    if (type === "sales") {
      rows = filteredInvoices.map((invoice) => ({
        InvoiceNo: invoice.invoiceNo || "",
        Date: invoice.invoiceDate || invoice.createdAt || "",
        Customer: invoice.customerName || "",
        Amount: Number(invoice.grandTotal || 0),
        Status: invoice.status || "Pending",
      }));
      fileName = "sales-report.csv";
    }

    if (type === "gst") {
      rows = filteredInvoices.map((invoice) => ({
        InvoiceNo: invoice.invoiceNo || "",
        Date: invoice.invoiceDate || invoice.createdAt || "",
        Customer: invoice.customerName || "",
        TaxableAmount: Number(invoice.subtotal || 0),
        CGST: Number(invoice.cgst || 0),
        SGST: Number(invoice.sgst || 0),
        IGST: Number(invoice.igst || 0),
        TotalGST:
          Number(invoice.cgst || 0) +
          Number(invoice.sgst || 0) +
          Number(invoice.igst || 0),
        GrandTotal: Number(invoice.grandTotal || 0),
      }));
      fileName = "gst-report.csv";
    }

    if (type === "inventory") {
      rows = filteredProducts.map((product) => {
        const stock = Number(product.stock || 0);
        const rate = Number(product.rate || 0);

        return {
          Product: product.name || "",
          Category: product.category || "",
          HSN: product.hsn || "",
          Stock: stock,
          Unit: product.unit || "",
          Rate: rate,
          Value: stock * rate,
          Status: stock < LOW_STOCK_LIMIT ? "Low Stock" : "In Stock",
        };
      });
      fileName = "inventory-report.csv";
    }

    if (type === "customers") {
      rows = filteredCustomers.map((customer) => ({
        Name: customer.name || "",
        Company: customer.company || "",
        Phone: customer.phone || "",
        Email: customer.email || "",
        TotalSales: Number(customer.totalSales || 0),
        Status: customer.status || "",
      }));
      fileName = "customer-ledger.csv";
    }

    const header = Object.keys(rows[0] || { NoData: "" });

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header
          .map((key) => {
            const value = String(row[key] ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    window.URL.revokeObjectURL(url);
  };

  const visibleReports = [
    {
      key: "sales",
      title: "Sales Report",
      desc: "Monthly sales, revenue and invoice summary",
      icon: IndianRupee,
      action: () => exportCSV("sales"),
    },
    {
      key: "gst",
      title: "GST Report",
      desc: "CGST, SGST, IGST and taxable amount report",
      icon: FileText,
      action: () => exportCSV("gst"),
    },
    {
      key: "inventory",
      title: "Inventory Report",
      desc: "Stock value, product value and low-stock report",
      icon: Package,
      action: () => exportCSV("inventory"),
    },
    {
      key: "customers",
      title: "Customer Ledger",
      desc: "Customer-wise ledger and sales summary",
      icon: BarChart3,
      action: () => exportCSV("customers"),
    },
  ].filter((report) => reportFilter === "all" || report.key === reportFilter);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>

          <p className="mt-1 text-slate-500">
            Business analytics, GST, inventory and customer reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchReportsData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <IndianRupee className="h-10 w-10 text-green-600" />

            <div>
              <p className="text-slate-500">Total Revenue</p>
              <h2 className="text-3xl font-bold">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Wallet className="h-10 w-10 text-orange-500" />

            <div>
              <p className="text-slate-500">Pending Amount</p>
              <h2 className="text-3xl font-bold">
                ₹{pendingAmount.toLocaleString("en-IN")}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Receipt className="h-10 w-10 text-blue-600" />

            <div>
              <p className="text-slate-500">Invoices</p>
              <h2 className="text-3xl font-bold">{invoices.length}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertTriangle className="h-10 w-10 text-red-500" />

            <div>
              <p className="text-slate-500">Low Stock</p>
              <h2 className="text-3xl font-bold">{lowStockProducts.length}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports data"
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none"
              />
            </div>

            <select
              value={reportFilter}
              onChange={(e) =>
                setReportFilter(
                  e.target.value as "all" | "sales" | "gst" | "inventory" | "customers"
                )
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Reports</option>
              <option value="sales">Sales Report</option>
              <option value="gst">GST Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="customers">Customer Ledger</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {visibleReports.map((report) => {
          const Icon = report.icon;

          return (
            <Card key={report.title} className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <Icon className="h-10 w-10 text-blue-600" />

                <h2 className="mt-5 text-xl font-bold">{report.title}</h2>

                <p className="mt-2 min-h-[40px] text-sm text-slate-500">
                  {report.desc}
                </p>

                <Button className="mt-5 w-full" onClick={report.action}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="mb-5 text-xl font-semibold">GST Summary</h2>

            <div className="space-y-4">
              <SummaryRow label="Taxable Amount" value={taxableAmount} />
              <SummaryRow label="CGST" value={totalCGST} />
              <SummaryRow label="SGST" value={totalSGST} />
              <SummaryRow label="IGST" value={totalIGST} />
              <SummaryRow label="Total GST" value={totalGST} bold />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="mb-5 text-xl font-semibold">Inventory Summary</h2>

            <div className="space-y-4">
              <SummaryText label="Products" value={products.length} />
              <SummaryText label="Customers" value={customers.length} />
              <SummaryRow label="Stock Value" value={stockValue} />
              <SummaryText label="Low Stock Products" value={lowStockProducts.length} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Monthly Sales Summary</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="p-4 text-left">Month</th>
                  <th className="p-4 text-left">Invoices</th>
                  <th className="p-4 text-left">Revenue</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">
                      Loading reports...
                    </td>
                  </tr>
                ) : (
                  monthlySales.map((item) => (
                    <tr key={item.month} className="border-b">
                      <td className="p-4 font-medium">{item.month}</td>
                      <td className="p-4">{item.invoices}</td>
                      <td className="p-4 font-semibold">
                        ₹{item.revenue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="mb-5 text-xl font-semibold">Recent Invoices</h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="p-4 text-left">Invoice No</th>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.slice(0, 8).map((invoice) => (
                  <tr key={invoice._id} className="border-b">
                    <td className="p-4 font-medium">{invoice.invoiceNo || "-"}</td>
                    <td className="p-4">{invoice.invoiceDate || "-"}</td>
                    <td className="p-4">{invoice.customerName || "-"}</td>
                    <td className="p-4 font-semibold">
                      ₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {invoice.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading && filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
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
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className={bold ? "font-semibold" : "text-slate-500"}>{label}</span>
      <span className={bold ? "font-bold" : "font-semibold"}>
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

function SummaryText({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
