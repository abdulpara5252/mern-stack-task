"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import seedDatabase from "@/utils/seeding/seedDatabase";

export default function NavMenu() {
  const pathname = usePathname();

  const navItems = [
    { href: "/products", label: "Products", icon: "🛍️" },
    { href: "/products/add", label: "Add Product", icon: "➕" },
    { href: "/categories", label: "Categories", icon: "📂" },
    { href: "/brands", label: "Brands", icon: "🏷️" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/products" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              🛒 ProductHub
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center">
            {/* <span className="text-sm text-gray-600 font-medium">Product Management System</span> */}
          </div>
        </div>
            {/* mobile view */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                  pathname === item.href
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
