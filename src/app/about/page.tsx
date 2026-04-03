import Link from "next/link";
import { Clock3, MapPin, ShieldCheck, Sparkles, Truck } from "lucide-react";

const VALUES = [
  {
    title: "Kurasi Original",
    desc: "Setiap pair melalui pengecekan detail sebelum ditampilkan ke katalog.",
    icon: ShieldCheck,
    color: "text-matcha bg-matcha/10",
  },
  {
    title: "Detail Craft",
    desc: "Kami fokus pada kombinasi material, finishing, dan storytelling tiap produk.",
    icon: Sparkles,
    color: "text-indigo bg-indigo/10",
  },
  {
    title: "Pengiriman Aman",
    desc: "Packing berlapis dan tracking aktif sampai produk tiba di tanganmu.",
    icon: Truck,
    color: "text-take bg-take/10",
  },
];

export default function AboutPage() {
  return (
    <div className="jp-theme bg-washi text-sumi">
      <section className="pattern-seigaiha border-b border-sumi/10 px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-hai">Tentang Bogorsneakers</p>
          <h1 className="font-zen text-4xl font-black leading-tight md:text-6xl">
            Sneaker Store
            <br />
            Dengan Sentuhan Jepang
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-usuzumi md:text-base">
            Bogorsneakers lahir dari kultur sneaker lokal Bogor. Kami membawa gaya kurasi yang rapi,
            tenang, dan detail-oriented dengan inspirasi Japanese minimal aesthetic.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
            <div className="rounded-2xl border border-sumi/10 bg-shironeri p-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-hai">Berdiri</p>
              <p className="font-semibold">Sejak 2019</p>
            </div>
            <div className="rounded-2xl border border-sumi/10 bg-shironeri p-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-hai">Lokasi</p>
              <p className="font-semibold">Bogor, Jawa Barat</p>
            </div>
            <div className="rounded-2xl border border-sumi/10 bg-shironeri p-4">
              <p className="mb-1 text-xs uppercase tracking-[0.16em] text-hai">Kurasi</p>
              <p className="font-semibold">240+ model pilihan</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-hai">Nilai Kami</p>
              <h2 className="font-zen text-3xl font-black md:text-4xl">Kenapa Pelanggan Balik Lagi</h2>
            </div>
            <div className="text-sm text-hai">
              Fokus pada kualitas, komunikasi, dan pengalaman belanja yang clear.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {VALUES.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="card-lift rounded-3xl border border-sumi/10 bg-shironeri p-6">
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-usuzumi">{item.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 md:px-10 lg:px-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-sumi/10 bg-shironeri p-6">
            <h3 className="mb-4 font-zen text-2xl font-black">Store Info</h3>
            <div className="space-y-3 text-sm text-usuzumi">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-matcha" />
                Jl. Pajajaran No.88, Bogor, Jawa Barat
              </p>
              <p className="flex items-center gap-2">
                <Clock3 size={16} className="text-indigo" />
                Senin-Jumat 09.00-21.00 · Sabtu-Minggu 10.00-22.00
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-sumi/10 bg-linear-to-br from-sumi to-kuro p-6 text-washi">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-washi/60">Ready to explore</p>
            <h3 className="font-zen text-2xl font-black">Lanjut ke Katalog atau Design Studio</h3>
            <p className="mt-3 text-sm text-washi/70">
              Pilih model favoritmu atau mulai rakit custom dari nol.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/catalog" className="rounded-full bg-washi px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sumi">
                Buka Katalog
              </Link>
              <Link href="/customize" className="rounded-full border border-washi/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-washi">
                Design Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
