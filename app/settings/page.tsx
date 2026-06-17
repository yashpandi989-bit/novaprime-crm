"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Building2,
  Landmark,
  FileText,
  Shield,
  Palette,
  MessageCircle,
  Database,
  Save,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SettingsData = {
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  website: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  upiId: string;
  invoicePrefix: string;
  quotationPrefix: string;
  proformaPrefix: string;
  defaultGst: string;
  terms: string;
  whatsappNumber: string;
  whatsappMessage: string;
  themeColor: string;
  footerText: string;
  sessionDays: string;
};

const defaultSettings: SettingsData = {
  companyName: "Novaprime Engineering",
  ownerName: "",
  email: "novaprimeengineering@gmail.com",
  phone: "",
  gstNumber: "",
  panNumber: "",
  address: "Mumbai, Maharashtra",
  website: "",
  bankName: "AXIS BANK",
  accountNumber: "926020011347605",
  ifsc: "UTIB0000341",
  branch: "SHIVAJI PARK, MUMBAI",
  upiId: "",
  invoicePrefix: "INV-",
  quotationPrefix: "QTN-",
  proformaPrefix: "PFI-",
  defaultGst: "18",
  terms:
    "Payment: 100% advance.\nDelivery: As per stock availability.\nGST and transport charges extra if applicable.\nMaterial once sold will not be taken back.",
  whatsappNumber: "",
  whatsappMessage: "Hello, please find your invoice from Novaprime Engineering.",
  themeColor: "blue",
  footerText: "Thank you for your business.",
  sessionDays: "7",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem("crm_settings");

    if (saved) {
      setSettings({
        ...defaultSettings,
        ...JSON.parse(saved),
      });
    }
  }, []);

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem("crm_settings", JSON.stringify(settings));
    alert("Settings saved successfully");
  };

  const exportSettings = () => {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "novaprime-crm-settings.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">
            Manage company profile, invoice, bank and security settings.
          </p>
        </div>

        <Button onClick={saveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Company Profile" icon={<Building2 />}>
          <Input label="Company Name" value={settings.companyName} onChange={(v) => handleChange("companyName", v)} />
          <Input label="Owner Name" value={settings.ownerName} onChange={(v) => handleChange("ownerName", v)} />
          <Input label="Email" value={settings.email} onChange={(v) => handleChange("email", v)} />
          <Input label="Phone" value={settings.phone} onChange={(v) => handleChange("phone", v)} />
          <Input label="GST Number" value={settings.gstNumber} onChange={(v) => handleChange("gstNumber", v)} />
          <Input label="PAN Number" value={settings.panNumber} onChange={(v) => handleChange("panNumber", v)} />
          <Textarea label="Address" value={settings.address} onChange={(v) => handleChange("address", v)} />
          <Input label="Website" value={settings.website} onChange={(v) => handleChange("website", v)} />
        </Section>

        <Section title="Bank Details" icon={<Landmark />}>
          <Input label="Bank Name" value={settings.bankName} onChange={(v) => handleChange("bankName", v)} />
          <Input label="Account Number" value={settings.accountNumber} onChange={(v) => handleChange("accountNumber", v)} />
          <Input label="IFSC Code" value={settings.ifsc} onChange={(v) => handleChange("ifsc", v)} />
          <Input label="Branch" value={settings.branch} onChange={(v) => handleChange("branch", v)} />
          <Input label="UPI ID" value={settings.upiId} onChange={(v) => handleChange("upiId", v)} />
        </Section>

        <Section title="Invoice Settings" icon={<FileText />}>
          <Input label="Invoice Prefix" value={settings.invoicePrefix} onChange={(v) => handleChange("invoicePrefix", v)} />
          <Input label="Quotation Prefix" value={settings.quotationPrefix} onChange={(v) => handleChange("quotationPrefix", v)} />
          <Input label="Proforma Prefix" value={settings.proformaPrefix} onChange={(v) => handleChange("proformaPrefix", v)} />
          <Input label="Default GST %" value={settings.defaultGst} onChange={(v) => handleChange("defaultGst", v)} />
          <Textarea label="Default Terms & Conditions" value={settings.terms} onChange={(v) => handleChange("terms", v)} />
        </Section>

        <Section title="Security" icon={<Shield />}>
          <Input label="Session Expiry Days" value={settings.sessionDays} onChange={(v) => handleChange("sessionDays", v)} />
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout Current Device
          </Button>
        </Section>

        <Section title="WhatsApp Settings" icon={<MessageCircle />}>
          <Input label="WhatsApp Number" value={settings.whatsappNumber} onChange={(v) => handleChange("whatsappNumber", v)} />
          <Textarea label="Default WhatsApp Message" value={settings.whatsappMessage} onChange={(v) => handleChange("whatsappMessage", v)} />
        </Section>

        <Section title="Branding" icon={<Palette />}>
          <Input label="Theme Color" value={settings.themeColor} onChange={(v) => handleChange("themeColor", v)} />
          <Textarea label="PDF Footer Text" value={settings.footerText} onChange={(v) => handleChange("footerText", v)} />
        </Section>

        <Section title="Backup & Restore" icon={<Database />}>
          <Button onClick={exportSettings}>Export Settings</Button>
          <p className="text-sm text-slate-500">
            Database backup/export feature can be connected later with backend.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-3xl border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            {icon}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <div className="grid gap-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border bg-slate-50 p-3 outline-none"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border bg-slate-50 p-3 outline-none"
      />
    </label>
  );
}