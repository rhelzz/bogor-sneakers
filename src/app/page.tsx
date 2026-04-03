"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  Check,
  ChevronRight,
  Clock3,
  Grid3X3,
  Image as ImageIcon,
  Menu,
  MessageCircle,
  Package,
  Play,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import GymShoePreview from "@/components/GymShoePreview";

type PanelState = "catalog" | "contact" | "order" | null;

const NAV_ITEMS = [
  { id: "hero", label: "Home" },
  { id: "po-tracker", label: "Live PO" },
  { id: "katalog", label: "Katalog" },
  { id: "tiktok", label: "TikTok" },
  { id: "how-it-works", label: "Alur" },
  { id: "galeri", label: "DIY" },
];

const PANEL_PRODUCTS = [
  { name: "Nike Air Max 97 Silver", size: "Sz. 39-44", brand: "nike", status: "PO", price: "Rp 1.850K" },
  { name: "Adidas Samba OG White", size: "Sz. 39-43", brand: "adidas", status: "Ready", price: "Rp 1.290K" },
  { name: "Jordan 1 Retro High Bred", size: "Sz. 40-45", brand: "jordan", status: "PO", price: "Rp 2.100K" },
  { name: "Nike Dunk Low Panda", size: "Sz. 40-45", brand: "nike", status: "Habis", price: "Rp 1.650K" },
  { name: "New Balance 574 Navy", size: "Sz. 39-44", brand: "nb", status: "Ready", price: "Rp 980K" },
];

const KATALOG_PRODUCTS = [
  { name: "Nike Air Max 97 Silver", size: "Sz. 39-44", brand: "nike", status: "PO", price: "Rp 1.850K" },
  { name: "Adidas Samba OG White", size: "Sz. 39-43", brand: "adidas", status: "Ready", price: "Rp 1.290K" },
  { name: "Jordan 1 Retro High Bred", size: "Sz. 40-45", brand: "jordan", status: "PO", price: "Rp 2.100K" },
  { name: "New Balance 574 Navy", size: "Sz. 39-44", brand: "nb", status: "Ready", price: "Rp 980K" },
  { name: "Nike Dunk Low Panda", size: "Sz. 40-45", brand: "nike", status: "Habis", price: "Rp 1.650K" },
  { name: "Adidas Forum Low", size: "Sz. 39-43", brand: "adidas", status: "Ready", price: "Rp 1.100K" },
  { name: "Ventela Classic White", size: "Sz. 39-44", brand: "lokal", status: "Ready", price: "Rp 420K" },
  { name: "Jordan 4 Retro Black Cat", size: "Sz. 41-45", brand: "jordan", status: "PO", price: "Rp 2.450K" },
];

const ORDER_ITEMS = [
  { code: "#BGS-2841", product: "Nike Air Max 97 Silver - Sz. 42", status: "Produksi", progress: 55 },
  { code: "#BGS-2790", product: "Adidas Samba OG White - Sz. 40", status: "Dikirim", progress: 85 },
  { code: "#BGS-2755", product: "Jordan 1 Retro High Bred - Sz. 43", status: "Selesai", progress: 100 },
  { code: "#BGS-2870", product: "NB 574 Navy - Sz. 41", status: "Menunggu", progress: 10 },
];

const PRESETS = ["street", "vintage", "minimal", "hype", "sport"];

const TIKTOK_CARDS = [
  { product: "Nike Air Max 97 Silver", price: "Rp 1.850.000", caption: "Unboxing Nike AM97 Silver Bullet", likes: "12.4K" },
  { product: "Adidas Samba OG", price: "Rp 1.290.000", caption: "Review Adidas Samba OG White", likes: "8.1K" },
  { product: "Jordan 1 Retro High", price: "Rp 2.100.000", caption: "Jordan 1 Bred masih #1", likes: "21.3K" },
  { product: "NB 574 Navy", price: "Rp 980.000", caption: "New Balance 574 Navy - klasik", likes: "5.6K" },
];

const HOW_IT_WORKS = [
  { title: "Pilih Produk", desc: "Browse katalog kami. Filter brand, size, dan warna sesuai selera.", icon: Grid3X3, color: "matcha" },
  { title: "DM / WA Kami", desc: "Hubungi via WhatsApp. Kami konfirmasi ketersediaan dengan cepat.", icon: MessageCircle, color: "indigo" },
  { title: "Transfer DP", desc: "Bayar DP 50% untuk konfirmasi slot PO ke rekening terverifikasi.", icon: Check, color: "take" },
  { title: "Terima Sepatu", desc: "Sepatu tiba, bayar sisa pelunasan, lalu nikmati pair barumu.", icon: Package, color: "sakura" },
];

const GALLERY_ITEMS = [
  "Air Max 97 x Bogor Streets",
  "Samba OG - Rain Session",
  "Jordan 1 Bred - Night Walk",
  "NB 574 Navy x Campus",
  "Vans Old Skool",
  "Converse Chuck 70",
  "Asics Gel-Kayano",
  "Puma RS-X Effekt",
];

function statusClasses(status: string) {
  if (status === "PO") return "bg-matcha/20 text-matcha";
  if (status === "Ready") return "bg-take/20 text-take";
  if (status === "Habis") return "bg-sumi/10 text-hai";
  return "bg-sumi/10 text-hai";
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelState>(null);
  const [panelFilter, setPanelFilter] = useState("all");
  const [katalogFilter, setKatalogFilter] = useState("all");
  const [activePreset, setActivePreset] = useState("street");
  const [activeSection, setActiveSection] = useState("hero");

  const filteredPanelProducts = useMemo(() => {
    if (panelFilter === "all") return PANEL_PRODUCTS;
    return PANEL_PRODUCTS.filter((item) => item.brand === panelFilter);
  }, [panelFilter]);

  const filteredKatalogProducts = useMemo(() => {
    if (katalogFilter === "all") return KATALOG_PRODUCTS;
    return KATALOG_PRODUCTS.filter((item) => item.brand === katalogFilter);
  }, [katalogFilter]);

  useEffect(() => {
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    const sectionElements = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (node): node is HTMLElement => Boolean(node)
    );

    const updateSection = () => {
      const scrollY = window.scrollY + 140;
      let current = "hero";

      for (const section of sectionElements) {
        if (scrollY >= section.offsetTop) {
          current = section.id;
        }
      }

      setActiveSection(current);
    };

    updateSection();
    window.addEventListener("scroll", updateSection, { passive: true });
    return () => window.removeEventListener("scroll", updateSection);
  }, []);

  const togglePanel = (panel: Exclude<PanelState, null>) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="bg-washi text-sumi font-zen antialiased">
      {/* Floating Controls */}
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="fixed left-4 top-24 z-50 flex items-center gap-2 md:left-6"
        aria-label="Toggle quick navigation"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sumi text-washi shadow-lg transition-colors hover:bg-usuzumi">
          {menuOpen ? <Menu size={18} /> : <X size={18} />}
        </span>
        <span className="hidden text-[10px] uppercase tracking-[0.22em] text-hai md:block">
          {menuOpen ? "Menu" : "Close"}
        </span>
      </button>

      <button
        onClick={() => togglePanel("catalog")}
        className="fixed right-4 top-24 z-50 flex items-center gap-2 md:right-6"
        aria-label="Open catalog panel"
      >
        <span className="hidden text-[10px] uppercase tracking-[0.22em] text-hai md:block">
          {activePanel === "catalog" ? "Close" : "Katalog"}
        </span>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sumi text-washi shadow-lg transition-colors hover:bg-usuzumi">
          {activePanel === "catalog" ? <X size={18} /> : <Grid3X3 size={18} />}
        </span>
      </button>

      <button
        onClick={() => togglePanel("contact")}
        className="fixed bottom-24 left-4 z-50 flex items-center gap-2 md:bottom-6 md:left-6"
        aria-label="Open contact panel"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-matcha text-washi shadow-lg transition-opacity hover:opacity-90">
          {activePanel === "contact" ? <X size={18} /> : <MessageCircle size={18} />}
        </span>
        <span className="hidden text-[10px] uppercase tracking-[0.22em] text-hai md:block">
          {activePanel === "contact" ? "Close" : "Admin"}
        </span>
      </button>

      <button
        onClick={() => togglePanel("order")}
        className="fixed bottom-24 right-4 z-50 flex items-center gap-2 md:bottom-6 md:right-6"
        aria-label="Open order panel"
      >
        <span className="hidden text-[10px] uppercase tracking-[0.22em] text-hai md:block">
          {activePanel === "order" ? "Close" : "Orders"}
        </span>
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-indigo text-washi shadow-lg transition-opacity hover:opacity-90">
          {activePanel === "order" ? <X size={18} /> : <Boxes size={18} />}
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-matcha animate-pulse-soft" />
        </span>
      </button>

      {/* Floating quick nav */}
      <nav
        className={`fixed left-1/2 top-24 z-40 hidden -translate-x-1/2 rounded-full border border-sumi/10 bg-washi/90 px-2 py-1.5 shadow-lg backdrop-blur-md lg:block ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors ${
                  active
                    ? "bg-sumi text-washi"
                    : "text-usuzumi hover:bg-sumi/5"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Catalog Panel */}
      <div className={`panel-slide fixed right-4 top-40 z-40 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-sumi/10 bg-washi shadow-2xl md:right-6 ${activePanel === "catalog" ? "open" : ""}`}>
        <div className="flex items-center justify-between border-b border-sumi/10 px-5 py-4">
          <h3 className="text-sm font-bold tracking-[0.2em]">KATALOG</h3>
          <span className="text-xs text-hai">{PANEL_PRODUCTS.length} produk</span>
        </div>
        <div className="scrollbar-none flex gap-2 overflow-x-auto border-b border-sumi/10 px-4 py-3">
          {[
            { id: "all", label: "Semua" },
            { id: "nike", label: "Nike" },
            { id: "adidas", label: "Adidas" },
            { id: "jordan", label: "Jordan" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setPanelFilter(filter.id)}
              className={`rounded-full px-3 py-1.5 text-xs tracking-wide transition-colors ${
                panelFilter === filter.id
                  ? "bg-sumi text-washi"
                  : "bg-sumi/5 text-usuzumi hover:bg-sumi/10"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filteredPanelProducts.map((item) => (
            <div key={item.name} className="flex cursor-pointer items-center gap-3 border-b border-sumi/5 px-4 py-3 transition-colors hover:bg-sumi/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sumi/5">
                <ImageIcon size={16} className="text-hai" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-hai">{item.size}</p>
              </div>
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${statusClasses(item.status)}`}>
                {item.status}
              </span>
              <span className="text-sm font-bold">{item.price}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-sumi/10 px-4 py-3 text-center">
          <a href="#katalog" className="text-xs uppercase tracking-[0.2em] text-indigo transition-colors hover:opacity-70">
            Lihat Semua Produk
          </a>
        </div>
      </div>

      {/* Contact Panel */}
      <div className={`panel-slide fixed bottom-40 left-4 z-40 w-[18rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-sumi/10 bg-washi shadow-2xl md:bottom-24 md:left-6 ${activePanel === "contact" ? "open" : ""}`}>
        <div className="border-b border-sumi/10 px-5 py-4">
          <h3 className="mb-1 text-sm font-bold tracking-[0.2em]">HUBUNGI ADMIN</h3>
          <p className="text-xs text-hai">Respon cepat via WhatsApp</p>
        </div>
        {[
          { name: "Rizky - Admin", role: "PO · Order · Ketersediaan", color: "bg-matcha/20 text-matcha" },
          { name: "Farhan - CS", role: "Komplain · Tracking · Retur", color: "bg-indigo/20 text-indigo" },
          { name: "Dinda - DIY", role: "Kustom · Desain · Konsultasi", color: "bg-sakura/30 text-sakura" },
        ].map((person) => (
          <a key={person.name} href="https://wa.me/6281234567890" target="_blank" className="flex items-center gap-3 border-b border-sumi/5 px-4 py-3 transition-colors hover:bg-sumi/5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${person.color}`}>
              {person.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{person.name}</p>
              <p className="text-xs text-hai">{person.role}</p>
            </div>
            <ChevronRight size={14} className="text-hai" />
          </a>
        ))}
      </div>

      {/* Order Panel */}
      <div className={`panel-slide fixed bottom-40 right-4 z-40 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-sumi/10 bg-washi shadow-2xl md:bottom-24 md:right-6 ${activePanel === "order" ? "open" : ""}`}>
        <div className="flex items-center justify-between border-b border-sumi/10 px-5 py-4">
          <h3 className="text-sm font-bold tracking-[0.2em]">ORDER TRACKER</h3>
          <div className="flex items-center gap-1.5 text-xs text-matcha">
            <span className="h-2 w-2 rounded-full bg-matcha animate-pulse-soft" />
            Live
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {ORDER_ITEMS.map((order) => (
            <div key={order.code} className="border-b border-sumi/5 px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-bold">{order.code}</span>
                <span className="rounded bg-sumi/10 px-2 py-0.5 text-[10px] text-hai">{order.status}</span>
              </div>
              <p className="mb-2 text-xs text-hai">{order.product}</p>
              <div className="h-1.5 overflow-hidden rounded-full bg-sumi/10">
                <div className="h-full rounded-full bg-sumi" style={{ width: `${order.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section id="hero" className="pattern-seigaiha relative flex min-h-[calc(100vh-5rem)] flex-col overflow-hidden lg:flex-row">
        <div className="relative z-10 flex w-full flex-col justify-center px-6 pb-16 pt-28 md:px-12 lg:w-1/2 lg:px-20">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-matcha animate-pulse-soft" />
            <span className="text-[11px] tracking-[0.2em] text-hai">EST. 2019 - BOGOR</span>
          </div>
          <p className="mb-3 text-xs tracking-[0.24em] text-hai">STORE_ID: BGS-001</p>
          <h1 className="font-zen text-4xl font-black leading-none tracking-tight md:text-6xl lg:text-7xl">
            BOGOR&apos;S
            <br />
            <span className="text-matcha">FINEST</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-usuzumi md:text-base">
            Sneaker culture meets street identity. Rare, local, and legit. Kurasi premium untuk komunitas Bogor.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[11px] tracking-[0.18em] text-hai">LOCATION</p>
              <p className="font-medium">Bogor, Jawa Barat</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.18em] text-hai">CATALOG</p>
              <p className="font-medium">240+ styles</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.18em] text-hai">STATUS</p>
              <p className="font-medium">Open 09:00-21:00</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.18em] text-hai">AUTH</p>
              <p className="font-medium">100% Legit</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <a href="#katalog" className="rounded-full bg-sumi px-6 py-3 text-xs uppercase tracking-[0.2em] text-washi transition-colors hover:bg-usuzumi">
              Lihat Katalog
            </a>
            <span className="flex items-center gap-1 text-xs text-hai">
              <ArrowDown size={14} /> Scroll untuk eksplor
            </span>
          </div>
        </div>

        <div className="pattern-asanoha relative flex w-full items-center justify-center bg-sumi px-6 py-20 lg:w-1/2">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-72 rounded-full border border-washi/10 animate-float" />
            <div className="absolute h-96 w-96 rounded-full border border-washi/5 animate-float" style={{ animationDelay: "1s" }} />
          </div>
          <div className="img-reveal animate-kenburns relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-linear-to-br from-kuro to-usuzumi p-8">
            <GymShoePreview upperColor="#d9d9d9" soleColor="#f5f5f0" className="w-full" />
            <div className="mt-6 rounded-2xl border border-washi/10 bg-washi/10 p-4 backdrop-blur-md">
              <p className="text-[10px] tracking-[0.2em] text-washi/60">FEATURED</p>
              <p className="text-lg font-bold text-washi">Nike Air Max 97</p>
              <p className="text-xs text-washi/60">Silver Bullet - Limited Edition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden bg-sumi py-3 text-washi">
        <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap pr-10 text-xs tracking-[0.24em]">
          {[
            "BOGORSNEAKERS",
            "BOGOR'S FINEST",
            "LEGIT VERIFIED",
            "EST. 2019",
            "RARE DROPS",
            "STREET CULTURE",
            "BOGORSNEAKERS",
            "BOGOR'S FINEST",
            "LEGIT VERIFIED",
            "EST. 2019",
          ].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-3">
              <span>{item}</span>
              <span className="text-matcha">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* PO Tracker */}
      <section id="po-tracker" className="bg-shironeri px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-matcha animate-pulse-soft" />
                <span className="text-xs tracking-[0.2em] text-hai">LIVE PO TRACKER</span>
              </div>
              <h2 className="font-zen text-3xl font-black leading-tight md:text-5xl">
                Pre-Order
                <br />
                Aktif
              </h2>
              <p className="mt-2 text-sm text-hai">update real-time · batch closes soon</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs tracking-[0.18em] text-hai">SLOT TERSEDIA</p>
              <p className="text-3xl font-black text-matcha">23</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-sumi/5 bg-washi shadow-xl">
            <div className="hidden grid-cols-6 gap-4 bg-sumi/5 px-8 py-4 text-xs tracking-[0.18em] text-hai lg:grid">
              <span>PRODUK</span>
              <span>BATCH</span>
              <span>PROGRESS</span>
              <span>SISA SLOT</span>
              <span>TUTUP PO</span>
              <span>STATUS</span>
            </div>
            {[
              { product: "Nike Air Max 97 Silver", sku: "BGS-NM97-SLV", batch: "#04", progress: 78, slot: "5", close: "08:47:23", status: "Open" },
              { product: "Adidas Samba OG White", sku: "BGS-SB-WHT", batch: "#02", progress: 48, slot: "18", close: "02:14:08", status: "Open" },
              { product: "New Balance 574 Navy", sku: "BGS-NB574-NVY", batch: "#01", progress: 95, slot: "2", close: "Segera", status: "Almost Full" },
              { product: "Jordan 1 Retro High Bred", sku: "BGS-J1-BRD", batch: "#05", progress: 100, slot: "-", close: "Sold Out", status: "Closed" },
            ].map((row) => (
              <div key={row.sku} className="grid grid-cols-1 gap-4 border-b border-sumi/5 px-6 py-5 last:border-b-0 hover:bg-sumi/5 lg:grid-cols-6 lg:px-8">
                <div>
                  <p className="font-bold">{row.product}</p>
                  <p className="text-xs text-hai">SKU: {row.sku} · Size 40-45</p>
                </div>
                <p className="text-sm text-hai">{row.batch}</p>
                <div>
                  <div className="h-2 overflow-hidden rounded-full bg-sumi/10">
                    <div className="h-full rounded-full bg-matcha" style={{ width: `${row.progress}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-hai">{row.progress}%</p>
                </div>
                <p className="text-xl font-bold">{row.slot}</p>
                <p className="text-sm text-hai">{row.close}</p>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${row.status === "Open" ? "bg-matcha/20 text-matcha" : row.status === "Almost Full" ? "bg-amber-100 text-amber-700" : "bg-sumi/10 text-hai"}`}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 overflow-hidden rounded-2xl border border-sumi/5 md:grid-cols-3">
            <div className="border-b border-sumi/5 bg-washi p-6 text-center md:border-b-0 md:border-r">
              <p className="text-xs tracking-[0.2em] text-hai">TOTAL PO AKTIF</p>
              <p className="mt-2 text-3xl font-black">3</p>
            </div>
            <div className="border-b border-sumi/5 bg-washi p-6 text-center md:border-b-0 md:border-r">
              <p className="text-xs tracking-[0.2em] text-hai">SLOT TERSEDIA</p>
              <p className="mt-2 text-3xl font-black text-matcha">23</p>
            </div>
            <div className="bg-washi p-6 text-center">
              <p className="text-xs tracking-[0.2em] text-hai">BATCH SELESAI</p>
              <p className="mt-2 text-3xl font-black">12</p>
            </div>
          </div>
        </div>
      </section>

      {/* Katalog */}
      <section id="katalog" className="pattern-asanoha bg-washi px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs tracking-[0.2em] text-hai">240+ STYLES AVAILABLE</p>
            <h2 className="mt-4 font-zen text-3xl font-black md:text-5xl">Koleksi Terbaru</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-hai">Temukan sneaker impianmu dari kurasi terbaru Bogorsneakers.</p>
          </div>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {[
              { id: "all", label: "Semua" },
              { id: "nike", label: "Nike" },
              { id: "adidas", label: "Adidas" },
              { id: "jordan", label: "Jordan" },
              { id: "nb", label: "New Balance" },
              { id: "lokal", label: "Lokal" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setKatalogFilter(filter.id)}
                className={`rounded-full px-5 py-2 text-xs tracking-[0.16em] transition-colors ${
                  katalogFilter === filter.id
                    ? "bg-sumi text-washi"
                    : "bg-sumi/5 text-usuzumi hover:bg-sumi/10"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredKatalogProducts.map((item) => (
              <div key={`${item.name}-${item.brand}`} className="card-lift overflow-hidden rounded-3xl border border-sumi/5 bg-shironeri">
                <div className="img-reveal relative aspect-square bg-sumi/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon size={38} className="text-hai/30" />
                  </div>
                  <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-semibold ${statusClasses(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="p-5">
                  <p className="mb-1 font-bold">{item.name}</p>
                  <p className="mb-3 text-xs text-hai">{item.size}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black">{item.price}</p>
                    <Link href="/catalog" className="flex h-9 w-9 items-center justify-center rounded-full bg-sumi text-washi transition-colors hover:bg-usuzumi">
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TikTok */}
      <section id="tiktok" className="bg-sumi px-6 py-20 text-washi md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] text-washi/60">@bogorsneakers</p>
              <h2 className="mt-3 font-zen text-3xl font-black md:text-5xl">TikTok Feed</h2>
              <p className="mt-2 text-sm text-washi/60">integrasi video otomatis</p>
            </div>
            <div className="flex items-center gap-5 text-right">
              <div>
                <p className="text-2xl font-black">87.3K</p>
                <p className="text-xs tracking-[0.18em] text-washi/60">Followers</p>
              </div>
              <div className="h-10 w-px bg-washi/20" />
              <div>
                <p className="text-2xl font-black">2.4M</p>
                <p className="text-xs tracking-[0.18em] text-washi/60">Views</p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl bg-washi/5 p-4">
            <span className="mr-2 text-xs tracking-[0.2em] text-washi/40">PRESET</span>
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setActivePreset(preset)}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                  activePreset === preset
                    ? "bg-washi text-sumi"
                    : "bg-washi/10 text-washi/60 hover:bg-washi/20"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {TIKTOK_CARDS.map((card) => (
              <div key={card.product} className="group relative aspect-9/16 overflow-hidden rounded-3xl bg-usuzumi">
                <div className="absolute inset-0 bg-linear-to-t from-kuro via-transparent to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-washi/10 backdrop-blur transition-transform group-hover:scale-110">
                    <Play size={20} />
                  </div>
                </div>
                <div className="absolute bottom-20 left-3 right-3 rounded-xl bg-washi/10 p-2.5 backdrop-blur">
                  <p className="text-xs font-semibold">{card.product}</p>
                  <p className="text-[11px] text-washi/60">{card.price}</p>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-semibold">@bogorsneakers</p>
                  <p className="text-[11px] text-washi/60">{card.caption}</p>
                </div>
                <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-washi/10 text-[10px] backdrop-blur">
                  {card.likes}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="overflow-hidden bg-matcha py-3 text-washi">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap pr-8 text-xs tracking-[0.22em]" style={{ animationDirection: "reverse" }}>
          {[
            "NIKE",
            "ADIDAS",
            "JORDAN",
            "NEW BALANCE",
            "ASICS",
            "VANS",
            "CONVERSE",
            "NIKE",
            "ADIDAS",
            "JORDAN",
            "NEW BALANCE",
          ].map((brand, index) => (
            <span key={`${brand}-${index}`} className="flex items-center gap-3">
              {brand}
              <span>◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="pattern-seigaiha bg-shironeri px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs tracking-[0.2em] text-hai">PROSES PO MUDAH</p>
            <h2 className="mt-4 font-zen text-3xl font-black md:text-5xl">Cara Pesan</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;
              const tint = step.color;
              return (
                <div key={step.title} className="card-lift relative rounded-3xl border border-sumi/5 bg-washi p-6">
                  <span className={`absolute -left-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                    tint === "matcha"
                      ? "bg-matcha text-washi"
                      : tint === "indigo"
                      ? "bg-indigo text-washi"
                      : tint === "take"
                      ? "bg-take text-washi"
                      : "bg-sakura text-sumi"
                  }`}>
                    {index + 1}
                  </span>
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    tint === "matcha"
                      ? "bg-matcha/10 text-matcha"
                      : tint === "indigo"
                      ? "bg-indigo/10 text-indigo"
                      : tint === "take"
                      ? "bg-take/10 text-take"
                      : "bg-sakura/20 text-sakura"
                  }`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-hai">{step.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-sumi/5 bg-washi p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-matcha/10 text-matcha">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-bold">100% Legit Guarantee</p>
                <p className="text-xs text-hai">Uang kembali jika palsu</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sumi/5 bg-washi p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo/10 text-indigo">
                <Truck size={18} />
              </div>
              <div>
                <p className="font-bold">Pengiriman Aman</p>
                <p className="text-xs text-hai">Packing aman + tracking aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sumi/5 bg-washi p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-take/10 text-take">
                <Clock3 size={18} />
              </div>
              <div>
                <p className="font-bold">CS Responsif</p>
                <p className="text-xs text-hai">Balas cepat 09.00-21.00 WIB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="galeri" className="bg-washi px-6 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs tracking-[0.2em] text-hai">FOTO DARI KOMUNITAS</p>
              <h2 className="mt-3 font-zen text-3xl font-black md:text-5xl">Galeri Karya</h2>
              <p className="mt-2 text-sm text-hai">submit @bogorsneakers</p>
            </div>
            <button className="rounded-full bg-sumi px-6 py-3 text-xs uppercase tracking-[0.18em] text-washi transition-colors hover:bg-usuzumi">
              Submit Foto
            </button>
          </div>

          <div className="columns-2 gap-4 lg:columns-4">
            {GALLERY_ITEMS.map((item) => (
              <div key={item} className="mb-4 break-inside-avoid">
                <div className="card-lift overflow-hidden rounded-3xl border border-sumi/5 bg-shironeri">
                  <div className="img-reveal aspect-4/5 bg-sumi/5">
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon size={36} className="text-hai/30" />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium">{item}</p>
                    <p className="text-xs text-hai">@community</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sumi px-6 py-14 text-washi md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h2 className="font-zen text-5xl font-black leading-none opacity-10 md:text-7xl">BOGOR</h2>
            <h2 className="font-zen -mt-2 text-5xl font-black leading-none md:-mt-4 md:text-7xl">SNEAKERS</h2>
            <p className="mt-3 text-xs tracking-[0.22em] text-washi/40">SINCE 2019 - INDONESIA</p>
          </div>

          <div className="grid grid-cols-1 gap-8 border-b border-washi/10 pb-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-washi/40">STORE</p>
              <p className="text-sm">Jl. Pajajaran No.88</p>
              <p className="text-sm">Bogor, Jawa Barat</p>
              <p className="text-sm">16143 Indonesia</p>
            </div>
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-washi/40">JAM BUKA</p>
              <p className="text-sm">Senin-Jumat: 09.00-21.00</p>
              <p className="text-sm">Sabtu-Minggu: 10.00-22.00</p>
            </div>
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-washi/40">NAVIGASI</p>
              <a href="#katalog" className="block text-sm transition-colors hover:text-matcha">Katalog</a>
              <a href="#po-tracker" className="block text-sm transition-colors hover:text-matcha">Live PO</a>
              <a href="#tiktok" className="block text-sm transition-colors hover:text-matcha">TikTok Feed</a>
              <a href="#galeri" className="block text-sm transition-colors hover:text-matcha">Galeri DIY</a>
            </div>
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-washi/40">SOSIAL</p>
              <p className="text-sm">Instagram: @bogorsneakers</p>
              <p className="text-sm">TikTok: @bogorsneakers</p>
              <p className="text-sm">WhatsApp: 0812-XXXX-XXXX</p>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 pt-6 text-xs text-washi/40 md:flex-row md:items-center">
            <p>2026 Bogorsneakers. All rights reserved.</p>
            <p>Made with Japanese minimal aesthetics.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
