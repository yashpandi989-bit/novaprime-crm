"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    const q = search.toLowerCase().trim();

    if (!q) return;

    let path = "/";

    if (q.includes("customer")) path = "/customers";
    else if (q.includes("product")) path = "/products";
    else if (q.includes("invoice")) path = "/invoices";
    else if (q.includes("quotation")) path = "/quotations";
    else if (q.includes("proforma")) path = "/proforma-invoice";
    else if (q.includes("inventory")) path = "/inventory";
    else if (q.includes("payment")) path = "/payments";
    else if (q.includes("report")) path = "/reports";

    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-[9000] flex items-center gap-2 border-b bg-white px-3 py-3 pl-16 shadow-sm lg:pl-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative flex-1"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers, products, invoices..."
          className="h-12 w-full rounded-xl border bg-slate-50 pl-10 pr-3 text-sm outline-none"
        />
      </form>

      <button
        type="button"
        onClick={handleSearch}
        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Go
      </button>

      <Bell className="hidden h-5 w-5 shrink-0 sm:block" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  );
}