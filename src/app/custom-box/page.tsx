"use client";

import Link from "next/link";
import { Package, ChevronLeft } from "lucide-react";

export default function CustomBoxPage() {
  return (
    <div className="jp-theme flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center bg-linear-to-br from-indigo-50 via-white to-sky-50 px-6 py-12 md:min-h-[calc(100svh-4rem)]">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100">
          <Package size={40} className="text-indigo-600" />
        </div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900">Custom Box</h1>
        <p className="mb-8 text-sm text-gray-500">
          Segera hadir! Tim kami sedang menyiapkan halaman kustom box eksklusif untukmu.
        </p>
        <Link
          href="/customize"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-700"
        >
          <ChevronLeft size={16} /> Kembali ke Desain
        </Link>
      </div>
    </div>
  );
}
