import RevenueChart from "@/components/dashboard/RevenueChart";
import {
  IndianRupee,
  Users,
  FileText,
  Receipt,
  TrendingUp,
  Package,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    
      <div className="min-h-screen bg-slate-50">
        {/* Page Header */}
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Novaprime Engineering CRM
          </h1>

          <p className="mt-1 text-slate-500">
            Construction ERP • Billing • CRM
          </p>
        </div>

        <div className="px-8 pb-8">
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white">
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-blue-100">
                      Total Revenue
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                      ₹18.4L
                    </h2>

                    <p className="mt-2 text-green-300 text-sm">
                      +12.5% this month
                    </p>
                  </div>

                  <IndianRupee className="h-10 w-10 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-slate-500">
                      Customers
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                      248
                    </h2>
                  </div>

                  <Users className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-slate-500">
                      Quotations
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                      86
                    </h2>
                  </div>

                  <FileText className="h-10 w-10 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between">
                  <div>
                    <p className="text-slate-500">
                      Invoices
                    </p>

                    <h2 className="mt-3 text-4xl font-bold">
                      142
                    </h2>
                  </div>

                  <Receipt className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />

                  <h3 className="text-xl font-semibold">
                    Revenue Analytics
                  </h3>
                </div>

                <div className="mt-6 rounded-2xl">
  <RevenueChart />
</div>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-500" />

                  <h3 className="text-xl font-semibold">
                    Inventory
                  </h3>
                </div>

                <div className="mt-5 space-y-4">

                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm text-slate-500">
                      Rebar Coupler
                    </p>

                    <p className="text-xl font-bold">
                      5,000 pcs
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm text-slate-500">
                      Thread Protection Caps
                    </p>

                    <p className="text-xl font-bold">
                      12,000 pcs
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-4">
                    <p className="text-sm text-slate-500">
                      Threading Machines
                    </p>

                    <p className="text-xl font-bold">
                      25 Units
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tables */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">

            <Card className="border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-5 text-xl font-semibold">
                  Recent Quotations
                </h3>

                <div className="space-y-3">

                  <div className="rounded-xl border p-4">
                    QTN-001 • ABC Builders • ₹1,20,000
                  </div>

                  <div className="rounded-xl border p-4">
                    QTN-002 • Metro Infra • ₹95,000
                  </div>

                  <div className="rounded-xl border p-4">
                    QTN-003 • Skyline Projects • ₹2,10,000
                  </div>

                </div>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <h3 className="mb-5 text-xl font-semibold">
                  Recent Invoices
                </h3>

                <div className="space-y-3">

                  <div className="rounded-xl border p-4">
                    INV-001 • Paid • ₹85,000
                  </div>

                  <div className="rounded-xl border p-4">
                    INV-002 • Pending • ₹1,50,000
                  </div>

                  <div className="rounded-xl border p-4">
                    INV-003 • Paid • ₹70,000
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
  );
}
