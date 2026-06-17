"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
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

const COMPANY_STATE_CODE = "27";
const API_BASE = "http://localhost:5000/api";

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

export default function QuotationsPage() {
  const router = useRouter();

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

  const [quoteNo, setQuoteNo] = useState("");
  const [quoteDate, setQuoteDate] = useState("");
  const [validTill, setValidTill] = useState("");
  const [salesPerson, setSalesPerson] = useState("Novaprime Sales Team");
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");

  const [discount, setDiscount] = useState(0);
  const [freight, setFreight] = useState(0);
  const [loading, setLoading] = useState(0);
  const [packing, setPacking] = useState(0);

  const [items, setItems] = useState<Item[]>([
    { product: "", hsn: "", qty: 1, rate: 0, gst: 18 },
  ]);

  useEffect(() => {
    fetchProducts();
    setQuoteDate(new Date().toISOString().slice(0, 10));

    const randomNo = Math.floor(1000 + Math.random() * 9000);
    setQuoteNo(`QTN-2026-${randomNo}`);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products`);
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
    Boolean(placeOfSupplyCode) && placeOfSupplyCode !== COMPANY_STATE_CODE;

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

  const generatePDF = async () => {
    try {
      setIsPdfGenerating(true);
      setPdfUrl("");
      setPdfFileName("");

      const pdfItems = items.filter((item) => item.product.trim() !== "");

      if (pdfItems.length === 0) {
        alert("Please select at least one product before creating PDF.");
        return;
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      let y = 12;

      const money = (value: number) =>
        `Rs. ${(value || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const checkPage = (needed = 20) => {
        if (y + needed > pageHeight - 15) {
          pdf.addPage();
          y = 15;
        }
      };

      const text = (
        value: string,
        x: number,
        yPos: number,
        size = 9,
        bold = false
      ) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.text(String(value || "-"), x, yPos);
      };

      const rightText = (
        value: string,
        x: number,
        yPos: number,
        size = 9,
        bold = false
      ) => {
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.text(String(value || "-"), x, yPos, { align: "right" });
      };

      const wrapped = (
        value: string,
        x: number,
        yPos: number,
        maxWidth: number,
        size = 8
      ) => {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(size);
        const lines = pdf.splitTextToSize(String(value || "-"), maxWidth);
        pdf.text(lines, x, yPos);
        return yPos + lines.length * 4;
      };

      pdf.setTextColor(29, 78, 216);
      text("NOVAPRIME ENGINEERING", margin, y, 18, true);
      pdf.setTextColor(15, 23, 42);
      text("Construction Products & Engineering Solutions", margin, y + 7, 9);
      text("GSTIN: 27CUVPR9032E1Z0", margin, y + 12, 9);
      text("Email: novaprimeengineering@gmail.com", margin, y + 17, 9);
      text("Phone: +91 8591300722", margin, y + 22, 9);

      pdf.setTextColor(29, 78, 216);
      rightText("QUOTATION", pageWidth - margin, y + 6, 22, true);
      pdf.setTextColor(15, 23, 42);
      rightText(quoteNo || "-", pageWidth - margin, y + 17, 10, true);

      pdf.setDrawColor(29, 78, 216);
      pdf.setLineWidth(0.7);
      pdf.line(margin, y + 28, pageWidth - margin, y + 28);
      y += 38;

      text(`Quotation Date: ${quoteDate || "-"}`, margin, y, 9, true);
      text(`Valid Till: ${validTill || "-"}`, 82, y, 9, true);
      text(`Sales Person: ${salesPerson || "-"}`, margin, y + 6, 9, true);
      text(
        `Place of Supply: ${placeOfSupplyState || "-"} (${placeOfSupplyCode || "-"})`,
        82,
        y + 6,
        9,
        true
      );
      y += 18;

      const boxW = (pageWidth - margin * 2 - 6) / 2;
      const boxH = 42;

      pdf.setDrawColor(203, 213, 225);
      pdf.rect(margin, y, boxW, boxH);
      pdf.rect(margin + boxW + 6, y, boxW, boxH);

      pdf.setTextColor(29, 78, 216);
      text("Bill To", margin + 3, y + 6, 10, true);
      text("Ship To", margin + boxW + 9, y + 6, 10, true);

      pdf.setTextColor(15, 23, 42);
      text(customerName || "Customer Name", margin + 3, y + 13, 9, true);
      text(`GSTIN: ${gstin || "-"}`, margin + 3, y + 18, 8);
      text(
        `State: ${billGstInfo?.state || "-"} (${billGstInfo?.code || "-"})`,
        margin + 3,
        y + 23,
        8
      );
      text(`Phone: ${phone || "-"}`, margin + 3, y + 28, 8);
      wrapped(billingAddress || "-", margin + 3, y + 34, boxW - 6, 8);

      const sName = sameAddress ? customerName : shipName;
      const sGstin = sameAddress ? gstin : shipGstin;
      const sState = sameAddress ? billGstInfo?.state : shipGstInfo?.state;
      const sCode = sameAddress ? billGstInfo?.code : shipGstInfo?.code;
      const sAddress = sameAddress ? billingAddress : shipAddress;

      text(sName || "Customer Name", margin + boxW + 9, y + 13, 9, true);
      text(`GSTIN: ${sGstin || "-"}`, margin + boxW + 9, y + 18, 8);
      text(`State: ${sState || "-"} (${sCode || "-"})`, margin + boxW + 9, y + 23, 8);
      wrapped(sAddress || "-", margin + boxW + 9, y + 30, boxW - 6, 8);

      y += boxH + 10;
      checkPage(60);

      const colX = [margin, margin + 10, margin + 78, margin + 98, margin + 114, margin + 138, margin + 158];
      const colW = [10, 68, 20, 16, 24, 20, 28];
      const headers = ["#", "Product", "HSN", "Qty", "Rate", "GST", "Amount"];
      const rowH = 9;

      pdf.setFillColor(239, 246, 255);
      pdf.rect(margin, y, pageWidth - margin * 2, rowH, "F");
      pdf.setDrawColor(203, 213, 225);

      headers.forEach((h, i) => {
        pdf.rect(colX[i], y, colW[i], rowH);
        text(h, colX[i] + 2, y + 6, 8, true);
      });
      y += rowH;

      pdfItems.forEach((item, index) => {
        checkPage(15);
        const amount = item.qty * item.rate;
        const productLines = pdf.splitTextToSize(item.product || "-", colW[1] - 3);
        const dynamicH = Math.max(rowH, productLines.length * 4 + 5);

        const values = [
          String(index + 1),
          "",
          item.hsn || "-",
          String(item.qty || 0),
          money(item.rate),
          `${item.gst || 0}%`,
          money(amount),
        ];

        values.forEach((v, i) => {
          pdf.rect(colX[i], y, colW[i], dynamicH);

          if (i === 1) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.text(productLines, colX[i] + 2, y + 5);
          } else if (i >= 3) {
            rightText(v, colX[i] + colW[i] - 2, y + 6, 8);
          } else {
            text(v, colX[i] + 2, y + 6, 8);
          }
        });

        y += dynamicH;
      });

      y += 8;
      checkPage(75);

      const leftX = margin;
      const rightX = 118;
      const summaryW = pageWidth - margin - rightX;

      pdf.rect(leftX, y, 92, 48);
      pdf.setTextColor(29, 78, 216);
      text("Amount In Words", leftX + 3, y + 7, 10, true);
      pdf.setTextColor(15, 23, 42);
      wrapped(numberToWords(roundedTotal), leftX + 3, y + 14, 86, 8);

      pdf.setTextColor(29, 78, 216);
      text("Bank Details", leftX + 3, y + 28, 10, true);
      pdf.setTextColor(15, 23, 42);
      text("Bank: AXIS BANK", leftX + 3, y + 35, 8);
      text("A/C No: 926020011347605", leftX + 3, y + 40, 8);
      text("IFSC: UTIB0000341", leftX + 3, y + 45, 8);

      pdf.rect(rightX, y, summaryW, 62);
      let sy = y + 7;

      const summaryRows: Array<[string, number, boolean?]> = [
        ["Subtotal", subtotal],
        ["Discount", discountAmount, true],
        ["Freight", freight],
        ["Loading", loading],
        ["Packing", packing],
        ["CGST", cgst],
        ["SGST", sgst],
        ["IGST", igst],
        ["Round Off", roundOff],
      ];

      summaryRows.forEach(([label, value, minus]) => {
        text(label, rightX + 3, sy, 8);
        rightText(`${minus ? "- " : ""}${money(value)}`, pageWidth - margin - 3, sy, 8, true);
        sy += 5;
      });

      pdf.setDrawColor(29, 78, 216);
      pdf.line(rightX + 3, sy, pageWidth - margin - 3, sy);
      sy += 7;
      text("Grand Total", rightX + 3, sy, 10, true);
      pdf.setTextColor(29, 78, 216);
      rightText(money(roundedTotal), pageWidth - margin - 3, sy, 10, true);
      pdf.setTextColor(15, 23, 42);

      y += 70;
      checkPage(62);

      pdf.rect(margin, y, pageWidth - margin * 2, 28);
      pdf.setTextColor(29, 78, 216);
      text("Terms & Conditions", margin + 3, y + 7, 10, true);
      pdf.setTextColor(15, 23, 42);

      const terms = [
        "Payment: 100% advance.",
        "Delivery: As per stock availability.",
        "GST and transport charges extra if applicable.",
        "Material once sold will not be taken back.",
      ];

      terms.forEach((term, index) => {
        text(`${index + 1}. ${term}`, margin + 5, y + 14 + index * 4, 8);
      });

      y += 36;
      checkPage(28);

      rightText("For Novaprime Engineering", pageWidth - margin, y, 9);
      rightText("Authorized Signatory", pageWidth - margin, y + 24, 9, true);

      const fileName = `${quoteNo || "quotation"}.pdf`;

      if (Capacitor.isNativePlatform()) {
        const base64Data = pdf.output("datauristring").split(",")[1];

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: fileName,
          text: `Quotation ${quoteNo || ""} - Novaprime Engineering`,
          url: savedFile.uri,
          dialogTitle: "Share Quotation PDF",
        });
      } else {
        pdf.save(fileName);

        const blob = pdf.output("blob");
        const url = URL.createObjectURL(blob);
        setPdfFileName(fileName);
        setPdfUrl(url);
      }
    } catch (error) {
      console.error("PDF generate error:", error);
      alert("PDF generate failed. Please try again.");
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const sendWhatsApp = () => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanPhone) {
      alert("Please enter customer phone number first.");
      return;
    }

    const message = `Quotation ${quoteNo}
Customer: ${customerName || "-"}
Amount: ₹${roundedTotal.toLocaleString("en-IN")}
From: Novaprime Engineering`;

    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(url, "_blank");
  };

  const convertToInvoice = () => {
    router.push("/invoices/create");
  };

  const saveQuotation = async () => {
    try {
      const validItems = items
        .filter((item) => item.product.trim() !== "")
        .map((item) => ({
          ...item,
          amount: item.qty * item.rate,
        }));

      if (validItems.length === 0) {
        alert("Please select at least one product.");
        return;
      }

      await axios.post(`${API_BASE}/invoices`, {
        invoiceNo: quoteNo,
        invoiceDate: quoteDate,
        dueDate: validTill,

        customerName,
        phone,
        email,

        billGstin: gstin,
        billState: billGstInfo?.state || "",
        billStateCode: billGstInfo?.code || "",
        billingAddress,

        shipName: sameAddress ? customerName : shipName,
        shipPhone: sameAddress ? phone : shipPhone,
        shipGstin: sameAddress ? gstin : shipGstin,
        shipState: sameAddress ? billGstInfo?.state || "" : shipGstInfo?.state || "",
        shipStateCode: sameAddress ? billGstInfo?.code || "" : shipGstInfo?.code || "",
        shippingAddress: sameAddress ? billingAddress : shipAddress,

        items: validItems,

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

        status: "Pending",
      });

      alert("Quotation saved successfully");

      const randomNo = Math.floor(1000 + Math.random() * 9000);
      setQuoteNo(`QTN-2026-${randomNo}`);
    } catch (error) {
      console.error("Save quotation error:", error);
      alert("Quotation save failed. Same quotation number already saved ho sakta hai.");
    }
  };

  const addItem = () => {
    setItems([...items, { product: "", hsn: "", qty: 1, rate: 0, gst: 18 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

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

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 no-print">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Create Quotation
            </h1>
            <p className="text-slate-500">
              Premium GST quotation for Novaprime Engineering.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={generatePDF}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
            >
              <Download className="mr-2 h-4 w-4" />
              {isPdfGenerating ? "Creating PDF..." : "PDF"}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
            >
              Print
            </button>

            <Button type="button" onClick={sendWhatsApp}>
              <Send className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>

          {pdfUrl && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 md:min-w-[280px]">
              <p className="mb-2 font-semibold">PDF ready: {pdfFileName}</p>
              <a
                id="download-ready-pdf-link"
                href={pdfUrl}
                download={pdfFileName}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
              >
                Download PDF
              </a>
            </div>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Bill To</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input className="rounded-xl border p-3" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  <input className="rounded-xl border p-3" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <input className="rounded-xl border p-3" placeholder="GSTIN e.g. 27ABCDE1234F1Z5" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} />
                  <input className="rounded-xl border bg-slate-100 p-3" placeholder="State" value={billGstInfo?.state || ""} readOnly />
                  <input className="rounded-xl border bg-slate-100 p-3" placeholder="State Code" value={billGstInfo?.code || ""} readOnly />
                  <input className="rounded-xl border p-3" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <textarea className="rounded-xl border p-3 md:col-span-2" placeholder="Billing Address" rows={3} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold">Ship To</h2>
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={sameAddress} onChange={(e) => setSameAddress(e.target.checked)} />
                    Same as Bill To
                  </label>
                </div>

                {!sameAddress ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input className="rounded-xl border p-3" placeholder="Site / Company Name" value={shipName} onChange={(e) => setShipName(e.target.value)} />
                    <input className="rounded-xl border p-3" placeholder="Contact Person" value={shipContact} onChange={(e) => setShipContact(e.target.value)} />
                    <input className="rounded-xl border p-3" placeholder="Phone Number" value={shipPhone} onChange={(e) => setShipPhone(e.target.value)} />
                    <input className="rounded-xl border p-3" placeholder="Ship To GSTIN" value={shipGstin} onChange={(e) => setShipGstin(e.target.value.toUpperCase())} />
                    <input className="rounded-xl border bg-slate-100 p-3" placeholder="Ship To State" value={shipGstInfo?.state || ""} readOnly />
                    <input className="rounded-xl border bg-slate-100 p-3" placeholder="Ship To State Code" value={shipGstInfo?.code || ""} readOnly />
                    <input className="rounded-xl border p-3 md:col-span-2" placeholder="Delivery Location" value={deliveryLocation} onChange={(e) => setDeliveryLocation(e.target.value)} />
                    <textarea className="rounded-xl border p-3 md:col-span-2" placeholder="Shipping Address" rows={3} value={shipAddress} onChange={(e) => setShipAddress(e.target.value)} />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
                    Shipping address will be same as billing address.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <h2 className="mb-2 text-xl font-semibold">Items</h2>

                {products.length === 0 && (
                  <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                    Products load nahi hue. Backend/product API check karo.
                  </div>
                )}

                <div className="mobile-scroll rounded-2xl border">
                  <table className="min-w-[900px] w-full text-sm">
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
                              <select className="w-full rounded-lg border p-2" value={item.product} onChange={(e) => updateProduct(index, e.target.value)}>
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                  <option key={product._id} value={product.name}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-3">
                              <input className="w-24 rounded-lg border p-2" value={item.hsn} onChange={(e) => updateItem(index, "hsn", e.target.value)} />
                            </td>

                            <td className="p-3 text-center">
                              <input type="number" className="w-20 rounded-lg border p-2 text-center" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} />
                            </td>

                            <td className="p-3 text-center">
                              <input type="number" className="w-28 rounded-lg border p-2 text-center" value={item.rate} onChange={(e) => updateItem(index, "rate", e.target.value)} />
                            </td>

                            <td className="p-3 text-center">
                              <input type="number" className="w-20 rounded-lg border p-2 text-center" value={item.gst} onChange={(e) => updateItem(index, "gst", e.target.value)} />
                            </td>

                            <td className="p-3 text-right font-semibold">
                              ₹{amount.toLocaleString("en-IN")}
                            </td>

                            <td className="p-3 text-center">
                              <button type="button" onClick={() => removeItem(index)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <button type="button" onClick={addItem} className="mt-4 flex items-center text-sm font-medium text-blue-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">Quotation Info</h2>
                </div>

                <div className="space-y-4">
                  <input className="w-full rounded-xl border p-3" value={quoteNo} onChange={(e) => setQuoteNo(e.target.value)} />
                  <input type="date" className="w-full rounded-xl border p-3" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
                  <input type="date" className="w-full rounded-xl border p-3" value={validTill} onChange={(e) => setValidTill(e.target.value)} />
                  <input className="w-full rounded-xl border p-3" value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <h2 className="mb-5 text-xl font-semibold">Charges</h2>

                <div className="space-y-3">
                  <input type="number" className="w-full rounded-xl border p-3" placeholder="Discount %" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                  <input type="number" className="w-full rounded-xl border p-3" placeholder="Freight Charges" value={freight} onChange={(e) => setFreight(Number(e.target.value))} />
                  <input type="number" className="w-full rounded-xl border p-3" placeholder="Loading Charges" value={loading} onChange={(e) => setLoading(Number(e.target.value))} />
                  <input type="number" className="w-full rounded-xl border p-3" placeholder="Packing Charges" value={packing} onChange={(e) => setPacking(Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <h2 className="mb-5 text-xl font-semibold">Summary</h2>

                <div className="space-y-4 text-sm">
                  <Summary label="Subtotal" value={subtotal} />
                  <Summary label="Discount" value={discountAmount} minus />
                  <Summary label="Freight" value={freight} />
                  <Summary label="Loading" value={loading} />
                  <Summary label="Packing" value={packing} />

                  {isInterState ? (
                    <Summary label="IGST" value={igst} />
                  ) : (
                    <>
                      <Summary label="CGST" value={cgst} />
                      <Summary label="SGST" value={sgst} />
                    </>
                  )}

                  <Summary label="Round Off" value={roundOff} />

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
                  <Button type="button" className="w-full" onClick={saveQuotation}>
                    Save Quotation
                  </Button>

                  <button
                    type="button"
                    onClick={generatePDF}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
                  >
                    {isPdfGenerating ? "Creating PDF..." : "PDF"}
                  </button>

                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={pdfFileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Download PDF
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 active:scale-[0.98]"
                  >
                    Print
                  </button>

                  <Button type="button" variant="outline" className="w-full" onClick={convertToInvoice}>
                    Convert To Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardContent className="p-4 md:p-6">
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

      <div id="quotation-pdf-area" className="pdf-area">
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
              <h2 className="text-4xl font-light text-blue-700">QUOTATION</h2>
              <p className="mt-3 font-semibold">{quoteNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><b>Quotation Date:</b> {quoteDate || "-"}</p>
            <p><b>Valid Till:</b> {validTill || "-"}</p>
            <p><b>Sales Person:</b> {salesPerson}</p>
            <p><b>Place of Supply:</b> {placeOfSupplyState || "-"} ({placeOfSupplyCode || "-"})</p>
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
              {items.filter((item) => item.product.trim() !== "").map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{item.product || "-"}</td>
                  <td className="border p-2">{item.hsn || "-"}</td>
                  <td className="border p-2">{item.qty}</td>
                  <td className="border p-2">₹{item.rate.toLocaleString("en-IN")}</td>
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

              <h3 className="mt-4 mb-2 font-bold text-blue-700">Bank Details</h3>
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

      <style jsx global>{`
        .mobile-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .pdf-area {
          display: none;
          background: white;
        }

        .a4-page {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          margin: 0 auto;
          background: white;
          color: #0f172a;
          font-size: 12px;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .pdf-area {
            display: block !important;
          }

          body {
            background: white !important;
          }

          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}

function Summary({
  label,
  value,
  minus,
}: {
  label: string;
  value: number;
  minus?: boolean;
}) {
  return (
    <div className="flex justify-between border-b py-1">
      <span>{label}</span>
      <b>
        {minus ? "- " : ""}₹{(value || 0).toLocaleString("en-IN")}
      </b>
    </div>
  );
}
