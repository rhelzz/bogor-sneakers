"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Search, ChevronDown, Palette, Star } from "lucide-react";
import GymShoePreview from "@/components/GymShoePreview";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Running", "Casual", "Sports", "Limited"];

const PRODUCTS = [
  { id: 1, name: "Apex Runner Pro", category: "Running", price: 1_250_000, color: "#4f46e5", tag: "New" },
  { id: 2, name: "Urban Stride", category: "Casual", price: 899_000, color: "#0ea5e9", tag: null },
  { id: 3, name: "FlexCore Sport", category: "Sports", price: 1_099_000, color: "#10b981", tag: "Sale" },
  { id: 4, name: "CloudStep Lite", category: "Casual", price: 750_000, color: "#f59e0b", tag: null },
  { id: 5, name: "Track Elite X", category: "Running", price: 1_450_000, color: "#ef4444", tag: "Limited" },
  { id: 6, name: "Night Court", category: "Sports", price: 980_000, color: "#8b5cf6", tag: null },
  { id: 7, name: "Drift Canvas", category: "Casual", price: 620_000, color: "#f97316", tag: "New" },
  { id: 8, name: "Summit Hike GTX", category: "Sports", price: 1_599_000, color: "#06b6d4", tag: null },
  { id: 9, name: "Sprint Zero", category: "Running", price: 1_180_000, color: "#ec4899", tag: null },
  { id: 10, name: "Neon Blaze", category: "Limited", price: 2_200_000, color: "#84cc16", tag: "Limited" },
  { id: 11, name: "Coastal Walk", category: "Casual", price: 540_000, color: "#14b8a6", tag: null },
  { id: 12, name: "Iron Sole", category: "Sports", price: 1_300_000, color: "#6366f1", tag: "Sale" },
];

const TAG_COLORS: Record<string, string> = {
  New: "bg-indigo-100 text-indigo-700",
  Sale: "bg-rose-100 text-rose-700",
  Limited: "bg-amber-100 text-amber-700",
};

const SORT_OPTIONS = ["Featured", "Price: Low to High", "Price: High to Low", "Newest"];

// ─── Shoe SVG Thumbnail ───────────────────────────────────────────────────────
function ShoeThumbnail({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 120" fill="none" className="w-full" aria-hidden="true">
      {/* Shadow */}
      <ellipse cx="100" cy="110" rx="75" ry="8" fill="black" fillOpacity="0.06" />
      {/* Sole */}
      <path d="M20 90 Q100 100 180 90 L175 100 Q100 112 25 100 Z" fill="#1f2937" />
      {/* Midsole */}
      <path d="M22 82 Q100 94 178 82 L175 92 Q100 102 25 92 Z" fill="#e5e7eb" />
      {/* Upper body */}
      <path d="M40 82 Q55 45 100 40 Q145 35 160 82 Z" fill={color} />
      {/* Toe box */}
      <path d="M40 82 Q30 65 50 52 Q65 42 85 40 Q55 50 50 70 Z" fill={color} style={{ filter: "brightness(0.85)" }} />
      {/* Heel */}
      <path d="M145 82 Q165 70 158 52 Q148 42 130 40 Q155 48 155 72 Z" fill={color} style={{ filter: "brightness(0.9)" }} />
      {/* Lace area */}
      <path d="M75 42 Q100 36 125 42 L120 55 Q100 50 80 55 Z" fill="white" fillOpacity="0.35" />
      {/* Laces */}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={82 + i * 6} y1={44 + i * 4} x2={118 - i * 6} y2={44 + i * 4} stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
      ))}
    </svg>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: (typeof PRODUCTS)[0] }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:ring-indigo-200 transition-shadow"
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-gray-50 px-4 pt-5 pb-2">
        <ShoeThumbnail color={product.color} />
        {product.tag && (
          <span className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TAG_COLORS[product.tag]}`}>
            {product.tag}
          </span>
        )}
        {/* Hover: Customize CTA */}
        <Link
          href={`/customize?product=${product.id}`}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-indigo-600/80 text-sm font-semibold text-white opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100"
        >
          Customize →
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-3 pb-4 pt-2">
        <p className="truncate text-xs font-medium text-gray-400 uppercase tracking-wide">{product.category}</p>
        <h3 className="truncate text-sm font-semibold text-gray-900 md:text-base">{product.name}</h3>
        <p className="mt-1 text-sm font-bold text-indigo-600 md:text-base">
          Rp {product.price.toLocaleString("id-ID")}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  return (
    <div className="jp-theme mx-auto max-w-7xl px-4 pb-6 md:px-6 md:py-10">
      {/* Header — hidden on mobile, shown on desktop */}
      <div className="hidden md:block mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Shoe Catalog
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Temukan sepatu sempurna untukmu — atau{" "}
          <Link href="/customize" className="text-indigo-600 underline underline-offset-2">
            desain sendiri
          </Link>
          .
        </p>
      </div>

      {/* ── Sticky Search + Category bar ───────────────────────────────── */}
      {/* Sticks to top on mobile (top-0), below navbar on desktop (md:top-14) */}
      <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 pt-3 pb-3 backdrop-blur-sm shadow-sm md:-mx-6 md:px-6 md:top-14">
        {/* Search + Filter row */}
        <div className="mb-3 flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari sepatu..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Sort (desktop) */}
          <div className="relative hidden md:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {SORT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700"
          >
            <SlidersHorizontal size={15} />
            Filter
          </button>
        </div>

        {/* Category chips — horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-indigo-300 hover:text-indigo-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer so content doesn't sit flush after sticky bar */}
      <div className="mt-5" />

      {/* ── Featured Hero Product (Johnny Classic Gym Sneaker) ───────── */}
      {(activeCategory === "All" || activeCategory === "Limited") && searchQuery === "" && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mb-8 overflow-hidden rounded-3xl border border-washi/10 bg-linear-to-r from-kuro via-sumi to-usuzumi shadow-xl"
        >
          <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:gap-10 md:p-8">
            {/* Shoe illustration */}
            <div className="w-full max-w-60 shrink-0 md:max-w-xs">
              <GymShoePreview
                upperColor="#FFFFFF"
                soleColor="#B0B6BB"
                className="w-full drop-shadow-2xl"
              />
            </div>

            {/* Product info */}
            <div className="flex flex-col">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-bold text-yellow-900">
                  ⭐ Featured
                </span>
                <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-white">
                  Limited Edition
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-white md:text-3xl">
                Johnny Classic<br />
                <span className="text-matcha">Gym Sneaker</span>
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-washi/75">
                Desain ikonik dengan siluet atletis klasik. Tersedia dalam format custom — pilih warna upper dan sole sesuai style-mu.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-washi/55">4.9 (128 ulasan)</span>
              </div>

              <p className="mt-4 text-2xl font-black text-white">
                Rp 1.850.000
                <span className="ml-2 text-sm font-normal text-washi/45 line-through">Rp 2.200.000</span>
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/customize"
                  className="flex items-center gap-2 rounded-2xl bg-matcha px-5 py-3 text-sm font-bold text-washi shadow-lg transition-colors hover:bg-take"
                  style={{ touchAction: "manipulation" }}
                >
                  <Palette size={16} /> Kustomisasi Warna
                </Link>
                <button
                  className="flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                  style={{ touchAction: "manipulation" }}
                >
                  Tambah ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Product grid — 2 cols mobile, 4 cols md, 5 cols lg */}
      <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5 lg:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-16 text-center text-gray-400"
            >
              Tidak ada produk yang cocok.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white p-6 pb-10 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filter & Sort</h2>
                <button onClick={() => setFiltersOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Urutkan</p>
              <div className="mb-6 flex flex-col gap-2">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => { setSortBy(o); setFiltersOpen(false); }}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-medium ${
                      sortBy === o ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white"
              >
                Terapkan
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
