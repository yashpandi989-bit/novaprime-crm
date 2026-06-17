"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Building2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://novaprime-backend.vercel.app";

type Customer = {
  _id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  gst: string;
  state: string;
  stateCode: string;
  address: string;
  notes: string;
  status: string;
  totalSales: number;
};

const gstStates: Record<string, { state: string; code: string }> = {
  "27": { state: "Maharashtra", code: "27" },
  "24": { state: "Gujarat", code: "24" },
  "23": { state: "Madhya Pradesh", code: "23" },
  "07": { state: "Delhi", code: "07" },
  "09": { state: "Uttar Pradesh", code: "09" },
  "29": { state: "Karnataka", code: "29" },
  "33": { state: "Tamil Nadu", code: "33" },
  "36": { state: "Telangana", code: "36" },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gst, setGst] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Active");

  const gstCode = gst.slice(0, 2);
  const gstInfo = gstStates[gstCode];

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/customers`);
      setCustomers(res.data.customers || []);
    } catch (error) {
      console.error("Customer fetch error:", error);
      alert("Customer fetch failed");
    }
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) =>
      `${customer.name} ${customer.company} ${customer.phone} ${customer.email} ${customer.gst} ${customer.notes}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [customers, search]);

  const totalSales = customers.reduce(
    (sum, customer) => sum + (customer.totalSales || 0),
    0
  );

  const resetForm = () => {
    setName("");
    setCompany("");
    setPhone("");
    setEmail("");
    setGst("");
    setAddress("");
    setNotes("");
    setStatus("Active");
  };

  const saveCustomer = async () => {
    try {
      if (!name.trim()) {
        alert("Customer name required");
        return;
      }

      await axios.post(`${API_BASE}/api/customers`, {
        name,
        company,
        phone,
        email,
        gst,
        state: gstInfo?.state || "",
        stateCode: gstInfo?.code || "",
        address,
        notes,
        status,
        totalSales: 0,
      });

      resetForm();
      setOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error("Customer save error:", error);
      alert("Customer save failed");
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer?")) return;

    try {
      await axios.delete(`${API_BASE}/api/customers/${id}`);
      fetchCustomers();
    } catch (error) {
      console.error("Customer delete error:", error);
      alert("Customer delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">
            Manage clients, GST details and customer sales.
          </p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-slate-500">Total Customers</p>
            <h2 className="mt-2 text-4xl font-bold">{customers.length}</h2>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-slate-500">Active Customers</p>
            <h2 className="mt-2 text-4xl font-bold text-green-600">
              {customers.filter((c) => c.status === "Active").length}
            </h2>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-slate-500">Customer Sales</p>
            <h2 className="mt-2 text-4xl font-bold text-blue-600">
              ₹{totalSales.toLocaleString("en-IN")}
            </h2>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-0 shadow-lg">
        <CardContent className="p-4 md:p-6">
          <div className="mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search customer..."
                className="w-full rounded-2xl border bg-slate-50 py-2 pl-10 pr-4 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <div
                key={customer._id}
                className="rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">{customer.name}</h2>
                      <p className="text-sm text-slate-500">
                        {customer.company || "-"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      customer.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : customer.status === "Pending"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    {customer.phone || "-"}
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4" />
                    {customer.email || "-"}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">GST Number</p>
                    <p className="font-medium">{customer.gst || "-"}</p>
                    <p className="text-xs text-slate-500">
                      {customer.state || "-"} {customer.stateCode || ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3">
                    <p className="mb-1 text-xs font-semibold text-yellow-700">
                      Notes
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-700">
                      {customer.notes || "No notes added"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-blue-50 p-3">
                    <span className="text-slate-600">Total Sales</span>
                    <b className="text-blue-600">
                      ₹{(customer.totalSales || 0).toLocaleString("en-IN")}
                    </b>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href={`/customers/${customer._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>

                  <Link
                    href={`/quotations?customerId=${customer._id}`}
                    className="flex-1"
                  >
                    <Button className="w-full">New Quote</Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => deleteCustomer(customer._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="col-span-full rounded-2xl border bg-slate-50 p-8 text-center text-slate-500">
                No customers found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Customer</h2>
              <button onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border p-3"
                placeholder="Customer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="rounded-xl border p-3"
                placeholder="Company Name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />

              <input
                className="rounded-xl border p-3"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <input
                className="rounded-xl border p-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="rounded-xl border p-3"
                placeholder="GSTIN"
                value={gst}
                onChange={(e) => setGst(e.target.value.toUpperCase())}
              />

              <input
                className="rounded-xl border bg-slate-100 p-3"
                placeholder="State"
                value={gstInfo?.state || ""}
                readOnly
              />

              <input
                className="rounded-xl border bg-slate-100 p-3"
                placeholder="State Code"
                value={gstInfo?.code || ""}
                readOnly
              />

              <select
                className="rounded-xl border p-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>

              <textarea
                className="rounded-xl border p-3 md:col-span-2"
                placeholder="Address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <textarea
                className="rounded-xl border p-3 md:col-span-2"
                placeholder="Customer Notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCustomer}>Save Customer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
