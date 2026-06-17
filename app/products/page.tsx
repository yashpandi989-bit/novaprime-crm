"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Box,
  IndianRupee,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Product = {
  _id: string;
  name: string;
  category: string;
  hsn: string;
  gst: number;
  rate: number;
  stock: number;
  unit: string;
  description: string;
  status: string;
};
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://novaprime-backend.vercel.app";
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [hsn, setHsn] = useState("");
  const [gst, setGst] = useState(18);
  const [rate, setRate] = useState(0);
  const [stock, setStock] = useState(0);
  const [unit, setUnit] = useState("pcs");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Products fetch error:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      `${product.name} ${product.category} ${product.hsn} ${product.unit}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [products, search]);

  const totalStock = products.reduce(
    (sum, product) => sum + (product.stock || 0),
    0
  );

  const totalValue = products.reduce(
    (sum, product) => sum + (product.stock || 0) * (product.rate || 0),
    0
  );

  const lowStock = products.filter(
  (product) => product.stock > 0 && product.stock <= 10
).length;

  const resetForm = () => {
    setName("");
    setCategory("");
    setHsn("");
    setGst(18);
    setRate(0);
    setStock(0);
    setUnit("pcs");
    setDescription("");
    setStatus("Active");
  };

  const saveProduct = async () => {
    try {
      if (!name.trim()) {
        alert("Product name required");
        return;
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        name,
        category,
        hsn,
        gst,
        rate,
        stock,
        unit,
        description,
        status,
      });

      resetForm();
      setOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error("Product save error:", error.response?.data || error);
      alert(error.response?.data?.message || "Product save failed");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      console.error("Product delete error:", error);
      alert("Product delete failed");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Products
            </h1>
            <p className="text-slate-500">
              Manage construction products, HSN, GST, stock and rate.
            </p>
          </div>

          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Package className="h-9 w-9 text-blue-600" />
              <div>
                <p className="text-sm text-slate-500">Total Products</p>
                <h2 className="text-3xl font-bold">{products.length}</h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Box className="h-9 w-9 text-green-600" />
              <div>
                <p className="text-sm text-slate-500">Total Stock</p>
                <h2 className="text-3xl font-bold">
                  {totalStock.toLocaleString("en-IN")}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <IndianRupee className="h-9 w-9 text-purple-600" />
              <div>
                <p className="text-sm text-slate-500">Stock Value</p>
                <h2 className="text-3xl font-bold">
                  ₹{totalValue.toLocaleString("en-IN")}
                </h2>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="flex items-center gap-4 p-6">
              <Package className="h-9 w-9 text-orange-500" />
              <div>
                <p className="text-sm text-slate-500">Low Stock</p>
                <h2 className="text-3xl font-bold">{lowStock}</h2>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="relative w-96">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search product..."
                  className="w-full rounded-2xl border bg-slate-50 py-2 pl-10 pr-4 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-lg"
                >
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                      <Box className="h-6 w-6 text-blue-600" />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        product.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold">{product.name}</h2>
                  <p className="text-sm text-slate-500">
                    {product.category || "-"}
                  </p>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">HSN / GST</p>
                      <p className="font-medium">
                        {product.hsn || "-"} • {product.gst || 0}%
                      </p>
                    </div>

                    <div className="flex justify-between rounded-xl bg-blue-50 p-3">
                      <span>Rate</span>
                      <b>₹{(product.rate || 0).toLocaleString("en-IN")}</b>
                    </div>

                    <div className="flex justify-between rounded-xl bg-green-50 p-3">
                      <span>Stock</span>
                      <b>
                        {(product.stock || 0).toLocaleString("en-IN")}{" "}
                        {product.unit || "pcs"}
                      </b>
                    </div>

                    {product.description && (
                      <div className="rounded-xl border bg-slate-50 p-3">
                        <p className="line-clamp-2 text-slate-600">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>

                 <div className="mt-5 flex gap-2">
  <Button
    variant="outline"
    className="flex-1"
    onClick={() => router.push(`/products/${product._id}`)}
  >
    View
  </Button>

  <Button
    className="flex-1"
    onClick={() => router.push(`/products/edit/${product._id}`)}
  >
    Edit
  </Button>

  <Button
    variant="outline"
    onClick={() => deleteProduct(product._id)}
  >
    <Trash2 className="h-4 w-4 text-red-500" />
  </Button>
</div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full rounded-2xl border bg-slate-50 p-8 text-center text-slate-500">
                  No products found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add Product</h2>
                <button onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-xl border p-3"
                  placeholder="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <input
                  className="rounded-xl border p-3"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />

                <input
                  className="rounded-xl border p-3"
                  placeholder="HSN Code"
                  value={hsn}
                  onChange={(e) => setHsn(e.target.value)}
                />

                <input
                  type="number"
                  className="rounded-xl border p-3"
                  placeholder="GST %"
                  value={gst}
                  onChange={(e) => setGst(Number(e.target.value))}
                />

                <input
                  type="number"
                  className="rounded-xl border p-3"
                  placeholder="Rate"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                />

                <input
                  type="number"
                  className="rounded-xl border p-3"
                  placeholder="Stock"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                />

                <select
                  className="rounded-xl border p-3"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
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
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <textarea
                  className="rounded-xl border p-3 md:col-span-2"
                  placeholder="Description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProduct}>Save Product</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
