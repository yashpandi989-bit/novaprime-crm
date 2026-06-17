"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Receipt,
  FileText,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL = "http://192.168.0.106:5000";

type Customer = {
  _id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  gst?: string;
  state?: string;
  stateCode?: string;
  address?: string;
  notes?: string;
  status?: string;
  totalSales?: number;
};

export default function CustomerViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers/${id}`);
      setCustomer(res.data.customer);
      setNotes(res.data.customer?.notes || "");
    } catch (error) {
      console.error("Customer load error:", error);
      alert("Customer load failed");
    }
  };

  const saveNotes = async () => {
    try {
      await axios.put(`${API_URL}/api/customers/${id}/notes`, {
        notes,
      });

      alert("Notes saved successfully");
      fetchCustomer();
    } catch (error) {
      console.error("Notes save error:", error);
      alert("Notes save failed");
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        Loading customer...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {customer.name}
            </h1>
            <p className="text-slate-500">
              Customer profile, GST details and sales summary.
            </p>
          </div>
        </div>

        <Link href={`/quotations?customerId=${customer._id}`}>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-0 shadow-lg md:col-span-2">
          <CardContent className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">{customer.name}</h2>
                  <p className="text-slate-500">{customer.company || "-"}</p>
                </div>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-1 text-sm ${
                  customer.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : customer.status === "Pending"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {customer.status || "Active"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoCard
                icon={<Phone className="h-5 w-5 text-blue-600" />}
                label="Phone"
                value={customer.phone || "-"}
              />

              <InfoCard
                icon={<Mail className="h-5 w-5 text-green-600" />}
                label="Email"
                value={customer.email || "-"}
              />

              <InfoCard
                icon={<Receipt className="h-5 w-5 text-purple-600" />}
                label="GST Number"
                value={customer.gst || "-"}
              />

              <InfoCard
                icon={<MapPin className="h-5 w-5 text-orange-600" />}
                label="State"
                value={`${customer.state || "-"} ${
                  customer.stateCode ? `(${customer.stateCode})` : ""
                }`}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Address</p>
              <p className="mt-1 font-medium">{customer.address || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="mb-5 text-xl font-semibold">Sales Summary</h2>

            <div className="space-y-4">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-sm text-slate-500">Total Sales</p>
                <h3 className="mt-2 text-3xl font-bold text-blue-600">
                  ₹{(customer.totalSales || 0).toLocaleString("en-IN")}
                </h3>
              </div>

              <div className="rounded-2xl bg-green-50 p-4">
                <p className="text-sm text-slate-500">Paid Amount</p>
                <h3 className="mt-2 text-2xl font-bold text-green-600">₹0</h3>
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <p className="text-sm text-slate-500">Outstanding</p>
                <h3 className="mt-2 text-2xl font-bold text-orange-600">₹0</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Customer Notes</h2>

          <div className="rounded-2xl border bg-slate-50 p-5">
            <textarea
              rows={5}
              placeholder="Write customer notes here..."
              className="w-full rounded-xl border p-3 outline-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="mt-4 flex justify-end">
              <Button onClick={saveNotes}>Save Notes</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Customer Activity</h2>

          <div className="rounded-2xl border bg-slate-50 p-8 text-center text-slate-500">
            No quotations or invoices linked yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
