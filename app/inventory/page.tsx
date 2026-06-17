
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PackageCheck, Warehouse } from "lucide-react";

const items = [
  { name: "Rebar Coupler", stock: "5,000", unit: "pcs", value: "₹2,00,000", status: "In Stock" },
  { name: "Thread Protection Cap", stock: "12,000", unit: "pcs", value: "₹60,000", status: "In Stock" },
  { name: "Rebar Threading Machine", stock: "25", unit: "units", value: "₹33,75,000", status: "In Stock" },
  { name: "Bull Float", stock: "3", unit: "units", value: "₹75,000", status: "Low Stock" },
];

export default function InventoryPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
        <p className="text-slate-500">Track stock, value and low-stock products.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <PackageCheck className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-slate-500">Total Items</p>
                <h2 className="text-3xl font-bold">4</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Warehouse className="h-10 w-10 text-blue-600" />
              <div>
                <p className="text-slate-500">Stock Value</p>
                <h2 className="text-3xl font-bold">₹37.1L</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <AlertTriangle className="h-10 w-10 text-orange-500" />
              <div>
                <p className="text-slate-500">Low Stock</p>
                <h2 className="text-3xl font-bold">1</h2>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Unit</th>
                  <th className="p-4 text-left">Value</th>
                  <th className="p-4 text-left">Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.name} className="border-b">
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">{item.stock}</td>
                    <td className="p-4">{item.unit}</td>
                    <td className="p-4 font-semibold">{item.value}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-3 py-1 text-xs ${
                        item.status === "In Stock"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
