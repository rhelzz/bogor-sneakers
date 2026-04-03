"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import NextImage from "next/image";
import { ChevronLeft, RotateCcw, ShoppingCart, Check, Layers, BookOpen, ArrowRight, ImagePlus, Type, Wand2, Package, Zap } from "lucide-react";
import GymShoePreview from "@/components/GymShoePreview";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "choice" | "design";
type ShoeZone = "upsol" | "midsol" | "lowsol";

interface ZoneConfig {
  label: string;
  description: string;
  emoji: string;
}

interface MaterialVariant {
  id: string;
  name: string;
  material: string;
  color: string;
  addOnPrice?: number;
  tag?: string;
}

// ─── Zone Config ──────────────────────────────────────────────────────────────
const ZONES: Record<ShoeZone, ZoneConfig> = {
  upsol:  { label: "Upsol",  description: "Bagian atas — panel depan, samping & tumit", emoji: "👟" },
  midsol: { label: "Midsol", description: "Lapisan tengah — bantalan & support kaki",   emoji: "🔲" },
  lowsol: { label: "LowSol", description: "Sol bawah — grip & kontak permukaan tanah",  emoji: "⬛" },
};

// ─── Material Variants ────────────────────────────────────────────────────────
const MATERIALS: Record<ShoeZone, MaterialVariant[]> = {
  upsol: [
    { id: "u-canvas",  name: "Canvas Classic",  material: "Canvas",   color: "#FFFFFF",  tag: "Default" },
    { id: "u-leather", name: "Premium Leather", material: "Kulit",    color: "#E8D5B7",  addOnPrice: 150_000 },
    { id: "u-mesh",    name: "Mesh Breathable", material: "Mesh",     color: "#D1D5DB",  tag: "Populer" },
    { id: "u-suede",   name: "Suede Klasik",    material: "Suede",    color: "#C4A882",  addOnPrice: 100_000 },
    { id: "u-knit",    name: "Knit Sport",      material: "Knit",     color: "#475569",  addOnPrice: 80_000 },
    { id: "u-neon",    name: "Neon Ripstop",    material: "Ripstop",  color: "#A3E635",  addOnPrice: 120_000, tag: "Limited" },
  ],
  midsol: [
    { id: "m-eva",     name: "EVA Standard",    material: "EVA Foam",      color: "#F9FAFB",  tag: "Default" },
    { id: "m-air",     name: "Air Cushion",     material: "Air Pod",       color: "#BAE6FD",  addOnPrice: 200_000, tag: "Populer" },
    { id: "m-gel",     name: "Gel Pro",         material: "Gel Cushion",   color: "#FDE68A",  addOnPrice: 250_000 },
    { id: "m-memory",  name: "Memory Form",     material: "Memory Foam",   color: "#E5E7EB",  addOnPrice: 180_000 },
    { id: "m-carbon",  name: "Carbon Boost",    material: "Carbon Fiber",  color: "#1F2937",  addOnPrice: 350_000, tag: "Pro" },
    { id: "m-cork",    name: "Cork Natural",    material: "Cork",          color: "#D97706",  addOnPrice: 120_000 },
  ],
  lowsol: [
    { id: "l-rubber",  name: "Standard Rubber", material: "Rubber",       color: "#374151",  tag: "Default" },
    { id: "l-grip",    name: "Grip Pro",        material: "Grip Rubber",  color: "#14532D",  addOnPrice: 80_000,  tag: "Populer" },
    { id: "l-trail",   name: "Trail Blazer",    material: "Trail Rubber", color: "#78350F",  addOnPrice: 100_000 },
    { id: "l-urban",   name: "Smooth Urban",    material: "Flat Rubber",  color: "#1F2937",  addOnPrice: 50_000 },
    { id: "l-conti",   name: "Continental",     material: "Hi-Grip",      color: "#0F172A",  addOnPrice: 150_000, tag: "Premium" },
    { id: "l-glow",    name: "Glow Trail",      material: "Phosphor",     color: "#4ADE80",  addOnPrice: 200_000, tag: "Limited" },
  ],
};

const DEFAULT_SELECTIONS: Record<ShoeZone, string> = {
  upsol:  "u-canvas",
  midsol: "m-eva",
  lowsol: "l-rubber",
};

const BASE_PRICE = 1_850_000;

const TAG_COLORS: Record<string, string> = {
  Default:  "bg-gray-100 text-gray-500",
  Populer:  "bg-indigo-100 text-indigo-700",
  Limited:  "bg-amber-100 text-amber-700",
  Pro:      "bg-violet-100 text-violet-700",
  Premium:  "bg-rose-100 text-rose-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMaterial(zone: ShoeZone, id: string): MaterialVariant {
  return MATERIALS[zone].find((m) => m.id === id) ?? MATERIALS[zone][0];
}

// ─── Material Card ────────────────────────────────────────────────────────────
function MaterialCard({
  variant,
  isSelected,
  onClick,
}: {
  variant: MaterialVariant;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ touchAction: "manipulation" }}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all ${
        isSelected
          ? "border-indigo-500 bg-indigo-50 shadow-md"
          : "border-gray-100 bg-white hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      {/* Color swatch */}
      <div
        className="h-10 w-10 rounded-full border border-black/10 shadow-sm"
        style={{ backgroundColor: variant.color }}
      />
      {/* Material code — bold */}
      <p className={`text-xs font-extrabold leading-tight ${isSelected ? "text-indigo-700" : "text-gray-900"}`}>
        {variant.material}
      </p>
      {/* Model name — semi */}
      <p className="text-[10px] font-medium text-gray-400 leading-tight">{variant.name}</p>
      {/* Tag badge */}
      {variant.tag && (
        <span
          className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold ${
            TAG_COLORS[variant.tag] ?? "bg-gray-100 text-gray-500"
          }`}
        >
          {variant.tag}
        </span>
      )}
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
          <Check size={11} strokeWidth={3} color="white" />
        </div>
      )}
    </button>
  );
}

const MAIN_STEPS   = ["Pilih Mode", "Pilih Bahan"];
const ZONE_KEYS: ShoeZone[] = ["upsol", "midsol", "lowsol"];
const DESIGN_STEPS = ["Upsol", "Midsol", "LowSol", "Gambar", "Teks", "Ringkasan"];

// ─── Catalog Products (mirroring catalog/page.tsx prices) ───────────────────────
const CATALOG_PRODUCTS: Record<number, { name: string; price: number }> = {
  1:  { name: "Apex Runner Pro",       price: 1_250_000 },
  2:  { name: "Urban Stride",          price: 899_000  },
  3:  { name: "FlexCore Sport",        price: 1_099_000 },
  4:  { name: "CloudStep Lite",        price: 750_000  },
  5:  { name: "Track Elite X",         price: 1_450_000 },
  6:  { name: "Night Court",           price: 980_000  },
  7:  { name: "Drift Canvas",          price: 620_000  },
  8:  { name: "Summit Hike GTX",       price: 1_599_000 },
  9:  { name: "Sprint Zero",           price: 1_180_000 },
  10: { name: "Neon Blaze",            price: 2_200_000 },
  11: { name: "Coastal Walk",          price: 540_000  },
  12: { name: "Iron Sole",             price: 1_300_000 },
};

// ─── Text Customisation Options ───────────────────────────────────────────────
const FONT_OPTIONS = [
  { id: "sans",    label: "Sans",    style: "font-sans font-bold" },
  { id: "serif",   label: "Serif",   style: "font-serif font-bold" },
  { id: "mono",    label: "Mono",    style: "font-mono font-bold" },
  { id: "black",   label: "Black",   style: "font-sans font-black" },
  { id: "italic",  label: "Italic",  style: "font-sans font-extrabold italic" },
];

const SIZE_OPTIONS = [
  { id: "xs",  label: "XS",  px: 10, tw: "text-[10px]" },
  { id: "sm",  label: "SM",  px: 13, tw: "text-[13px]" },
  { id: "md",  label: "MD",  px: 16, tw: "text-base" },
  { id: "lg",  label: "LG",  px: 22, tw: "text-[22px]" },
  { id: "xl",  label: "XL",  px: 28, tw: "text-[28px]" },
];

const COLOR_OPTIONS = [
  { id: "white",   label: "Putih",   hex: "#FFFFFF" },
  { id: "black",   label: "Hitam",   hex: "#111111" },
  { id: "indigo",  label: "Indigo",  hex: "#4F46E5" },
  { id: "red",     label: "Merah",   hex: "#EF4444" },
  { id: "yellow",  label: "Kuning",  hex: "#FACC15" },
  { id: "green",   label: "Hijau",   hex: "#22C55E" },
  { id: "sky",     label: "Biru",    hex: "#38BDF8" },
  { id: "gold",    label: "Emas",    hex: "#F59E0B" },
];

// ─── Step Bar ─────────────────────────────────────────────────────────────────
function StepBar({
  steps,
  current,
  compact = false,
  className = "",
}: {
  steps: string[];
  current: number; // 1-based
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex w-full items-start ${className}`}>
      {steps.map((label, idx) => {
        const num    = idx + 1;
        const done   = num < current;
        const active = num === current;
        const last   = idx === steps.length - 1;
        return (
          <div key={idx} className={`flex items-start ${!last ? "flex-1" : ""}`}>
            {/* Node */}
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center rounded-full font-bold transition-all duration-300 ${
                  compact ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-xs"
                } ${
                  done || active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"
                } ${active ? "ring-4 ring-indigo-100" : ""}`}
              >
                {done ? <Check size={compact ? 9 : 13} strokeWidth={3} /> : num}
              </div>
              <span className={`mt-1 whitespace-nowrap font-semibold ${compact ? "text-[8px]" : "text-[10px]"} ${
                active ? "text-indigo-600" : done ? "text-indigo-400" : "text-gray-400"
              }`}>
                {label}
              </span>
            </div>
            {/* Connector */}
            {!last && (
              <div className={`relative flex-1 ${compact ? "mx-1 mt-2" : "mx-2 mt-3"}`}>
                <div className="h-0.5 w-full rounded-full bg-gray-200" />
                {done && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="absolute inset-0 h-0.5 origin-left rounded-full bg-indigo-500"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Choice Screen ────────────────────────────────────────────────────────────
function ChoiceScreen({ onFreeDesign }: { onFreeDesign: () => void }) {
  const cardVariants: Variants = {
    hidden:   { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.13, duration: 0.45, ease: "easeOut" },
    }),
  };

  return (
    <div className="pattern-seigaiha flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center bg-linear-to-br from-shironeri via-washi to-[#ece8de] px-5 py-10 md:min-h-screen">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-center"
      >
        <h1 className="font-zen text-3xl font-black tracking-tight text-sumi md:text-4xl">
          Design<span className="text-matcha"> Studio</span>
        </h1>
        <p className="mt-2 text-sm text-usuzumi md:text-base">
          Pilih cara kamu ingin mendesain sepatu impianmu.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="flex w-full max-w-sm flex-col gap-4 md:max-w-2xl md:flex-row">
        {/* ── Opsi 1: Katalog Style ── */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex-1"
        >
          <Link
            href="/catalog"
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-sumi/10 bg-washi shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:border-matcha/35"
          >
            <div className="flex items-center justify-center bg-linear-to-br from-matcha to-take py-10">
              <BookOpen size={56} strokeWidth={1.5} color="white" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <span className="mb-1 self-start rounded-full bg-matcha/20 px-3 py-0.5 text-xs font-bold text-matcha">
                Opsi 1 — Katalog Style
              </span>
              <h2 className="mt-3 text-xl font-extrabold text-sumi">
                Pilih Model dari Katalog
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-usuzumi">
                Telusuri koleksi sneakers kami. Temukan model favoritmu, lalu sesuaikan warnanya langsung dari halaman detail produk.
              </p>
              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-sumi py-3.5 text-sm font-bold text-washi shadow-md transition-all group-hover:bg-usuzumi group-hover:gap-3">
                Lihat Katalog <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── Opsi 2: Kreasi Bebas ── */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="flex-1"
        >
          <button
            onClick={onFreeDesign}
            style={{ touchAction: "manipulation" }}
            className="group flex h-full w-full flex-col overflow-hidden rounded-3xl bg-linear-to-br from-kuro to-usuzumi shadow-lg transition-all hover:from-sumi hover:to-kuro hover:shadow-xl"
          >
            <div className="flex items-center justify-center py-10">
              <Layers size={56} strokeWidth={1.5} color="white" />
            </div>
            <div className="flex flex-1 flex-col p-6 text-left">
              <span className="mb-1 self-start rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-white/80">
                Opsi 2 — Kreasi Bebas
              </span>
              <h2 className="mt-3 text-xl font-extrabold text-white">
                Rakit Sendiri dari Nol
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">
                Pilih bahan untuk setiap bagian sepatu — <strong className="text-white">Upsol</strong>, <strong className="text-white">Midsol</strong>, dan <strong className="text-white">LowSol</strong> — dari koleksi material premium kami.
              </p>
              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-3.5 text-sm font-bold text-white shadow-md transition-all group-hover:bg-white/25 group-hover:gap-3">
                Mulai Mendesain <ArrowRight size={16} />
              </div>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Design Studio ────────────────────────────────────────────────────────────
function DesignStudio({ onBack, productId }: { onBack: () => void; productId: number | null }) {
  const router = useRouter();
  const [stepIdx, setStepIdx]         = useState(0);
  const [selections, setSelections]   = useState<Record<ShoeZone, string>>({ ...DEFAULT_SELECTIONS });
  const [customImage, setCustomImage]         = useState<string | null>(null);
  const [originalImage, setOriginalImage]     = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg]       = useState(false);
  const [bgRemoved, setBgRemoved]             = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [colorAssign, setColorAssign]         = useState<Record<ShoeZone, number>>({ upsol: 0, midsol: 1, lowsol: 2 });
  const [generatedColors, setGeneratedColors] = useState<Record<ShoeZone, string> | null>(null);
  const [isExtracting, setIsExtracting]       = useState(false);
  const [customText, setCustomText]   = useState("");
  const [textFont, setTextFont]       = useState("sans");
  const [textSize, setTextSize]       = useState("md");
  const [textColor, setTextColor]     = useState("white");
  const [wantsCustomBox, setWantsCustomBox] = useState<boolean | null>(null);
  const [wantsFastrack, setWantsFastrack]   = useState<boolean | null>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const activeFont  = FONT_OPTIONS.find((f) => f.id === textFont)  ?? FONT_OPTIONS[0];
  const activeSize  = SIZE_OPTIONS.find((s) => s.id === textSize)  ?? SIZE_OPTIONS[2];
  const activeColor = COLOR_OPTIONS.find((c) => c.id === textColor) ?? COLOR_OPTIONS[0];

  const isZoneStep = stepIdx < 3;
  const activeZone = isZoneStep ? ZONE_KEYS[stepIdx] : null;
  const isFirst    = stepIdx === 0;
  const isLast     = stepIdx === DESIGN_STEPS.length - 1;

  const select = (id: string) => {
    if (activeZone) setSelections((prev) => ({ ...prev, [activeZone]: id }));
  };

  const reset = () => {
    setSelections({ ...DEFAULT_SELECTIONS });
    setCustomImage(null);
    setOriginalImage(null);
    setBgRemoved(false);
    setIsRemovingBg(false);
    setExtractedColors([]);
    setGeneratedColors(null);
    setColorAssign({ upsol: 0, midsol: 1, lowsol: 2 });
    setCustomText("");
    setTextFont("sans");
    setTextSize("md");
    setTextColor("white");
    setWantsCustomBox(null);
    setWantsFastrack(null);
    setStepIdx(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canProses = wantsCustomBox !== null && wantsFastrack !== null;
  const handleProses = () => { if (canProses) router.push(`/checkout?total=${totalPrice}`); };
  const goBack = () => (isFirst ? onBack() : setStepIdx((s) => s - 1));
  const goNext = () => (isLast ? handleProses() : setStepIdx((s) => s + 1));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setCustomImage(src);
      setOriginalImage(src);
      setBgRemoved(false);
      setExtractedColors([]);
      setGeneratedColors(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExtractColors = () => {
    if (!customImage || isExtracting) return;
    setIsExtracting(true);
    const img = new Image();
    img.onload = () => {
      const SIZE = 150;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) { setIsExtracting(false); return; }
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

      // Fine quantization (q=8 → 32 buckets per channel)
      // Store sum of original values for accurate averaged hex
      const q = 8;
      const freq = new Map<string, { count: number; sumR: number; sumG: number; sumB: number }>();

      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue; // skip transparent pixels
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // Perceptual luminance — skip near-black & near-white
        const lum = (r * 299 + g * 587 + b * 114) / 1000;
        if (lum < 18 || lum > 238) continue;
        const key = `${Math.round(r / q)},${Math.round(g / q)},${Math.round(b / q)}`;
        const e = freq.get(key);
        if (e) { e.count++; e.sumR += r; e.sumG += g; e.sumB += b; }
        else freq.set(key, { count: 1, sumR: r, sumG: g, sumB: b });
      }

      const sorted = [...freq.values()].sort((a, b) => b.count - a.count);

      const palette: string[] = [];
      for (const e of sorted) {
        if (palette.length >= 6) break;
        // Use per-bucket average for accurate color
        const r = Math.round(e.sumR / e.count);
        const g = Math.round(e.sumG / e.count);
        const b = Math.round(e.sumB / e.count);
        const hex = (n: number) => Math.min(255, Math.max(0, n)).toString(16).padStart(2, "0");
        const color = `#${hex(r)}${hex(g)}${hex(b)}`;
        // Euclidean distance — skip colors too perceptually similar to existing palette
        const tooClose = palette.some((p) => {
          const pr = parseInt(p.slice(1, 3), 16);
          const pg = parseInt(p.slice(3, 5), 16);
          const pb = parseInt(p.slice(5, 7), 16);
          return Math.sqrt((pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2) < 48;
        });
        if (!tooClose) palette.push(color);
      }

      while (palette.length < 3) palette.push("#888888");
      setExtractedColors(palette);
      setColorAssign({ upsol: 0, midsol: 1, lowsol: 2 });
      setIsExtracting(false);
    };
    img.src = customImage;
  };

  const handleApplyColors = () => {
    if (!extractedColors.length) return;
    setGeneratedColors({
      upsol:  extractedColors[colorAssign.upsol]  ?? extractedColors[0],
      midsol: extractedColors[colorAssign.midsol] ?? extractedColors[0],
      lowsol: extractedColors[colorAssign.lowsol] ?? extractedColors[0],
    });
  };

  const handleRemoveBg = async () => {
    if (!customImage || isRemovingBg) return;
    setIsRemovingBg(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await fetch(customImage).then((r) => r.blob());
      const result = await removeBackground(blob);
      const url = URL.createObjectURL(result);
      setCustomImage(url);
      setBgRemoved(true);
    } catch {
      // silently fail — keep original image
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleRestoreOriginal = () => {
    if (originalImage) {
      setCustomImage(originalImage);
      setBgRemoved(false);
    }
  };

  const upsolColor  = generatedColors?.upsol  ?? getMaterial("upsol",  selections.upsol).color;
  const lowsolColor = generatedColors?.lowsol ?? getMaterial("lowsol", selections.lowsol).color;

  const catalogProduct = productId ? CATALOG_PRODUCTS[productId] ?? null : null;
  const basePrice       = catalogProduct ? catalogProduct.price : BASE_PRICE;
  const fasttrackAddon  = wantsFastrack === true ? 30_000 : 0;
  const totalPrice      = basePrice + fasttrackAddon;

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col md:h-[calc(100svh-4rem)] md:flex-row">
      {/* ── PREVIEW PANEL ──────────────────────────────────────────────── */}
      <motion.section
        layout
        className="relative flex shrink-0 flex-col items-center justify-center bg-linear-to-br from-shironeri via-washi to-[#ece8de] px-6 py-6
                   md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-3/5 md:py-10 md:px-10"
      >
        {/* Back button */}
        <button
          onClick={goBack}
          style={{ touchAction: "manipulation" }}
          className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm hover:text-indigo-600 md:left-6 md:top-6"
        >
          <ChevronLeft size={14} /> {isFirst ? "Opsi Lain" : DESIGN_STEPS[stepIdx - 1]}
        </button>

        {/* Shoe Preview */}
        <motion.div
          layout
          className="relative w-full max-w-xs md:max-w-md lg:max-w-lg"
          transition={{ type: "spring", stiffness: 220, damping: 25 }}
        >
          <GymShoePreview upperColor={upsolColor} soleColor={lowsolColor} className="w-full drop-shadow-xl" />
          {/* Custom text overlay */}
          {customText && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span
                className={`rounded bg-black/20 px-3 py-1 tracking-widest drop-shadow-lg backdrop-blur-sm ${activeFont.style} ${activeSize.tw}`}
                style={{ color: activeColor.hex }}
              >
                {customText}
              </span>
            </div>
          )}
          {/* Custom image badge (non-upload steps) */}
          {customImage && stepIdx !== 3 && (
            <div className="absolute bottom-2 right-2 h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md">
              <NextImage src={customImage} alt="Custom image badge" width={40} height={40} unoptimized className="h-full w-full object-cover" />
            </div>
          )}
        </motion.div>

        <p className="mt-3 text-center text-xs font-medium text-indigo-600 md:text-sm">
          {isZoneStep
            ? <><span>Sedang mengedit: </span><span className="font-bold">{ZONES[activeZone!].label}</span></>
            : stepIdx === 3 ? "Upload gambar kustom untuk sepatumu"
            : stepIdx === 4 ? "Tambahkan teks personal pada sepatu"
            : "Tinjau desainmu sebelum checkout"}
        </p>

        {/* Desktop action buttons */}
        <div className="mt-5 hidden gap-3 md:flex">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-black/5 transition-all hover:ring-indigo-300"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <motion.button
            onClick={isLast ? handleProses : goNext}
            whileTap={(!isLast || canProses) ? { scale: 0.97 } : {}}
            disabled={isLast && !canProses}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors ${
              isLast && !canProses
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLast ? (
                <motion.span key="proses" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} className="flex items-center gap-1.5">
                  <Package size={15} /> Proses
                </motion.span>
              ) : (
                <motion.span key="next" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} className="flex items-center gap-1.5">
                  <ShoppingCart size={15} /> Tambah ke Keranjang
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.section>

      {/* ── CONTROL PANEL ──────────────────────────────────────────────── */}
      <motion.section
        layout
        className="flex-1 overflow-y-auto bg-white px-4 py-5 md:w-2/5 md:px-6 md:py-8"
      >
        {/* ① Main step progress */}
        <StepBar steps={MAIN_STEPS} current={2} className="mb-6" />

        <h1 className="font-zen mb-1 text-xl font-extrabold tracking-tight text-gray-900 md:text-2xl">
          Kreasi Bebas
        </h1>
        <p className="mb-5 text-sm text-gray-500">Sesuaikan setiap bagian sepatumu langkah demi langkah.</p>

        {/* ② Design sub-step progress */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Tahap Desain
          </p>
          <StepBar steps={DESIGN_STEPS} current={stepIdx + 1} compact />
        </div>

        {/* ── Step content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* ZONE STEPS (0–2): Material selection */}
            {isZoneStep && activeZone && (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Pilih Bahan — {ZONES[activeZone].label}
                </p>
                <p className="mb-4 text-xs text-gray-400">{ZONES[activeZone].description}</p>
                <div className="mb-6 grid grid-cols-3 gap-2.5">
                  {MATERIALS[activeZone].map((variant) => (
                    <MaterialCard
                      key={variant.id}
                      variant={variant}
                      isSelected={selections[activeZone] === variant.id}
                      onClick={() => select(variant.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* STEP 3: Image Upload */}
            {stepIdx === 3 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Upload Gambar
                </p>
                <p className="mb-4 text-xs text-gray-400">
                  Tambahkan gambar atau pola kustom untuk diterapkan pada bagian sepatu.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {/* Upload area */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ touchAction: "manipulation" }}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-8 transition-all hover:border-indigo-400 hover:bg-indigo-50"
                >
                  {customImage ? (
                    <div className={`h-28 w-28 overflow-hidden rounded-xl shadow-md ${
                      bgRemoved ? "bg-gray-100 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ddd%22/%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ddd%22/%3E%3C/svg%3E')]" : ""
                    }`}>
                      <NextImage src={customImage} alt="Preview gambar kustom" width={112} height={112} unoptimized className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                      <ImagePlus size={28} className="text-indigo-400" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-600">
                      {customImage ? "Ganti Gambar" : "Pilih Gambar"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">PNG, JPG, WebP — maks 5 MB</p>
                  </div>
                </button>

                {/* Actions after image is uploaded */}
                {customImage && (
                  <div className="mt-3 flex flex-col gap-2">
                    {/* ── Generate Colors ── */}
                    <button
                      onClick={handleExtractColors}
                      disabled={isExtracting}
                      style={{ touchAction: "manipulation" }}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                        isExtracting
                          ? "cursor-wait border border-violet-100 bg-violet-50 text-violet-400"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                      }`}
                    >
                      {isExtracting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Mengekstrak warna...
                        </>
                      ) : (
                        <><Wand2 size={15} /> Generate Warna dari Gambar</>
                      )}
                    </button>

                    {/* Color palette + zone assignment */}
                    {extractedColors.length > 0 && (
                      <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                        {/* Extracted palette */}
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
                          Palet Warna Terdeteksi
                        </p>
                        <div className="mb-4 flex gap-2">
                          {extractedColors.map((hex, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div
                                className="h-9 w-9 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-[9px] font-mono text-gray-500">{hex}</span>
                            </div>
                          ))}
                        </div>

                        {/* Zone assignment */}
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-400">
                          Atur Warna per Zona
                        </p>
                        <div className="flex flex-col gap-2">
                          {ZONE_KEYS.map((z) => (
                            <div key={z} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                              <span className="text-xs font-bold text-gray-700 w-14">{ZONES[z].label}</span>
                              <div className="flex gap-1.5">
                                {extractedColors.map((hex, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setColorAssign((prev) => ({ ...prev, [z]: i }))}
                                    style={{ backgroundColor: hex, touchAction: "manipulation" }}
                                    className={`h-7 w-7 rounded-full border-2 transition-all ${
                                      colorAssign[z] === i
                                        ? "border-violet-500 scale-110 shadow-md"
                                        : "border-white hover:scale-105"
                                    }`}
                                  />
                                ))}
                              </div>
                              <div
                                className="h-5 w-5 rounded-full border border-black/10 shadow-sm shrink-0"
                                style={{ backgroundColor: extractedColors[colorAssign[z]] ?? "#888" }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Apply button */}
                        <button
                          onClick={handleApplyColors}
                          style={{ touchAction: "manipulation" }}
                          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
                        >
                          <Check size={15} /> Terapkan Warna ke Sepatu
                        </button>
                        {generatedColors && (
                          <button
                            onClick={() => setGeneratedColors(null)}
                            style={{ touchAction: "manipulation" }}
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-violet-200 py-2 text-xs font-medium text-violet-500 transition-colors hover:border-violet-400"
                          >
                            <RotateCcw size={11} /> Reset ke Warna Bahan
                          </button>
                        )}
                      </div>
                    )}

                    {/* Remove Background */}
                    <button
                      onClick={handleRemoveBg}
                      disabled={isRemovingBg}
                      style={{ touchAction: "manipulation" }}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                        bgRemoved
                          ? "border border-green-200 bg-green-50 text-green-600"
                          : isRemovingBg
                          ? "cursor-wait border border-indigo-100 bg-indigo-50 text-indigo-400"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {isRemovingBg ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Memproses (beberapa detik)...
                        </>
                      ) : bgRemoved ? (
                        <><Check size={15} /> Background Berhasil Dihapus</>
                      ) : (
                        <><Wand2 size={15} /> Hapus Background Otomatis</>
                      )}
                    </button>

                    {/* Restore original (only shown after bg removed) */}
                    {bgRemoved && (
                      <button
                        onClick={handleRestoreOriginal}
                        style={{ touchAction: "manipulation" }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-amber-200 hover:text-amber-600"
                      >
                        <RotateCcw size={12} /> Kembalikan Gambar Asli
                      </button>
                    )}

                    {/* Delete image */}
                    <button
                      onClick={() => {
                        setCustomImage(null);
                        setOriginalImage(null);
                        setBgRemoved(false);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      style={{ touchAction: "manipulation" }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-red-200 hover:text-red-500"
                    >
                      <ImagePlus size={12} /> Hapus Gambar
                    </button>
                  </div>
                )}

                {/* Info box */}
                <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-700">
                  <span className="font-semibold">Hapus Background</span> memproses gambarmu langsung di perangkatmu — tidak ada data yang dikirim ke server. Proses membutuhkan beberapa detik.
                </div>
                <p className="mt-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                  ⚠ Langkah ini opsional. Tekan Lanjut untuk melewatinya.
                </p>
              </div>
            )}

            {/* STEP 4: Text Input */}
            {stepIdx === 4 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Tambah Teks
                </p>
                <p className="mb-4 text-xs text-gray-400">
                  Personalisasi sepatumu — maks 20 karakter.
                </p>

                {/* Text input */}
                <div className="relative mb-5">
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.slice(0, 20))}
                    placeholder="Contoh: JOHN23, STRIKER..."
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 pr-14 text-sm font-semibold text-gray-800 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />
                  <span className="pointer-events-none absolute bottom-4 right-4 text-xs text-gray-400">
                    {customText.length}/20
                  </span>
                </div>

                {/* Font Family */}
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Jenis Font</p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTextFont(f.id)}
                      style={{ touchAction: "manipulation" }}
                      className={`rounded-xl border-2 px-3 py-2 text-sm transition-all ${f.style} ${
                        textFont === f.id
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-100 bg-white text-gray-700 hover:border-indigo-200"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Font Size */}
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Ukuran Font</p>
                <div className="mb-5 flex gap-2">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setTextSize(s.id)}
                      style={{ touchAction: "manipulation" }}
                      className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 transition-all ${
                        textSize === s.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 bg-white hover:border-indigo-200"
                      }`}
                    >
                      <span
                        className={`font-bold leading-none ${s.tw} ${
                          textSize === s.id ? "text-indigo-700" : "text-gray-700"
                        }`}
                        style={{ fontSize: `${Math.min(s.px, 18)}px` }}
                      >
                        A
                      </span>
                      <span className={`text-[9px] font-semibold ${
                        textSize === s.id ? "text-indigo-500" : "text-gray-400"
                      }`}>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Font Color */}
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Warna Teks</p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setTextColor(c.id)}
                      title={c.label}
                      style={{ touchAction: "manipulation", backgroundColor: c.hex }}
                      className={`h-9 w-9 rounded-full border-2 transition-all ${
                        textColor === c.id
                          ? "border-indigo-500 scale-110 shadow-md"
                          : "border-gray-200 hover:scale-105"
                      } ${c.hex === "#FFFFFF" ? "ring-1 ring-gray-200" : ""}`}
                    />
                  ))}
                </div>

                {/* Live preview */}
                {customText && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gray-800 px-4 py-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600">
                      <Type size={16} color="white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-[10px] text-gray-400">Preview teks pada sepatu:</p>
                      <p
                        className={`truncate tracking-widest ${activeFont.style} ${activeSize.tw}`}
                        style={{ color: activeColor.hex }}
                      >
                        {customText}
                      </p>
                    </div>
                  </div>
                )}

                <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-700">
                  ⚠ Langkah ini opsional. Tekan Lanjut untuk melewatinya.
                </p>
              </div>
            )}

            {/* STEP 5: Ringkasan / Summary + Pricing */}
            {stepIdx === 5 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Ringkasan Desain
                </p>
                <p className="mb-4 text-xs text-gray-400">
                  Isi semua pilihan di bawah, lalu tekan Proses untuk melanjutkan ke pembayaran.
                </p>

                {/* Product info */}
                {catalogProduct && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl bg-gray-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <BookOpen size={18} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Model Dipilih</p>
                      <p className="text-sm font-bold text-gray-900">{catalogProduct.name}</p>
                    </div>
                  </div>
                )}

                {/* Material summary */}
                <div className="mb-3 rounded-2xl bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Bahan</p>
                  <div className="flex flex-col gap-2.5">
                    {ZONE_KEYS.map((z) => {
                      const mat = getMaterial(z, selections[z]);
                      return (
                        <div key={z} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: mat.color }} />
                            <span className="text-sm font-medium text-gray-700">{ZONES[z].label}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-800">{mat.material}</p>
                            <p className="text-[10px] text-gray-400">{mat.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom image */}
                {customImage && (
                  <div className="mb-3 rounded-2xl bg-gray-50 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Gambar Kustom</p>
                    <div className="flex items-center gap-3">
                      <NextImage src={customImage} alt="Gambar custom" width={48} height={48} unoptimized className="h-12 w-12 rounded-xl object-cover shadow-sm" />
                      <p className="text-sm font-semibold text-gray-800">Gambar ditambahkan</p>
                    </div>
                  </div>
                )}

                {/* Custom text */}
                {customText && (
                  <div className="mb-3 rounded-2xl bg-gray-50 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Teks Kustom</p>
                    <div className="mb-1 inline-flex items-center gap-2 rounded-xl bg-gray-800 px-3 py-2">
                      <span
                        className={`tracking-widest ${activeFont.style} text-sm`}
                        style={{ color: activeColor.hex }}
                      >
                        {customText}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-500">
                      <span>Font: <strong>{activeFont.label}</strong></span>
                      <span>Ukuran: <strong>{activeSize.label}</strong></span>
                      <span>Warna: <strong>{activeColor.label}</strong></span>
                    </div>
                  </div>
                )}

                {/* Custom Box option */}
                <div className="mb-3 rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Package size={14} className="text-indigo-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Custom Box</p>
                    {wantsCustomBox === null && (
                      <span className="ml-auto text-[10px] font-semibold text-red-400">Wajib dipilih</span>
                    )}
                  </div>
                  <p className="mb-3 text-xs text-gray-500">Apakah kamu ingin dibuatkan custom box eksklusif untuk sepatumu?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWantsCustomBox(true)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        wantsCustomBox === true
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-indigo-300"
                      }`}
                    >
                      Ya
                    </button>
                    <button
                      onClick={() => setWantsCustomBox(false)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        wantsCustomBox === false
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-300"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {/* Jalur Fastrack option */}
                <div className="mb-3 rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Zap size={14} className="text-yellow-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Jalur Fastrack</p>
                    {wantsFastrack === null && (
                      <span className="ml-auto text-[10px] font-semibold text-red-400">Wajib dipilih</span>
                    )}
                  </div>
                  <p className="mb-1 text-xs text-gray-500">Prioritas produksi &amp; pengiriman eksklusif.</p>
                  <p className="mb-3 text-xs font-semibold text-yellow-600">+ Rp 30.000</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWantsFastrack(true)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        wantsFastrack === true
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-yellow-300"
                      }`}
                    >
                      Ya, fastrack!
                    </button>
                    <button
                      onClick={() => setWantsFastrack(false)}
                      className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                        wantsFastrack === false
                          ? "bg-gray-700 text-white"
                          : "bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-gray-300"
                      }`}
                    >
                      Tidak
                    </button>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Harga Dasar</span>
                      <span className="font-semibold">Rp {basePrice.toLocaleString("id-ID")}</span>
                    </div>
                    {wantsFastrack === true && (
                      <div className="flex items-center justify-between text-sm text-yellow-700">
                        <span>Jalur Fastrack</span>
                        <span className="font-semibold">+ Rp 30.000</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-indigo-200 pt-2">
                      <span className="text-sm font-bold text-gray-800">Total Harga</span>
                      <p className="text-xl font-black text-indigo-700">Rp {totalPrice.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Wizard navigation buttons */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={goBack}
            style={{ touchAction: "manipulation" }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-3.5 text-sm font-medium text-gray-700 active:bg-gray-200"
          >
            <ChevronLeft size={15} />
            {isFirst ? "Kembali" : DESIGN_STEPS[stepIdx - 1]}
          </button>
          <motion.button
            onClick={goNext}
            whileTap={(!isLast || canProses) ? { scale: 0.97 } : {}}
            disabled={isLast && !canProses}
            style={{ touchAction: "manipulation" }}
            className={`flex flex-2 items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-semibold text-white ${
              isLast && !canProses
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 active:bg-indigo-700"
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isLast ? (
                <motion.span key="proses" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} className="flex items-center gap-1.5">
                  <Package size={15} /> Proses
                </motion.span>
              ) : (
                <motion.span key={`s${stepIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  {DESIGN_STEPS[stepIdx + 1]} <ArrowRight size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.section>

    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
function CustomizePageInner() {
  const searchParams  = useSearchParams();
  const fromCatalog   = searchParams.has("product");
  const productId     = fromCatalog ? Number(searchParams.get("product")) : null;
  const [step, setStep] = useState<Step>(fromCatalog ? "design" : "choice");

  return (
    <div className="jp-theme">
      <AnimatePresence mode="wait">
        {step === "choice" ? (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
          >
            <ChoiceScreen onFreeDesign={() => setStep("design")} />
          </motion.div>
        ) : (
          <motion.div
            key="design"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <DesignStudio onBack={() => setStep("choice")} productId={productId} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CustomizePage() {
  return (
    <Suspense>
      <CustomizePageInner />
    </Suspense>
  );
}

