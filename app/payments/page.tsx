"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianRupee, Plus, Wallet } from "lucide-react";

const payments: any[] = [];

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500">
            Track received, partial and pending payments.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <IndianRupee className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-slate-500">Received</p>
              <h2 className="text-3xl font-bold">₹0</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Wallet className="h-10 w-10 text-orange-500" />
            <div>
              <p className="text-slate-500">Partial</p>
              <h2 className="text-3xl font-bold">₹0</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Wallet className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-slate-500">Pending</p>
              <h2 className="text-3xl font-bold">₹0</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 text-left">Receipt No</th>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Mode</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-slate-500"
                >
                  No payments found
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
