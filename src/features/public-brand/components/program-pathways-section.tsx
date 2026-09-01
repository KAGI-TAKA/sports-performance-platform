import Image from "next/image";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { APP_CONFIG } from "@/lib/constants";

export function ProgramPathwaysSection() {
  return (
    <section id="programs" className="py-16 sm:py-24 bg-[#0A101D] text-white border-b border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            Target &amp; Jalur Pembinaan
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            WHO WE HELP
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Different stages of development require different approaches. Kami membagi program ke dalam dua kelompok utama agar setiap anak berlatih sesuai fase kesiapan dan tujuan perkembangannya.
          </p>
        </div>

        {/* Dual Pathways Grid */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 items-stretch">
          {/* Pathway A: Multilateral Athletic Development */}
          <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/90 overflow-hidden flex flex-col justify-between shadow-xl hover:border-emerald-500 transition duration-300 group">
            <div>
              {/* Authentic Photo */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <Image
                  src="/images/landing/training-action-2.jpg"
                  alt="Multilateral Athletic Development Training"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                
                {/* Floating Pathway Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white bg-emerald-600 px-3 py-1 rounded-full shadow-md">
                    PROGRAM 01
                  </span>
                  <span className="text-xs font-semibold text-emerald-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40">
                    Fondasi Gerak &amp; Physical Literacy
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-1.5">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    MULTILATERAL ATHLETIC DEVELOPMENT
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Program untuk anak yang masih membangun fundamental movement dan physical literacy, terutama pada tahap awal perkembangan.
                  </p>
                </div>

                {/* Focus Badge */}
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs flex items-center gap-2">
                  <span className="font-bold text-emerald-400">
                    Fokus:
                  </span>
                  <span className="font-medium text-slate-200">
                    Move → Explore → Learn → Develop
                  </span>
                </div>

                {/* Who is this for? */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Cocok untuk anak yang:
                  </span>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {[
                      "Belum memiliki spesialisasi cabang olahraga tertentu",
                      "Masih mengembangkan basic movement skills dan kontrol tubuh",
                      "Membutuhkan peningkatan koordinasi gerak dan keseimbangan",
                      "Ingin mengenal berbagai variasi aktivitas olahraga secara positif",
                      "Membutuhkan fondasi gerak sebelum masuk ke tahap sport-specific training",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Developed Capacities */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Kemampuan yang Dikembangkan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Running",
                      "Jumping",
                      "Landing",
                      "Throwing",
                      "Catching",
                      "Balance",
                      "Coordination",
                      "Agility",
                      "Body Control",
                      "Basic Strength",
                    ].map((cap) => (
                      <span
                        key={cap}
                        className="text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-md"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Multilateral Athletic Development")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>EXPLORE MFD</span>
                </button>
              </a>
              <a
                href="#pricing"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white text-center py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
              >
                Lihat Biaya Sesi →
              </a>
            </div>
          </div>

          {/* Pathway B: Youth Athlete Performance */}
          <div className="rounded-3xl border border-blue-500/40 bg-slate-900/90 overflow-hidden flex flex-col justify-between shadow-xl hover:border-blue-500 transition duration-300 group">
            <div>
              {/* Authentic Photo */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                <Image
                  src="/images/landing/training-action-1.jpg"
                  alt="Youth Athlete Performance Training"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                
                {/* Floating Pathway Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white bg-blue-600 px-3 py-1 rounded-full shadow-md">
                    PROGRAM 02
                  </span>
                  <span className="text-xs font-semibold text-blue-300 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-blue-500/40">
                    Physical Qualities for Sport
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="space-y-1.5">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                    YOUTH ATHLETE PERFORMANCE
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Program untuk anak dan remaja yang sudah memiliki basic atau spesialisasi olahraga tertentu dan ingin meningkatkan physical performance.
                  </p>
                </div>

                {/* Focus Badge */}
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-xs flex items-center gap-2">
                  <span className="font-bold text-blue-400">
                    Fokus:
                  </span>
                  <span className="font-medium text-slate-200">
                    Prepare → Develop → Perform
                  </span>
                </div>

                {/* Who is this for? */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Cocok untuk atlet yang:
                  </span>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {[
                      "Sudah aktif berlatih dalam cabang olahraga tertentu (Sepak Bola, Basket, dll.)",
                      "Ingin meningkatkan physical performance penunjang cabor",
                      "Membutuhkan physical preparation dan penguatan kapasitas fisik",
                      "Ingin mengasah speed, power, strength, agility, atau conditioning",
                      "Mempersiapkan turnamen kompetitif, seleksi tim, atau fase bertanding",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Developed Capacities */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Kemampuan yang Dikembangkan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Acceleration",
                      "Sprint Mechanics",
                      "Speed",
                      "Strength",
                      "Power",
                      "Change of Direction",
                      "Deceleration",
                      "Jump & Landing",
                      "Conditioning",
                      "Sport-Specific Preparation",
                    ].map((cap) => (
                      <span
                        key={cap}
                        className="text-xs font-medium text-blue-300 bg-blue-950/60 border border-blue-800/50 px-2.5 py-0.5 rounded-md"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={APP_CONFIG.whatsappInquiryTemplate("Youth Athlete Performance")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-white" />
                  <span>EXPLORE ATHLETE PERFORMANCE</span>
                </button>
              </a>
              <a
                href="#pricing"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white text-center py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
              >
                Lihat Biaya Sesi →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
