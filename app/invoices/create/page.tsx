"use client";


import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Building2,
  FileText,
  Landmark,
  Plus,
  Save,
  Send,
  Trash2,
  Truck,
} from "lucide-react";

const COMPANY_STATE_CODE = "27";

const gstStates: Record<string, { state: string; code: string }> = {
  "01": { state: "Jammu & Kashmir", code: "01" },
  "02": { state: "Himachal Pradesh", code: "02" },
  "03": { state: "Punjab", code: "03" },
  "04": { state: "Chandigarh", code: "04" },
  "05": { state: "Uttarakhand", code: "05" },
  "06": { state: "Haryana", code: "06" },
  "07": { state: "Delhi", code: "07" },
  "08": { state: "Rajasthan", code: "08" },
  "09": { state: "Uttar Pradesh", code: "09" },
  "10": { state: "Bihar", code: "10" },
  "11": { state: "Sikkim", code: "11" },
  "12": { state: "Arunachal Pradesh", code: "12" },
  "13": { state: "Nagaland", code: "13" },
  "14": { state: "Manipur", code: "14" },
  "15": { state: "Mizoram", code: "15" },
  "16": { state: "Tripura", code: "16" },
  "17": { state: "Meghalaya", code: "17" },
  "18": { state: "Assam", code: "18" },
  "19": { state: "West Bengal", code: "19" },
  "20": { state: "Jharkhand", code: "20" },
  "21": { state: "Odisha", code: "21" },
  "22": { state: "Chhattisgarh", code: "22" },
  "23": { state: "Madhya Pradesh", code: "23" },
  "24": { state: "Gujarat", code: "24" },
  "26": { state: "Dadra & Nagar Haveli and Daman & Diu", code: "26" },
  "27": { state: "Maharashtra", code: "27" },
  "29": { state: "Karnataka", code: "29" },
  "30": { state: "Goa", code: "30" },
  "31": { state: "Lakshadweep", code: "31" },
  "32": { state: "Kerala", code: "32" },
  "33": { state: "Tamil Nadu", code: "33" },
  "34": { state: "Puducherry", code: "34" },
  "35": { state: "Andaman & Nicobar Islands", code: "35" },
  "36": { state: "Telangana", code: "36" },
  "37": { state: "Andhra Pradesh", code: "37" },
  "38": { state: "Ladakh", code: "38" },
  "97": { state: "Other Territory", code: "97" },
};

type Product = {
  _id: string;
  name: string;
  hsn: string;
  rate: number;
  gst: number;
};

type Item = {
  product: string;
  hsn: string;
  qty: number;
  rate: number;
  gst: number;
};

export default function CreateInvoicePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);

  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Pending");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [billGstin, setBillGstin] = useState("");
  const [shipGstin, setShipGstin] = useState("");
  const [sameAddress, setSameAddress] = useState(true);

  const [shipName, setShipName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const [discount, setDiscount] = useState(0);
  const [freight, setFreight] = useState(0);
  const [loading, setLoading] = useState(0);
  const [packing, setPacking] = useState(0);

  const [items, setItems] = useState<Item[]>([
    { product: "", hsn: "", qty: 1, rate: 0, gst: 18 },
  ]);

  useEffect(() => {
    getInvoiceNumber();
    fetchProducts();
  }, []);

  const getInvoiceNumber = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/next-number`
      );

      setInvoiceNo(res.data.invoiceNo);
      setInvoiceDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error("Invoice number error:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Products fetch error:", error);
    }
  };

  const billStateCode = billGstin.slice(0, 2);
  const billGstInfo = gstStates[billStateCode];

  const shipStateCode = shipGstin.slice(0, 2);
  const shipGstInfo = gstStates[shipStateCode];

  const placeOfSupplyCode =
    !sameAddress && shipStateCode ? shipStateCode : billStateCode;

  const isInterState =
    placeOfSupplyCode && placeOfSupplyCode !== COMPANY_STATE_CODE;

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.rate, 0),
    [items]
  );

  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount + freight + loading + packing;

  const gstAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (item.qty * item.rate * item.gst) / 100,
      0
    );
  }, [items]);

  const cgst = isInterState ? 0 : gstAmount / 2;
  const sgst = isInterState ? 0 : gstAmount / 2;
  const igst = isInterState ? gstAmount : 0;

  const grandTotal = taxableAmount + gstAmount;
  const roundedTotal = Math.round(grandTotal);
  const roundOff = roundedTotal - grandTotal;

  const updateProduct = (index: number, productName: string) => {
    const selected = products.find((p) => p.name === productName);
    if (!selected) return;

    const updated = [...items];

    updated[index] = {
      ...updated[index],
      product: selected.name,
      hsn: selected.hsn || "",
      rate: selected.rate || 0,
      gst: selected.gst || 18,
    };

    setItems(updated);
  };

  const updateItem = (
    index: number,
    field: keyof Item,
    value: string | number
  ) => {
    const updated = [...items];

    updated[index] = {
      ...updated[index],
      [field]: field === "product" || field === "hsn" ? value : Number(value),
    };

    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { product: "", hsn: "", qty: 1, rate: 0, gst: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const saveInvoice = async () => {
    try {
      if (!customerName.trim()) {
        alert("Customer name required");
        return;
      }

      if (!invoiceNo) {
        alert("Invoice number not generated");
        return;
      }

      const invoiceData = {
        invoiceNo,
        invoiceDate,
        dueDate,

        customerName,
        phone,
        email,
        billingAddress,

        billGstin,
        billState: billGstInfo?.state || "",
        billStateCode: billGstInfo?.code || "",

        shipName: sameAddress ? customerName : shipName,
        shipPhone: sameAddress ? phone : shipPhone,
        shipGstin: sameAddress ? billGstin : shipGstin,
        shipState: sameAddress
          ? billGstInfo?.state || ""
          : shipGstInfo?.state || "",
        shipStateCode: sameAddress
          ? billGstInfo?.code || ""
          : shipGstInfo?.code || "",
        shippingAddress: sameAddress ? billingAddress : shippingAddress,
        deliveryLocation,

        items: items.map((item) => ({
          ...item,
          amount: item.qty * item.rate,
        })),

        subtotal,
        discount,
        discountAmount,
        freight,
        loading,
        packing,
        cgst,
        sgst,
        igst,
        roundOff,
        grandTotal: roundedTotal,
        status,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices`, invoiceData);

      alert("Invoice saved in MongoDB successfully!");
      router.push("/invoices");
    } catch (error: any) {
      console.error("Invoice save error:", error.response?.data || error);
      alert(error.response?.data?.error || "Invoice save failed");
    }
  };

  const generatePDF = () => {
    window.print();
  };

  const markAsPaid = () => {
    setStatus("Paid");
    alert("Status changed to Paid. Click Save Invoice to update.");
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create Invoice
            </h1>
            <p className="text-slate-500">
              GST invoice for Novaprime Engineering.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>

            <Button onClick={saveInvoice}>
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Bill To</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className="rounded-xl border p-3"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />

                  <input
                    className="rounded-xl border p-3"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <input
                    className="rounded-xl border p-3"
                    placeholder="GSTIN e.g. 27ABCDE1234F1Z5"
                    value={billGstin}
                    onChange={(e) =>
                      setBillGstin(e.target.value.toUpperCase())
                    }
                  />

                  <input
                    className="rounded-xl border bg-slate-100 p-3"
                    placeholder="State"
                    value={billGstInfo?.state || ""}
                    readOnly
                  />

                  <input
                    className="rounded-xl border bg-slate-100 p-3"
                    placeholder="State Code"
                    value={billGstInfo?.code || ""}
                    readOnly
                  />

                  <input
                    className="rounded-xl border p-3"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <textarea
                    className="rounded-xl border p-3 md:col-span-2"
                    placeholder="Billing Address"
                    rows={3}
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold">Ship To</h2>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={sameAddress}
                      onChange={(e) => setSameAddress(e.target.checked)}
                    />
                    Same as Bill To
                  </label>
                </div>

                {!sameAddress ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      className="rounded-xl border p-3"
                      placeholder="Site / Company Name"
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                    />

                    <input
                      className="rounded-xl border p-3"
                      placeholder="Phone Number"
                      value={shipPhone}
                      onChange={(e) => setShipPhone(e.target.value)}
                    />

                    <input
                      className="rounded-xl border p-3"
                      placeholder="Ship To GSTIN"
                      value={shipGstin}
                      onChange={(e) =>
                        setShipGstin(e.target.value.toUpperCase())
                      }
                    />

                    <input
                      className="rounded-xl border bg-slate-100 p-3"
                      placeholder="Ship To State"
                      value={shipGstInfo?.state || ""}
                      readOnly
                    />

                    <input
                      className="rounded-xl border bg-slate-100 p-3"
                      placeholder="Ship To State Code"
                      value={shipGstInfo?.code || ""}
                      readOnly
                    />

                    <input
                      className="rounded-xl border p-3"
                      placeholder="Delivery Location"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                    />

                    <textarea
                      className="rounded-xl border p-3 md:col-span-2"
                      placeholder="Shipping Address"
                      rows={3}
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
                    Shipping address will be same as billing address.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-5 text-xl font-semibold">Invoice Items</h2>

                <div className="overflow-x-auto rounded-2xl border">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-left">HSN</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Rate</th>
                        <th className="p-3">GST %</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => {
                        const amount = item.qty * item.rate;

                        return (
                          <tr key={index} className="border-t">
                            <td className="p-3">
                              <select
                                className="w-full rounded-lg border p-2"
                                value={item.product}
                                onChange={(e) =>
                                  updateProduct(index, e.target.value)
                                }
                              >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                  <option
                                    key={product._id}
                                    value={product.name}
                                  >
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-3">
                              <input
                                className="w-24 rounded-lg border p-2"
                                value={item.hsn}
                                onChange={(e) =>
                                  updateItem(index, "hsn", e.target.value)
                                }
                              />
                            </td>

                            <td className="p-3 text-center">
                              <input
                                type="number"
                                className="w-20 rounded-lg border p-2 text-center"
                                value={item.qty}
                                onChange={(e) =>
                                  updateItem(index, "qty", e.target.value)
                                }
                              />
                            </td>

                            <td className="p-3 text-center">
                              <input
                                type="number"
                                className="w-28 rounded-lg border p-2 text-center"
                                value={item.rate}
                                onChange={(e) =>
                                  updateItem(index, "rate", e.target.value)
                                }
                              />
                            </td>

                            <td className="p-3 text-center">
                              <input
                                type="number"
                                className="w-20 rounded-lg border p-2 text-center"
                                value={item.gst}
                                onChange={(e) =>
                                  updateItem(index, "gst", e.target.value)
                                }
                              />
                            </td>

                            <td className="p-3 text-right font-semibold">
                              ₹{amount.toLocaleString("en-IN")}
                            </td>

                            <td className="p-3 text-center">
                              <button
                                onClick={() => removeItem(index)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={addItem}
                  className="mt-4 flex items-center text-sm font-medium text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Invoice Info</h2>
                </div>

                <div className="space-y-4">
                  <input
                    className="w-full rounded-xl border bg-slate-100 p-3"
                    value={invoiceNo}
                    readOnly
                  />

                  <input
                    type="date"
                    className="w-full rounded-xl border p-3"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                  />

                  <input
                    type="date"
                    className="w-full rounded-xl border p-3"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />

                  <select
                    className="w-full rounded-xl border p-3"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>

                  <input
                    className="w-full rounded-xl border p-3"
                    defaultValue="Novaprime Sales Team"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-5 text-xl font-semibold">Charges</h2>

                <div className="space-y-3">
                  <input
                    type="number"
                    className="w-full rounded-xl border p-3"
                    placeholder="Discount %"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                  />

                  <input
                    type="number"
                    className="w-full rounded-xl border p-3"
                    placeholder="Freight Charges"
                    value={freight}
                    onChange={(e) => setFreight(Number(e.target.value))}
                  />

                  <input
                    type="number"
                    className="w-full rounded-xl border p-3"
                    placeholder="Loading Charges"
                    value={loading}
                    onChange={(e) => setLoading(Number(e.target.value))}
                  />

                  <input
                    type="number"
                    className="w-full rounded-xl border p-3"
                    placeholder="Packing Charges"
                    value={packing}
                    onChange={(e) => setPacking(Number(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <h2 className="mb-5 text-xl font-semibold">Summary</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <b>₹{subtotal.toLocaleString("en-IN")}</b>
                  </div>

                  <div className="flex justify-between">
                    <span>Discount</span>
                    <b>- ₹{discountAmount.toLocaleString("en-IN")}</b>
                  </div>

                  <div className="flex justify-between">
                    <span>Freight</span>
                    <b>₹{freight.toLocaleString("en-IN")}</b>
                  </div>

                  <div className="flex justify-between">
                    <span>Loading</span>
                    <b>₹{loading.toLocaleString("en-IN")}</b>
                  </div>

                  <div className="flex justify-between">
                    <span>Packing</span>
                    <b>₹{packing.toLocaleString("en-IN")}</b>
                  </div>

                  <div className="border-t pt-4">
                    {isInterState ? (
                      <div className="flex justify-between">
                        <span>IGST</span>
                        <b>₹{igst.toLocaleString("en-IN")}</b>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>CGST</span>
                          <b>₹{cgst.toLocaleString("en-IN")}</b>
                        </div>

                        <div className="mt-3 flex justify-between">
                          <span>SGST</span>
                          <b>₹{sgst.toLocaleString("en-IN")}</b>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span>Round Off</span>
                    <b>₹{roundOff.toFixed(2)}</b>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl">
                      <span className="font-bold">Grand Total</span>
                      <span className="font-bold text-blue-600">
                        ₹{roundedTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button className="w-full" onClick={saveInvoice}>
                    Save Invoice
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={generatePDF}
                  >
                    Generate PDF
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={markAsPaid}
                  >
                    Mark As Paid
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold">Bank Details</h2>
                </div>

                <div className="space-y-2 text-sm">
                  <p>
                    <b>Bank:</b> AXIS BANK
                  </p>
                  <p>
                    <b>A/C No:</b> 926020011347605
                  </p>
                  <p>
                    <b>IFSC:</b> UTIB0000341
                  </p>
                  <p>
                    <b>Branch:</b> SHIVAJI PARK, MUMBAI
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
