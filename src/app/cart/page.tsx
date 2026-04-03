"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import GymShoePreview from "@/components/GymShoePreview";

interface CartItem {
  id: number;
  name: string;
  size: string;
  price: number;
  upperColor: string;
  soleColor: string;
  qty: number;
}

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 1,
    name: "Apex Runner Pro",
    size: "42",
    price: 1250000,
    upperColor: "#f5f5f5",
    soleColor: "#8a8a8a",
    qty: 1,
  },
  {
    id: 2,
    name: "Johnny Classic Gym Sneaker",
    size: "41",
    price: 850000,
    upperColor: "#ffffff",
    soleColor: "#b0b6bb",
    qty: 1,
  },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  const updateQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, Math.min(9, item.qty + delta)) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  if (items.length === 0) {
    return (
      <div className="jp-theme pattern-seigaiha flex min-h-[calc(100svh-3.5rem)] items-center justify-center bg-washi px-6 py-12 md:min-h-[calc(100svh-4rem)]">
        <div className="w-full max-w-md rounded-3xl border border-sumi/10 bg-shironeri p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sumi/10 text-sumi">
            <ShoppingBag size={24} />
          </div>
          <h1 className="font-zen text-2xl font-black text-sumi">Keranjang Kosong</h1>
          <p className="mt-3 text-sm text-usuzumi">
            Belum ada produk di keranjang. Yuk pilih sneakers favoritmu dulu.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sumi px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-washi transition-colors hover:bg-usuzumi"
          >
            Buka Katalog <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jp-theme pattern-asanoha bg-washi px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-hai">Cart</p>
          <h1 className="font-zen text-3xl font-black text-sumi md:text-4xl">Keranjang Belanja</h1>
          <p className="mt-2 text-sm text-usuzumi">Review item kamu sebelum lanjut ke checkout.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-sumi/10 bg-shironeri p-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-washi p-1.5 ring-1 ring-sumi/10">
                    <GymShoePreview
                      upperColor={item.upperColor}
                      soleColor={item.soleColor}
                      className="h-full w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-sumi">{item.name}</p>
                    <p className="mt-1 text-xs text-hai">Size {item.size}</p>
                    <p className="mt-2 text-sm font-black text-sumi">
                      Rp {(item.price * item.qty).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-full p-2 text-hai transition-colors hover:bg-sumi/5 hover:text-sumi"
                      aria-label={`Hapus ${item.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                    <div className="flex items-center rounded-full border border-sumi/15 bg-washi px-1">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="rounded-full p-2 text-usuzumi transition-colors hover:bg-sumi/5 hover:text-sumi"
                        aria-label={`Kurangi qty ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-sumi">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="rounded-full p-2 text-usuzumi transition-colors hover:bg-sumi/5 hover:text-sumi"
                        aria-label={`Tambah qty ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-3xl border border-sumi/10 bg-shironeri p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-zen text-xl font-black text-sumi">Ringkasan</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-usuzumi">
                <span>Total Item</span>
                <span className="font-semibold text-sumi">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-usuzumi">
                <span>Subtotal</span>
                <span className="font-semibold text-sumi">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-sumi/10 bg-washi p-3 text-xs text-usuzumi">
              <p className="flex items-center gap-2">
                <Truck size={14} className="text-matcha" />
                Ongkir dihitung di halaman checkout.
              </p>
              <p className="mt-2 flex items-center gap-2">
                <ShieldCheck size={14} className="text-matcha" />
                Pembayaran aman dengan verifikasi manual.
              </p>
            </div>

            <Link
              href={`/checkout?total=${subtotal}&source=cart`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sumi px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-washi transition-colors hover:bg-usuzumi"
            >
              Lanjut Checkout <ArrowRight size={14} />
            </Link>

            <Link
              href="/catalog"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-sumi/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-usuzumi transition-colors hover:bg-sumi/5 hover:text-sumi"
            >
              Tambah Produk Lagi
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
