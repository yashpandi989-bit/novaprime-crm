"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Receipt,
  Warehouse,
  Wallet,
  BarChart3,
  Settings,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Customers", icon: Users, href: "/customers" },
  { name: "Products", icon: Package, href: "/products" },
  { name: "Quotations", icon: FileText, href: "/quotations" },
  { name: "Proforma Invoice", icon: FileText, href: "/proforma-invoice" },
  { name: "Invoices", icon: Receipt, href: "/invoices" },
  { name: "Inventory", icon: Warehouse, href: "/inventory" },
  { name: "Payments", icon: Wallet, href: "/payments" },
  { name: "Reports", icon: BarChart3, href: "/reports" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-full w-full overflow-y-auto bg-slate-950 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 p-5">
        <div>
          <h1 className="text-xl font-bold">NOVAPRIME</h1>
          <p className="text-xs text-slate-400">Engineering CRM</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          onTouchStart={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-2 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-800 active:bg-slate-700"
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
