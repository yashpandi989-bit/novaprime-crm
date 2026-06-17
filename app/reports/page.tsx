
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, FileText, IndianRupee, Package } from "lucide-react";

const reports = [
  { title: "Sales Report", desc: "Monthly sales and revenue summary", icon: IndianRupee },
  { title: "GST Report", desc: "CGST, SGST and taxable amount report", icon: FileText },
  { title: "Inventory Report", desc: "Stock value and low-stock report", icon: Package },
  { title: "Customer Ledger", desc: "Customer-wise invoices and payments", icon: BarChart3 },
];

export default function ReportsPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500">Business analytics for Novaprime Engineering.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {reports.map((report) => (
            <Card key={report.title} className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <report.icon className="h-10 w-10 text-blue-600" />
                <h2 className="mt-5 text-xl font-bold">{report.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{report.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
