"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Grid2X2, Palette, ShoppingCart, User } from "lucide-react";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Catalog", href: "/catalog", icon: Grid2X2 },
  { label: "Design", href: "/customize", icon: Palette },
  { label: "Cart", href: "/cart", icon: ShoppingCart, badge: 3 },
  { label: "Profile", href: "/profile", icon: User },
];

export default function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    <nav
      className="safe-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-sumi/10 bg-washi/95 shadow-[0_-10px_28px_rgba(20,20,20,0.12)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around px-1 py-1.5">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors"
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator pill */}
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 rounded-xl bg-sumi/5"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <span className="relative flex items-center justify-center">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? "text-sumi" : "text-hai"}
                  />
                  {/* Badge */}
                  {badge != null && (
                    <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-matcha text-[9px] font-bold text-washi">
                      {badge}
                    </span>
                  )}
                </span>

                <span
                  className={`relative text-[10px] font-medium uppercase tracking-[0.12em] leading-none ${
                    isActive ? "text-sumi" : "text-hai"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
