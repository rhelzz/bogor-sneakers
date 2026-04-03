"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Phone, MapPin, CreditCard, CheckCircle, Mail, Truck, Package, Copy, Check, Download, QrCode } from "lucide-react";

// -- JNE Zone mapping --------------------------------------------------------
const CITY_ZONES: { keywords: string[]; zone: "jabo" | "java" | "outer" | "papua" }[] = [
  {
    keywords: ["jakarta", "bogor", "depok", "tangerang", "bekasi", "karawang", "cikarang"],
    zone: "jabo",
  },
  {
    keywords: [
      "bandung", "cimahi", "sukabumi", "cirebon", "garut", "tasikmalaya",
      "surabaya", "malang", "yogyakarta", "jogja", "solo", "semarang",
      "magelang", "purwokerto", "kediri", "sidoarjo", "gresik", "mojokerto",
      "blitar", "jombang", "probolinggo", "pasuruan", "madiun", "banyuwangi",
      "denpasar", "bali", "badung", "gianyar", "tabanan", "singaraja",
    ],
    zone: "java",
  },
  {
    keywords: [
      "medan", "palembang", "pekanbaru", "batam", "padang", "lampung", "bandar lampung",
      "jambi", "bengkulu", "banda aceh", "aceh", "pangkal pinang", "tanjung pinang",
      "pontianak", "samarinda", "balikpapan", "banjarmasin", "palangkaraya", "tarakan",
      "makassar", "manado", "palu", "kendari", "gorontalo", "ambon", "ternate",
      "mataram", "kupang", "ende", "maumere",
    ],
    zone: "outer",
  },
  {
    keywords: ["jayapura", "sorong", "manokwari", "merauke", "timika", "fakfak", "wamena", "nabire"],
    zone: "papua",
  },
];

interface JneService {
  id: string;
  name: string;
  desc: string;
  etd: string;
  price: number;
}

const JNE_RATES: Record<"jabo" | "java" | "outer" | "papua", JneService[]> = {
  jabo: [
    { id: "oke", name: "JNE OKE", desc: "Ongkos Kirim Ekonomis", etd: "2-3 hari", price: 9_000  },
    { id: "reg", name: "JNE REG", desc: "Reguler",               etd: "1-2 hari", price: 13_000 },
    { id: "yes", name: "JNE YES", desc: "Yakin Esok Sampai",     etd: "1 hari",   price: 21_000 },
  ],
  java: [
    { id: "oke", name: "JNE OKE", desc: "Ongkos Kirim Ekonomis", etd: "3-5 hari", price: 14_000 },
    { id: "reg", name: "JNE REG", desc: "Reguler",               etd: "2-3 hari", price: 19_000 },
    { id: "yes", name: "JNE YES", desc: "Yakin Esok Sampai",     etd: "1-2 hari", price: 29_000 },
  ],
  outer: [
    { id: "oke", name: "JNE OKE", desc: "Ongkos Kirim Ekonomis", etd: "5-8 hari", price: 22_000 },
    { id: "reg", name: "JNE REG", desc: "Reguler",               etd: "3-5 hari", price: 29_000 },
    { id: "yes", name: "JNE YES", desc: "Yakin Esok Sampai",     etd: "2-3 hari", price: 49_000 },
  ],
  papua: [
    { id: "oke", name: "JNE OKE", desc: "Ongkos Kirim Ekonomis", etd: "7-14 hari", price: 38_000 },
    { id: "reg", name: "JNE REG", desc: "Reguler",               etd: "5-7 hari",  price: 49_000 },
    { id: "yes", name: "JNE YES", desc: "Yakin Esok Sampai",     etd: "3-5 hari",  price: 89_000 },
  ],
};

function detectZone(city: string): "jabo" | "java" | "outer" | "papua" | null {
  const lower = city.toLowerCase().trim();
  if (!lower) return null;
  for (const entry of CITY_ZONES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) return entry.zone;
  }
  return lower.length > 2 ? "outer" : null;
}

// BCA account info
const BCA_ACCOUNT = "1234567890";
const BCA_NAME    = "BOGORSNEAKERS INDONESIA";

// Placeholder QRIS data URL (1x1 gray PNG — replace src with real QRIS image path)
const QRIS_IMAGE_URL = "/qris.png";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: "bca" | "qris" | "";
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  shipping?: string;
  paymentMethod?: string;
}

// -- Component -----------------------------------------------------------------
export default function CheckoutPage() {
  const router = useRouter();
  const [designPrice] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    const total = Number(params.get("total"));
    return total > 0 ? total : null;
  });

  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "",
    address: "", city: "", postalCode: "",
    paymentMethod: "",
  });
  const [errors, setErrors]                     = useState<FormErrors>({});
  const [submitted, setSubmitted]               = useState(false);
  const [jneServices, setJneServices]           = useState<JneService[] | null>(null);
  const [selectedService, setSelectedService]   = useState<string>("");

  const setField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "city" || key === "postalCode" || key === "address") {
      setJneServices(null);
      setSelectedService("");
    }
  };

  const handleCekOngkir = () => {
    const e: FormErrors = {};
    if (!form.address.trim())    e.address    = "Isi alamat lengkap terlebih dahulu";
    if (!form.city.trim())       e.city       = "Isi kota terlebih dahulu";
    if (!form.postalCode.trim()) e.postalCode = "Isi kode pos terlebih dahulu";
    else if (!/^\d{5}$/.test(form.postalCode)) e.postalCode = "Kode pos harus 5 digit";
    if (Object.keys(e).length > 0) { setErrors((prev) => ({ ...prev, ...e })); return; }
    const zone = detectZone(form.city);
    if (!zone) { setErrors((prev) => ({ ...prev, city: "Kota tidak dikenali, coba nama lain" })); return; }
    setJneServices(JNE_RATES[zone]);
    setSelectedService("");
    setErrors((prev) => ({ ...prev, city: undefined, address: undefined, postalCode: undefined }));
  };

  const [copied, setCopied] = useState(false);

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(BCA_ACCOUNT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQris = () => {
    const a = document.createElement("a");
    a.href = QRIS_IMAGE_URL;
    a.download = "QRIS-BOGORSNEAKERS.png";
    a.click();
  };

  const shippingCost = jneServices?.find((s) => s.id === selectedService)?.price ?? null;
  const selectedSvc  = jneServices?.find((s) => s.id === selectedService) ?? null;
  const grandTotal   = (designPrice ?? 0) + (shippingCost ?? 0);

  const validate = () => {
    const e: FormErrors = {};
    if (!form.name.trim())  e.name  = "Nama wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
    if (!form.phone.trim()) e.phone = "Nomor HP wajib diisi";
    else if (!/^(\+62|62|0)[0-9]{8,12}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Format nomor HP tidak valid";
    if (!form.address.trim())    e.address    = "Alamat wajib diisi";
    if (!form.city.trim())       e.city       = "Kota wajib diisi";
    if (!form.postalCode.trim()) e.postalCode = "Kode pos wajib diisi";
    else if (!/^\d{5}$/.test(form.postalCode)) e.postalCode = "Kode pos harus 5 digit";
    if (!selectedService)        e.shipping   = "Pilih layanan pengiriman JNE";
  if (!form.paymentMethod)     e.paymentMethod = "Pilih metode pembayaran";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  // -- Success screen ----------------------------------------------------------
  if (submitted) {
    return (
      <div className="jp-theme pattern-seigaiha flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center bg-linear-to-br from-shironeri via-washi to-[#ece8de] px-6 py-12 md:min-h-[calc(100svh-4rem)]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="w-full max-w-sm rounded-3xl border border-sumi/10 bg-washi p-7 text-center shadow-lg"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-gray-900">Pesanan Diterima!</h1>
          <p className="mb-1 text-sm text-gray-500">
            Detail pesanan telah dikirim ke <strong>{form.email}</strong>.
          </p>
          <p className="mb-8 text-sm text-gray-500">
            Tim kami akan menghubungi kamu di <strong>{form.phone}</strong> untuk konfirmasi.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-xl bg-sumi py-3 text-sm font-semibold text-washi shadow-md transition-colors hover:bg-usuzumi"
          >
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    );
  }

  // -- Form --------------------------------------------------------------------
  return (
    <div className="jp-theme pattern-seigaiha min-h-[calc(100svh-3.5rem)] bg-gray-50 md:min-h-[calc(100svh-4rem)]">
      <div className="mx-auto max-w-lg px-4 py-6 md:py-10">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-black/5 hover:text-indigo-600"
          >
            <ChevronLeft size={14} /> Kembali
          </button>
          <h1 className="font-zen text-lg font-extrabold text-gray-900">Data Pengiriman &amp; Pembayaran</h1>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* -- Data Diri ------------------------------------------------ */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-2">
              <User size={15} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Data Diri</span>
            </div>
            <div className="flex flex-col gap-3">

              {/* Nama */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-400 ${
                    errors.name ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-indigo-400"
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Alamat Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="nama@email.com"
                    className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-400 ${
                      errors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-indigo-400"
                    }`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Nomor HP / WhatsApp</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-400 ${
                      errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-indigo-400"
                    }`}
                  />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

            </div>
          </div>

          {/* -- Alamat Pengiriman ---------------------------------------- */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={15} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Alamat Pengiriman</span>
            </div>
            <div className="flex flex-col gap-3">

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Alamat Lengkap</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  placeholder="Jl. ..., RT/RW, Kelurahan, Kecamatan"
                  rows={3}
                  className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-400 ${
                    errors.address ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-indigo-400"
                  }`}
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Kota / Kabupaten</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    placeholder="Jakarta"
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-400 ${
                      errors.city ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-indigo-400"
                    }`}
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                </div>
                <div className="w-32">
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Kode Pos</label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => setField("postalCode", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="12345"
                    maxLength={5}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-400 ${
                      errors.postalCode ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-indigo-400"
                    }`}
                  />
                  {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>}
                </div>
              </div>

              {/* Cek Ongkir */}
              <button
                type="button"
                onClick={handleCekOngkir}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 active:bg-indigo-200"
              >
                <Truck size={15} /> Cek Ongkos Kirim JNE
              </button>

            </div>
          </div>

          {/* -- Layanan Pengiriman JNE ----------------------------------- */}
          <AnimatePresence>
            {jneServices && (
              <motion.div
                key="jne"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Truck size={15} className="text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Layanan JNE</span>
                  <span className="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                    ke {form.city}
                  </span>
                </div>
                <p className="mb-3 text-xs text-gray-400">Pilih layanan pengiriman yang sesuai.</p>
                <div className="flex flex-col gap-2">
                  {jneServices.map((svc) => (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => { setSelectedService(svc.id); setErrors((prev) => ({ ...prev, shipping: undefined })); }}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                        selectedService === svc.id
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                          : "border-gray-200 bg-gray-50 hover:border-indigo-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800">{svc.name}</p>
                        <p className="text-xs text-gray-400">{svc.desc} &bull; {svc.etd}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-indigo-700">
                          Rp {svc.price.toLocaleString("id-ID")}
                        </span>
                        <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                          selectedService === svc.id ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
                {errors.shipping && <p className="mt-2 text-xs text-red-500">{errors.shipping}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* -- Ringkasan Biaya ------------------------------------------ */}
          <AnimatePresence>
            {shippingCost !== null && selectedSvc && (
              <motion.div
                key="cost-summary"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Package size={15} className="text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Ringkasan Biaya</span>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  {designPrice !== null && (
                    <div className="flex items-center justify-between text-gray-700">
                      <span>Harga Desain &amp; Sepatu</span>
                      <span className="font-semibold">Rp {designPrice.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-gray-700">
                    <span>{selectedSvc.name} <span className="text-xs text-gray-400">({selectedSvc.etd})</span></span>
                    <span className="font-semibold">Rp {shippingCost.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-indigo-200 pt-2">
                    <span className="font-bold text-gray-800">Total Pembayaran</span>
                    <span className="text-lg font-black text-indigo-700">
                      Rp {(designPrice !== null ? grandTotal : shippingCost).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* -- Metode Pembayaran ---------------------------------------- */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard size={15} className="text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Metode Pembayaran</span>
            </div>
            <div className="flex flex-col gap-2">

              {/* BCA */}
              <button
                type="button"
                onClick={() => setField("paymentMethod", "bca")}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  form.paymentMethod === "bca"
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                    : "border-gray-200 bg-gray-50 hover:border-indigo-200"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">Transfer BCA</p>
                  <p className="text-xs text-gray-400">Bank Central Asia</p>
                </div>
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                  form.paymentMethod === "bca" ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                }`} />
              </button>

              {/* BCA detail — copy rekening */}
              <AnimatePresence>
                {form.paymentMethod === "bca" && (
                  <motion.div
                    key="bca-detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 rounded-xl bg-blue-50 p-4">
                      <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-400">Rekening BCA</p>
                      <p className="text-xs text-gray-500">{BCA_NAME}</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span className="text-lg font-black tracking-widest text-gray-900">{BCA_ACCOUNT}</span>
                        <button
                          type="button"
                          onClick={handleCopyRekening}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            copied
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {copied ? <><Check size={12} /> Tersalin</> : <><Copy size={12} /> Salin</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* QRIS */}
              <button
                type="button"
                onClick={() => setField("paymentMethod", "qris")}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                  form.paymentMethod === "qris"
                    ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                    : "border-gray-200 bg-gray-50 hover:border-indigo-200"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">QRIS</p>
                  <p className="text-xs text-gray-400">Scan QR dari semua aplikasi e-wallet &amp; m-banking</p>
                </div>
                <div className={`h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                  form.paymentMethod === "qris" ? "border-indigo-600 bg-indigo-600" : "border-gray-300"
                }`} />
              </button>

              {/* QRIS detail — download */}
              <AnimatePresence>
                {form.paymentMethod === "qris" && (
                  <motion.div
                    key="qris-detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 flex flex-col items-center gap-3 rounded-xl bg-indigo-50 p-4">
                      <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                        <QrCode size={64} className="text-gray-400" />
                      </div>
                      <p className="text-center text-xs text-gray-500">Scan QR di atas atau unduh untuk membayar</p>
                      <button
                        type="button"
                        onClick={handleDownloadQris}
                        className="flex items-center gap-2 rounded-xl bg-sumi px-5 py-2.5 text-sm font-semibold text-washi transition-colors hover:bg-usuzumi active:bg-kuro"
                      >
                        <Download size={14} /> Unduh QRIS
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
            {errors.paymentMethod && <p className="mt-2 text-xs text-red-500">{errors.paymentMethod}</p>}
          </div>

          {/* -- Submit -------------------------------------------------- */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-xl bg-sumi py-4 text-sm font-bold text-washi shadow-md transition-colors hover:bg-usuzumi"
          >
            Konfirmasi Pesanan
          </motion.button>

        </form>
      </div>
    </div>
  );
}


