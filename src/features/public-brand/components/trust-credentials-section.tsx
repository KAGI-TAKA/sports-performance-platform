import { ShieldCheck, Award, GraduationCap, CheckCircle2 } from "lucide-react";

export function TrustCredentialsSection() {
  return (
    <section className="py-8 bg-slate-900/90 border-y border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
          {/* Credential 1 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sertifikasi Resmi</div>
              <div className="text-[11px] text-slate-400">Physical Conditioning Coach</div>
            </div>
          </div>

          {/* Credential 2 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Sport Science Base</div>
              <div className="text-[11px] text-slate-400">Pendidikan Ilmu Keolahragaan</div>
            </div>
          </div>

          {/* Credential 3 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Youth Development</div>
              <div className="text-[11px] text-slate-400">Pencegahan Risiko Cedera</div>
            </div>
          </div>

          {/* Credential 4 */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Multi-Cabang Olahraga</div>
              <div className="text-[11px] text-slate-400">Sepak Bola, Basket, Raket, Lari</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
