"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  UserCog,
  X,
  Globe,
} from "lucide-react";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: "/dashboard/vehicles",
    label: "Vehicles",
    icon: <Car className="h-5 w-5" />,
  },
  {
    href: "/dashboard/sales",
    label: "Sales",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    href: "/dashboard/customers",
    label: "Customers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: "/dashboard/market",
    label: "Market Listings",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    href: "/dashboard/settings/users",
    label: "Users",
    icon: <UserCog className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    adminOnly: true,
  },
];

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "ADMIN"
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-slate-900 text-slate-100 z-50 flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Car Gallery</p>
              <p className="text-xs text-slate-400">Management Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                role === "ADMIN" ? "bg-green-400" : "bg-blue-400"
              )}
            />
            {role === "ADMIN" ? "Administrator" : "Sales Representative"}
          </div>
        </div>
      </aside>
    </>
  );
}
