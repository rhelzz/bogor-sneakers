"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ShoppingCart, ChevronDown, Search, User } from "lucide-react";

const catalogDropdown = [
  { label: "All Shoes", href: "/catalog" },
  { label: "Running", href: "/catalog?category=running" },
  { label: "Casual", href: "/catalog?category=casual" },
  { label: "Sports", href: "/catalog?category=sports" },
];

const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.13 } },
};

export default function TopNavbar() {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const pathname = usePathname();

  const navItemClass = "font-zen rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors";

  return (
    <header className="fixed top-0 z-50 hidden w-full border-b border-sumi/10 bg-washi/95 shadow-sm backdrop-blur-md md:flex">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <span className="font-zen text-2xl font-black tracking-tight text-sumi">
            BOGOR<span className="text-matcha">SNEAKERS</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <ul className="flex items-center gap-6 font-medium text-usuzumi">
          <li>
            <Link
              href="/"
              className={`${navItemClass} ${pathname === "/" ? "bg-sumi text-washi" : "hover:bg-sumi/5 hover:text-sumi"}`}
            >
              Home
            </Link>
          </li>

          {/* Catalog with Dropdown */}
          <li
            className="relative"
            onMouseEnter={() => setCatalogOpen(true)}
            onMouseLeave={() => setCatalogOpen(false)}
          >
            <button
              className={`${navItemClass} flex items-center gap-1 ${pathname.startsWith("/catalog") ? "bg-sumi text-washi" : "hover:bg-sumi/5 hover:text-sumi"}`}
              aria-expanded={catalogOpen}
              aria-haspopup="true"
            >
              Catalog
              <motion.span
                animate={{ rotate: catalogOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} />
              </motion.span>
            </button>

            <AnimatePresence>
              {catalogOpen && (
                <motion.ul
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-sumi/10 bg-washi py-2 shadow-xl"
                >
                  {catalogDropdown.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="block px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-usuzumi transition-colors hover:bg-sumi/5 hover:text-sumi"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>

          <li>
            <Link
              href="/customize"
              className={`${navItemClass} ${pathname.startsWith("/customize") ? "bg-sumi text-washi" : "hover:bg-sumi/5 hover:text-sumi"}`}
            >
              Design Studio
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              className={`${navItemClass} ${pathname.startsWith("/about") ? "bg-sumi text-washi" : "hover:bg-sumi/5 hover:text-sumi"}`}
            >
              About
            </Link>
          </li>
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-2 text-usuzumi">
          <button
            className="rounded-full p-2.5 transition-colors hover:bg-sumi/5 hover:text-sumi"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            className="rounded-full p-2.5 transition-colors hover:bg-sumi/5 hover:text-sumi"
            aria-label="Account"
          >
            <User size={20} />
          </button>
          <Link
            href="/cart"
            className="relative rounded-full p-2.5 transition-colors hover:bg-sumi/5 hover:text-sumi"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-matcha text-[10px] font-bold text-washi">
              3
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
