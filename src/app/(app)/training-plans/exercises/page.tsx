import { Dumbbell, Plus, Search, Video, Trash2, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { getExercises, createExercise, deleteExercise } from "@/features/training-plans/exercise-actions";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "Master Exercise Library | Sports Performance Platform",
  description: "Bank data gerakan dan latihan terpusat untuk organisasi.",
};

export default async function ExerciseLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const exercises = await getExercises();

  const query = (params.q ?? "").toLowerCase();
  const selectedCategory = params.category ?? "ALL";

  const categories = Array.from(new Set(exercises.map((e) => e.category).filter(Boolean))) as string[];

  const filteredExercises = exercises.filter((ex) => {
    const matchesQ = !query || ex.name.toLowerCase().includes(query) || (ex.description && ex.description.toLowerCase().includes(query));
    const matchesCat = selectedCategory === "ALL" || ex.category === selectedCategory;
    return matchesQ && matchesCat;
  });

  async function handleCreate(formData: FormData) {
    "use server";
    await createExercise(formData);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      await deleteExercise(id);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Header & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <Link href="/training-plans" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Program Latihan
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Master Exercise Library</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Dumbbell className="h-6 w-6 text-primary" />
            Master Exercise Library
          </h1>
          <p className="text-xs text-muted mt-1">
            Bank data gerakan terpusat. Gerakan yang ada di sini dapat digunakan kembali di seluruh program latihan tanpa mengetik ulang.
          </p>
        </div>

        {/* Add Exercise Trigger / Quick Action */}
        <details className="group relative">
          <summary className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-sm list-none">
            <Plus className="h-4 w-4" />
            Tambah Gerakan Master
          </summary>
          <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl bg-surface-1 p-5 border border-border shadow-xl z-30 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Tambah Gerakan Baru
            </h3>
            <form action={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Nama Gerakan *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Misal: Bulgarian Split Squat"
                  className="w-full rounded-md bg-surface-2 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Kategori</label>
                <input
                  type="text"
                  name="category"
                  placeholder="Misal: Strength, Plyometrics, Core"
                  className="w-full rounded-md bg-surface-2 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Deskripsi / Keterangan</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Keterangan fokus gerakan / instruksi pelaksanaan"
                  className="w-full rounded-md bg-surface-2 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted block mb-1">Link Video Tutorial (Opsional)</label>
                <input
                  type="url"
                  name="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-md bg-surface-2 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Simpan ke Library
                </button>
              </div>
            </form>
          </div>
        </details>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-1 p-3 rounded-xl border border-border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Cari nama gerakan..."
            defaultValue={params.q ?? ""}
            className="w-full rounded-lg bg-surface-2 border border-border pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Category Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Link
            href="/training-plans/exercises"
            className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === "ALL"
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-surface-2 text-muted hover:text-foreground"
            }`}
          >
            Semua ({exercises.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/training-plans/exercises?category=${encodeURIComponent(cat)}`}
              className={`px-3 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-surface-2 text-muted hover:text-foreground"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-surface-1/50">
          <Layers className="mx-auto h-10 w-10 text-muted/60" />
          <h3 className="mt-3 text-sm font-semibold text-foreground">Tidak Ada Gerakan</h3>
          <p className="mt-1 text-xs text-muted">
            Belum ada gerakan master yang sesuai dengan pencarian. Silakan tambah gerakan baru di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="group rounded-xl bg-surface-1 border border-border/80 p-4 hover:border-primary/50 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                    {ex.name}
                  </h3>
                  {ex.category && (
                    <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {ex.category}
                    </span>
                  )}
                </div>

                {ex.description ? (
                  <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                    {ex.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted/50 italic mt-2">Tidak ada deskripsi</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                {ex.videoUrl ? (
                  <a
                    href={ex.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-[11px]"
                  >
                    <Video className="h-3.5 w-3.5" /> Video Tutorial
                  </a>
                ) : (
                  <span className="text-[11px] text-muted">Bisa digunakan di program</span>
                )}

                <form action={handleDelete}>
                  <input type="hidden" name="id" value={ex.id} />
                  <button
                    type="submit"
                    title="Hapus dari Master Library"
                    className="text-muted hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
