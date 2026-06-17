"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  AlertTriangle,
  Download,
  Edit,
  Eye,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Warehouse,
} from "lucide-react";

type Product = {
  _id: string;
  name: string;
  category?: string;
  hsn?: string;
  gst?: number;
  rate?: number;
  stock?: number;
  unit?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

const LOW_STOCK_LIMIT = 10;
const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://novaprime-backend.vercel.app";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "available">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "stock" | "rate" | "value">(
    "name"
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/products`);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Inventory load failed", error);
      alert("Inventory load failed");
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0
  );

  const totalValue = products.reduce((sum, product) => {
    const stock = Number(product.stock || 0);
    const rate = Number(product.rate || 0);
    return sum + stock * rate;
  }, 0);

  const lowStockCount = products.filter(
    (product) => Number(product.stock || 0) < LOW_STOCK_LIMIT
  ).length;

  const categories = useMemo(() => {
    return [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        product.name?.toLowerCase().includes(searchText) ||
        product.category?.toLowerCase().includes(searchText) ||
        product.hsn?.toLowerCase().includes(searchText);

      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      const stock = Number(product.stock || 0);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && stock < LOW_STOCK_LIMIT) ||
        (stockFilter === "available" && stock >= LOW_STOCK_LIMIT);

      return matchesSearch && matchesCategory && matchesStock;
    });

    return list.sort((a, b) => {
      if (sortBy === "stock") {
        return Number(b.stock || 0) - Number(a.stock || 0);
      }

      if (sortBy === "rate") {
        return Number(b.rate || 0) - Number(a.rate || 0);
      }

      if (sortBy === "value") {
        return (
          Number(b.stock || 0) * Number(b.rate || 0) -
          Number(a.stock || 0) * Number(a.rate || 0)
        );
      }

      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }, [products, search, categoryFilter, stockFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportCSV = () => {
    const rows = filteredProducts.map((product) => {
      const stock = Number(product.stock || 0);
      const rate = Number(product.rate || 0);

      return {
        Name: product.name || "",
        Category: product.category || "",
        HSN: product.hsn || "",
        GST: product.gst || 0,
        Stock: stock,
        Unit: product.unit || "",
        Rate: rate,
        Value: stock * rate,
        Status: stock < LOW_STOCK_LIMIT ? "Low Stock" : "In Stock",
      };
    });

    const header = Object.keys(
      rows[0] || {
        Name: "",
        Category: "",
        HSN: "",
        GST: "",
        Stock: "",
        Unit: "",
        Rate: "",
        Value: "",
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
    link.download = "novaprime-inventory.csv";
    link.click();

    window.URL.revokeObjectURL(url);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    try {
      setDeletingId(id);
      await axios.delete(`${API_BASE}/api/products/${id}`);
      await fetchProducts();
    } catch (error) {
      console.error("Product delete failed", error);
      alert("Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  const startItem =
    filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="mt-1 text-slate-500">
            Track product stock, value, status and low-stock alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>

          <Button onClick={() => router.push("/products")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <PackageCheck className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-slate-500">Total Products</p>
              <h2 className="text-3xl font-bold">{totalProducts}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Warehouse className="h-10 w-10 text-blue-600" />
            <div>
              <p className="text-slate-500">Total Stock</p>
              <h2 className="text-3xl font-bold">{totalStock.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <Warehouse className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-slate-500">Stock Value</p>
              <h2 className="text-3xl font-bold">
                ₹{totalValue.toLocaleString("en-IN")}
              </h2>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertTriangle className="h-10 w-10 text-orange-500" />
            <div>
              <p className="text-slate-500">Low Stock</p>
              <h2 className="text-3xl font-bold">{lowStockCount}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, HSN, category"
                className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border bg-white px-4 py-3 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={String(category)} value={String(category)}>
                  {String(category)}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value as "all" | "low" | "available")
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none"
            >
              <option value="all">All Stock</option>
              <option value="available">In Stock</option>
              <option value="low">Low Stock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "stock" | "rate" | "value")
              }
              className="rounded-xl border bg-white px-4 py-3 outline-none"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock</option>
              <option value="rate">Sort by Rate</option>
              <option value="value">Sort by Value</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-3xl border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Category</th>
                  <th className="p-4 text-left">HSN</th>
                  <th className="p-4 text-left">Stock</th>
                  <th className="p-4 text-left">Unit</th>
                  <th className="p-4 text-left">Rate</th>
                  <th className="p-4 text-left">Value</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-500">
                      Loading inventory...
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const stock = Number(product.stock || 0);
                    const rate = Number(product.rate || 0);
                    const value = stock * rate;
                    const isLowStock = stock < LOW_STOCK_LIMIT;

                    return (
                      <tr key={product._id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-900">
                          {product.name || "-"}
                        </td>

                        <td className="p-4">{product.category || "-"}</td>

                        <td className="p-4">{product.hsn || "-"}</td>

                        <td className="p-4 font-medium">{stock}</td>

                        <td className="p-4">{product.unit || "-"}</td>

                        <td className="p-4">₹{rate.toLocaleString("en-IN")}</td>

                        <td className="p-4 font-semibold">
                          ₹{value.toLocaleString("en-IN")}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              isLowStock
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/products/${product._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(`/products/edit/${product._id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingId === product._id}
                              onClick={() => deleteProduct(product._id)}
                            >
                              <Trash2 className="h-4 w-4" />
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
              Showing {startItem} - {endItem} of {filteredProducts.length}
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
