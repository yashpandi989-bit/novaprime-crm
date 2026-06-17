"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import {
  Building2,
  Download,
  FileText,
  Landmark,
  Plus,
  Send,
  Trash2,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const COMPANY_STATE_CODE = "27";

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

function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertLessThanThousand = (n: number): string => {
    let str = "";

    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str.trim();
  };

  if (num === 0) return "Zero Rupees Only";

  let result = "";
  let n = Math.floor(num);

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const hundred = n;

  if (crore) result += convertLessThanThousand(crore) + " Crore ";
  if (lakh) result += convertLessThanThousand(lakh) + " Lakh ";
  if (thousand) result += convertLessThanThousand(thousand) + " Thousand ";
  if (hundred) result += convertLessThanThousand(hundred);

  return result.trim() + " Rupees Only";
}

export default function ProformaInvoicePage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [gstin, setGstin] = useState("");

  const [sameAddress, setSameAddress] = useState(true);
  const [shipName, setShipName] = useState("");
  const [shipContact, setShipContact] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipGstin, setShipGstin] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");

  const [piNo, setPiNo] = useState("PI-2026-001");
  const [piDate, setPiDate] = useState("");
  const [validTill, setValidTill] = useState("");
  const [salesPerson, setSalesPerson] = useState("Novaprime Sales Team");

  const [discount, setDiscount] = useState(0);
  const [freight, setFreight] = useState(0);
  const [loading, setLoading] = useState(0);
  const [packing, setPacking] = useState(0);

  const [items, setItems] = useState<Item[]>([
    { product: "", hsn: "", qty: 1, rate: 0, gst: 18 },
  ]);

  useEffect(() => {
    fetchProducts();
    setPiDate(new Date().toISOString().slice(0, 10));
  }, []);

 const fetchProducts = async () => {
  try {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://novaprime-backend.vercel.app";

    const res = await axios.get(`${API_BASE}/api/products`);

    setProducts(res.data.products || []);
  } catch (error) {
    console.error("Products fetch error:", error);
  }
};

  const billStateCode = gstin.slice(0, 2);
  const billGstInfo = gstStates[billStateCode];

  const shipStateCode = shipGstin.slice(0, 2);
  const shipGstInfo = gstStates[shipStateCode];

  const placeOfSupplyCode =
    !sameAddress && shipStateCode ? shipStateCode : billStateCode;

  const placeOfSupplyState = gstStates[placeOfSupplyCode]?.state || "";

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

  const generatePDF = () => window.print();

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-8 no-print">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Proforma Invoice
            </h1>
            <p className="text-slate-500">
              Create GST proforma invoice for customer approval.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>

            <Button>
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
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
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
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
                      placeholder="Contact Person"
                      value={shipContact}
                      onChange={(e) => setShipContact(e.target.value)}
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
                      className="rounded-xl border p-3 md:col-span-2"
                      placeholder="Delivery Location"
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                    />

                    <textarea
                      className="rounded-xl border p-3 md:col-span-2"
                      placeholder="Shipping Address"
                      rows={3}
                      value={shipAddress}
                      onChange={(e) => setShipAddress(e.target.value)}
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
                <h2 className="mb-5 text-xl font-semibold">Items</h2>

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
                  <h2 className="text-xl font-semibold">Proforma Info</h2>
                </div>

                <div className="space-y-4">
                  <input
                    className="w-full rounded-xl border p-3"
                    value={piNo}
                    onChange={(e) => setPiNo(e.target.value)}
                  />

                  <input
                    type="date"
                    className="w-full rounded-xl border p-3"
                    value={piDate}
                    onChange={(e) => setPiDate(e.target.value)}
                  />

                  <input
                    type="date"
                    className="w-full rounded-xl border p-3"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                  />

                  <input
                    className="w-full rounded-xl border p-3"
                    value={salesPerson}
                    onChange={(e) => setSalesPerson(e.target.value)}
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

                  <div className="rounded-2xl bg-blue-50 p-4 text-sm font-medium text-blue-700">
                    {numberToWords(roundedTotal)}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button variant="outline" className="w-full" onClick={generatePDF}>
                    Generate PDF
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
                  <p><b>Bank:</b> AXIS BANK</p>
                  <p><b>A/C No:</b> 926020011347605</p>
                  <p><b>IFSC:</b> UTIB0000341</p>
                  <p><b>Branch:</b> SHIVAJI PARK, MUMBAI</p>
                  <p><b>UPI:</b></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="print-only">
        <div className="a4-page">
          <div className="mb-4 flex justify-between border-b-2 border-blue-700 pb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-700">
                NOVAPRIME ENGINEERING
              </h1>
              <p>Construction Products & Engineering Solutions</p>
              <p>GSTIN: 27CUVPR9032E1Z0</p>
              <p>Email: novaprimeengineering@gmail.com</p>
              <p>Phone: +91 8591300722</p>
            </div>

            <div className="text-right">
              <h2 className="text-4xl font-light text-blue-700">
                PROFORMA INVOICE
              </h2>
              <p className="mt-3 font-semibold">{piNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><b>PI Date:</b> {piDate || "-"}</p>
            <p><b>Valid Till:</b> {validTill || "-"}</p>
            <p><b>Sales Person:</b> {salesPerson}</p>
            <p>
              <b>Place of Supply:</b> {placeOfSupplyState || "-"} (
              {placeOfSupplyCode || "-"})
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4">
              <h3 className="mb-2 font-bold text-blue-700">Bill To</h3>
              <p><b>{customerName || "Customer Name"}</b></p>
              <p>GSTIN: {gstin || "-"}</p>
              <p>State: {billGstInfo?.state || "-"} ({billGstInfo?.code || "-"})</p>
              <p>Phone: {phone || "-"}</p>
              <p>Email: {email || "-"}</p>
              <p>{billingAddress || "-"}</p>
            </div>

            <div className="rounded-xl border p-4">
              <h3 className="mb-2 font-bold text-blue-700">Ship To</h3>
              {sameAddress ? (
                <>
                  <p><b>{customerName || "Customer Name"}</b></p>
                  <p>GSTIN: {gstin || "-"}</p>
                  <p>State: {billGstInfo?.state || "-"} ({billGstInfo?.code || "-"})</p>
                  <p>{billingAddress || "-"}</p>
                </>
              ) : (
                <>
                  <p><b>{shipName || "-"}</b></p>
                  <p>Contact: {shipContact || "-"}</p>
                  <p>GSTIN: {shipGstin || "-"}</p>
                  <p>State: {shipGstInfo?.state || "-"} ({shipGstInfo?.code || "-"})</p>
                  <p>Delivery: {deliveryLocation || "-"}</p>
                  <p>{shipAddress || "-"}</p>
                </>
              )}
            </div>
          </div>

          <table className="mt-5 w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="border p-2 text-left">#</th>
                <th className="border p-2 text-left">Product</th>
                <th className="border p-2 text-left">HSN</th>
                <th className="border p-2 text-left">Qty</th>
                <th className="border p-2 text-left">Rate</th>
                <th className="border p-2 text-left">GST %</th>
                <th className="border p-2 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{item.product || "-"}</td>
                  <td className="border p-2">{item.hsn || "-"}</td>
                  <td className="border p-2">{item.qty}</td>
                  <td className="border p-2">
                    ₹{item.rate.toLocaleString("en-IN")}
                  </td>
                  <td className="border p-2">{item.gst}%</td>
                  <td className="border p-2 text-right">
                    ₹{(item.qty * item.rate).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 text-sm">
              <h3 className="mb-2 font-bold text-blue-700">Amount In Words</h3>
              <p>{numberToWords(roundedTotal)}</p>

              <h3 className="mt-4 mb-2 font-bold text-blue-700">
                Bank Details
              </h3>
              <p><b>Bank:</b> AXIS BANK</p>
              <p><b>A/C No:</b> 926020011347605</p>
              <p><b>IFSC:</b> UTIB0000341</p>
              <p><b>Branch:</b> SHIVAJI PARK, MUMBAI</p>
            </div>

            <div className="rounded-xl border p-4 text-sm">
              <Summary label="Subtotal" value={subtotal} />
              <Summary label="Discount" value={discountAmount} minus />
              <Summary label="Freight" value={freight} />
              <Summary label="Loading" value={loading} />
              <Summary label="Packing" value={packing} />
              <Summary label="CGST" value={cgst} />
              <Summary label="SGST" value={sgst} />
              <Summary label="IGST" value={igst} />
              <Summary label="Round Off" value={roundOff} />

              <div className="mt-3 flex justify-between border-t-2 border-blue-700 pt-3 text-lg">
                <b>Grand Total</b>
                <b className="text-blue-700">
                  ₹{roundedTotal.toLocaleString("en-IN")}
                </b>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border p-4 text-sm">
            <h3 className="mb-2 font-bold text-blue-700">Terms & Conditions</h3>
            <ol className="list-decimal space-y-1 pl-5">
              <li>Payment: 100% advance.</li>
              <li>Delivery: As per stock availability.</li>
              <li>GST and transport charges extra if applicable.</li>
              <li>Material once sold will not be taken back.</li>
            </ol>
          </div>

          <div className="mt-8 text-right">
            <p>For Novaprime Engineering</p>
            <div className="h-16"></div>
            <b>Authorized Signatory</b>
          </div>
        </div>
      </div>
    </>
  );
}

function Summary({ label, value, minus }: any) {
  return (
    <div className="flex justify-between border-b py-1">
      <span>{label}</span>
      <b>
        {minus ? "- " : ""}₹{(value || 0).toLocaleString("en-IN")}
      </b>
    </div>
  );
}
