"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
children: React.ReactNode;
}

export default function DashboardLayout({
children,
}: DashboardLayoutProps) {
const [sidebarOpen, setSidebarOpen] = useState(false);

return ( <div className="min-h-screen w-full bg-slate-50">
{/* Mobile Menu Button */}
<button
type="button"
onClick={() => setSidebarOpen(true)}
className="fixed left-3 top-3 z-[100000] flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xl lg:hidden"
> <Menu className="h-7 w-7" /> </button>

  {/* Mobile Overlay */}
  {sidebarOpen && (
    <div
      className="fixed inset-0 z-[99998] bg-black/50 lg:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  )}

  {/* Sidebar */}
  <aside
    className={`fixed left-0 top-0 z-[99999] h-screen w-72 bg-slate-950 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <Sidebar onClose={() => setSidebarOpen(false)} />
  </aside>

  {/* Main Content */}
  <div className="min-h-screen w-full lg:ml-72 lg:w-[calc(100%-18rem)]">
    <Header />

    <main className="w-full max-w-full overflow-x-auto p-4 md:p-6">
      {children}
    </main>
  </div>
</div>


);
}
