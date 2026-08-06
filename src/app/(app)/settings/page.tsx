import { requireOrgContext } from "@/lib/auth-context";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const ctx = await requireOrgContext();

  const org = await prisma.organization.findUnique({
    where: { id: ctx.organizationId },
    include: { members: { include: { user: true } } },
  });

  return (
    <div className="p-7 space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-lg font-semibold text-foreground">
          Pengaturan Organisasi & Profil
        </h1>
        <p className="mt-0.5 text-xs text-muted">
          Kelola profil klub/akademi, manajemen pelatih, dan preferensi akun.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold text-foreground border-b border-border pb-2">
          Profil Akademi / Klub
        </h2>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-muted block mb-1">Nama Organisasi</label>
            <div className="font-medium text-foreground bg-surface-2 p-2.5 rounded border border-border">
              {org?.name || "Akademi Olahraga"}
            </div>
          </div>
          <div>
            <label className="text-muted block mb-1">Slug URL</label>
            <div className="font-medium text-foreground bg-surface-2 p-2.5 rounded border border-border">
              {org?.slug}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface-1 p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold text-foreground border-b border-border pb-2">
          Daftar Pelatih & Anggota Akademi
        </h2>

        <div className="space-y-2">
          {org?.members.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-surface-2 p-3 rounded text-xs">
              <div>
                <div className="font-semibold text-foreground">{m.user.name}</div>
                <div className="text-muted">{m.user.email}</div>
              </div>
              <span className="rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
