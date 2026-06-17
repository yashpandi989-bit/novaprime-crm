"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { ArrowLeft, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState({
    name: "",
    category: "",
    hsn: "",
    gst: 18,
    rate: 0,
    stock: 0,
    unit: "pcs",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await axios.get(`http://192.168.0.106:5000/api/products/${id}`);
      setForm({
        name: res.data.product.name || "",
        category: res.data.product.category || "",
        hsn: res.data.product.hsn || "",
        gst: res.data.product.gst || 18,
        rate: res.data.product.rate || 0,
        stock: res.data.product.stock || 0,
        unit: res.data.product.unit || "pcs",
        description: res.data.product.description || "",
        status: res.data.product.status || "Active",
      });
    } catch (error) {
      console.error(error);
      alert("Product load failed");
    }
  };

  const updateField = (field: string, value: any) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const saveProduct = async () => {
    try {
      if (!form.name.trim()) {
        alert("Product name required");
        return;
      }

      await axios.put(`http://192.168.0.106:5000/api/products/${id}`, form);

      alert("Product updated successfully");
      router.push("/products");
    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Product update failed");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={saveProduct}>
            <Save className="mr-2 h-4 w-4" />
            Save Product
          </Button>
        </div>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-8">
            <h1 className="mb-6 text-3xl font-bold text-slate-900">
              Edit Product
            </h1>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                className="rounded-xl border p-3"
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />

              <input
                className="rounded-xl border p-3"
                placeholder="Category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              />

              <input
                className="rounded-xl border p-3"
                placeholder="HSN Code"
                value={form.hsn}
                onChange={(e) => updateField("hsn", e.target.value)}
              />

              <input
                type="number"
                className="rounded-xl border p-3"
                placeholder="GST %"
                value={form.gst}
                onChange={(e) => updateField("gst", Number(e.target.value))}
              />

              <input
                type="number"
                className="rounded-xl border p-3"
                placeholder="Rate"
                value={form.rate}
                onChange={(e) => updateField("rate", Number(e.target.value))}
              />

              <input
                type="number"
                className="rounded-xl border p-3"
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => updateField("stock", Number(e.target.value))}
              />

              <select
                className="rounded-xl border p-3"
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
              >
                <option value="pcs">pcs</option>
                <option value="unit">unit</option>
                <option value="roll">roll</option>
                <option value="meter">meter</option>
                <option value="kg">kg</option>
                <option value="set">set</option>
              </select>

              <select
                className="rounded-xl border p-3"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <textarea
                className="rounded-xl border p-3 md:col-span-2"
                placeholder="Description"
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="mt-8 flex justify-end">
              <Button onClick={saveProduct}>
                <Save className="mr-2 h-4 w-4" />
                Save Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
