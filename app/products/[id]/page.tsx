"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import {
  ArrowLeft,
  Box,
  Edit,
  IndianRupee,
  Package,
  Percent,
  Hash,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://192.168.0.106:5000/api/products/${id}`);
      setProduct(res.data.product);
    } catch (error) {
      console.error(error);
      alert("Product load failed");
    }
  };

  if (!product) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 p-8">Loading product...</div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push("/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button onClick={() => router.push(`/products/edit/${product._id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Product
          </Button>
        </div>

        <Card className="rounded-3xl border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="mb-8 flex items-start justify-between">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100">
                  <Box className="h-8 w-8 text-blue-600" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {product.name}
                  </h1>
                  <p className="text-slate-500">{product.category || "-"}</p>
                </div>
              </div>

              <span className="rounded-full bg-green-100 px-4 py-1 text-sm text-green-700">
                {product.status}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-4">
              <Info icon={<Hash />} label="HSN" value={product.hsn || "-"} />
              <Info icon={<Percent />} label="GST" value={`${product.gst}%`} />
              <Info
                icon={<IndianRupee />}
                label="Rate"
                value={`₹${(product.rate || 0).toLocaleString("en-IN")}`}
              />
              <Info
                icon={<Package />}
                label="Stock"
                value={`${(product.stock || 0).toLocaleString("en-IN")} ${
                  product.unit || ""
                }`}
              />
            </div>

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Description</p>
              <p className="mt-1 font-medium">
                {product.description || "No description added."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="mb-2 flex items-center gap-2 text-blue-600">
        {icon}
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
