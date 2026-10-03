"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  RotateCcw,
  ExternalLink,
  MapPin,
  MessageCircle,
  Megaphone,
  Layers,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Plus,
  Trash2,
  Globe,
  HelpCircle,
} from "lucide-react";
import type { LandingPageConfig, PricingArea, PricingTier } from "../types";
import { updateLandingPageConfig, resetLandingPageConfigToDefault } from "../actions";
import { Button } from "@/components/ui/button";

interface LandingPageSettingsFormProps {
  initialConfig: LandingPageConfig;
}

export function LandingPageSettingsForm({ initialConfig }: LandingPageSettingsFormProps) {
  const [config, setConfig] = useState<LandingPageConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"pricing" | "contact" | "announcement">("pricing");

  const defaultAreaId = config.pricing.yapAreas[0]?.id || "salatiga";
  const [selectedYapAreaId, setSelectedYapAreaId] = useState<string>(defaultAreaId);
  const [isViewingMfd, setIsViewingMfd] = useState<boolean>(false);

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const activeArea = config.pricing.yapAreas.find((a) => a.id === selectedYapAreaId) || config.pricing.yapAreas[0];

  const handleAddArea = () => {
    const newId = "area-" + Date.now();
    const newAreaNumber = config.pricing.yapAreas.length + 1;
    const newArea: PricingArea = {
      id: newId,
      name: "Area Baru " + newAreaNumber,
      badgeLabel: "Area " + newAreaNumber,
      venueLocation: "Tentukan nama fasilitas lapangan atau gym di sini",
      tiers: [
        {
          id: newId + "-indiv",
          type: "Individual Session",
          price: "Rp200.000",
          unit: "/ session",
          capacity: "1 atlet",
          notes: "Sesi intensif privat 1-on-1 dengan analisis mendalam",
        },
        {
          id: newId + "-duo",
          type: "Duo Session",
          price: "Rp250.000",
          unit: "/ session",
          capacity: "2 athletes",
          notes: "Latihan berpasangan untuk mengasah chemistry fisik",
        },
        {
          id: newId + "-group",
          type: "Group Session",
          price: "Rp350.000",
          unit: "/ session",
          capacity: "Group",
          notes: "Latihan kelompok terstruktur untuk tim atau klub",
        },
      ],
    };

    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        yapAreas: [...prev.pricing.yapAreas, newArea],
      },
    }));

    setSelectedYapAreaId(newId);
    setIsViewingMfd(false);
  };

  const handleDeleteArea = (areaIdToDelete: string) => {
    if (config.pricing.yapAreas.length <= 1) {
      alert("Minimal harus ada 1 wilayah aktif. Anda tidak dapat menghapus semua wilayah.");
      return;
    }

    const areaToDelete = config.pricing.yapAreas.find((a) => a.id === areaIdToDelete);
    if (!window.confirm("Hapus " + (areaToDelete?.name || "Wilayah ini") + " beserta seluruh paket tarifnya?")) {
      return;
    }

    const updatedAreas = config.pricing.yapAreas.filter((a) => a.id !== areaIdToDelete);
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        yapAreas: updatedAreas,
      },
    }));

    if (selectedYapAreaId === areaIdToDelete) {
      setSelectedYapAreaId(updatedAreas[0].id);
    }
  };

  const handleUpdateAreaMeta = (areaId: string, field: "name" | "venueLocation", value: string) => {
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        yapAreas: prev.pricing.yapAreas.map((a) =>
          a.id === areaId ? { ...a, [field]: value } : a
        ),
      },
    }));
  };

  const handleUpdateYapTier = (areaId: string, tierIndex: number, field: keyof PricingTier, value: string) => {
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        yapAreas: prev.pricing.yapAreas.map((a) => {
          if (a.id !== areaId) return a;
          const updatedTiers = [...a.tiers];
          updatedTiers[tierIndex] = { ...updatedTiers[tierIndex], [field]: value };
          return { ...a, tiers: updatedTiers };
        }),
      },
    }));
  };

  const handleAddYapTier = (areaId: string) => {
    const newTier: PricingTier = {
      id: "tier-" + Date.now(),
      type: "Paket Sesi Baru",
      price: "Rp200.000",
      unit: "/ session",
      capacity: "1-2 atlet",
      notes: "Keterangan target latihan dan spesifikasi paket",
    };

    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        yapAreas: prev.pricing.yapAreas.map((a) => {
          if (a.id !== areaId) return a;
          return { ...a, tiers: [...a.tiers, newTier] };
        }),
      },
    }));
  };

  const handleDeleteYapTier = (areaId: string, tierIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        yapAreas: prev.pricing.yapAreas.map((a) => {
          if (a.id !== areaId) return a;
          if (a.tiers.length <= 1) {
            alert("Minimal harus ada 1 paket tarif dalam wilayah ini.");
            return a;
          }
          return { ...a, tiers: a.tiers.filter((_, idx) => idx !== tierIndex) };
        }),
      },
    }));
  };

  const handleUpdateMfdTier = (tierIndex: number, field: keyof PricingTier, value: string) => {
    setConfig((prev) => {
      const updated = [...prev.pricing.mfdPricing];
      updated[tierIndex] = { ...updated[tierIndex], [field]: value };
      return {
        ...prev,
        pricing: { ...prev.pricing, mfdPricing: updated },
      };
    });
  };

  const handleAddMfdTier = () => {
    const newTier: PricingTier = {
      id: "mfd-" + Date.now(),
      type: "Paket Sesi MFD",
      price: "Rp100.000",
      unit: "/ session",
      capacity: "1 anak",
      notes: "Sesi stimulasi literasi gerak dasar anak",
    };
    setConfig((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, mfdPricing: [...prev.pricing.mfdPricing, newTier] },
    }));
  };

  const handleDeleteMfdTier = (tierIndex: number) => {
    if (config.pricing.mfdPricing.length <= 1) {
      alert("Minimal harus ada 1 paket tarif MFD.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        mfdPricing: prev.pricing.mfdPricing.filter((_, idx) => idx !== tierIndex),
      },
    }));
  };

  const handleSave = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await updateLandingPageConfig(config);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Seluruh perubahan nama wilayah, tarif, kontak, dan banner berhasil disimpan! Halaman depan kini langsung menampilkan data terbaru ini.",
        });
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Gagal menyimpan perubahan. Silakan coba lagi.",
        });
      }
    });
  };

  const handleReset = () => {
    if (!window.confirm("Kembalikan seluruh pengaturan ke nilai standar default awal?")) {
      return;
    }
    setStatusMessage(null);
    startTransition(async () => {
      const res = await resetLandingPageConfigToDefault();
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Pengaturan berhasil direset ke standar default awal.",
        });
        window.location.reload();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Gagal mereset konfigurasi.",
        });
      }
    });
  };

  return (
    <div className="space-y-6 select-none">
      {/* ── Explanatory System Guidance Card ─────────────────────────────── */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span>Panduan Penggunaan Editor Halaman Depan</span>
        </div>
        <p className="text-xs sm:text-sm text-secondary leading-relaxed">
          Halaman ini memberi Anda <strong>kebebasan penuh</strong> untuk menyesuaikan apa pun yang tampil di halaman depan website Coach Zulfi. Anda tidak hanya bisa mengganti angka harga, tetapi juga <strong>bisa memasukkan sendiri nama wilayah/kota baru</strong> (misal ekspansi ke Solo, Jogja, atau penamaan khusus), mengatur lokasi lapangan, hingga memasang pengumuman jadwal latihan.
        </p>
      </div>

      {/* Top Banner Status Notification */}
      {statusMessage && (
        <div
          className={"p-4 rounded-xl border flex items-start gap-3 text-sm animate-in fade-in-50 duration-200 " + (
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          )}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{statusMessage.text}</div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer " + (
            activeTab === "pricing"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Pricelist & Wilayah Bebas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer " + (
            activeTab === "contact"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          )}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Kontak & Lokasi Venue</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("announcement")}
          className={"flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer " + (
            activeTab === "announcement"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-muted hover:text-foreground hover:bg-surface-2"
          )}
        >
          <Megaphone className="h-4 w-4" />
          <span>Banner Pengumuman</span>
          {config.announcement.enabled && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/#pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-secondary hover:text-foreground hover:bg-surface-2 transition border border-border"
          >
            <span>Lihat Halaman Depan</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ── TAB 1: PRICELIST & DYNAMIC AREAS ─────────────────────────────── */}
      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-2/40 p-4 space-y-1.5 text-xs text-muted leading-relaxed">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-500" />
              Kelola Wilayah &amp; Tarif Secara Dinamis:
            </span>
            <p>
              Di bawah ini Anda dapat memilih wilayah yang ingin diedit, <strong>mengubah nama wilayah</strong> sesuka hati (misal: <em>Area Salatiga</em>, <em>Area Semarang</em>, atau menambah kota baru), menentukan tarif masing-masing sesi, serta menambah atau menghapus paket. Di halaman depan, calon klien akan disajikan tombol pemilih wilayah secara otomatis.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-2/70 border border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                Daftar Wilayah Operasional Aktif (YAP):
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleAddArea}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Wilayah / Cabang Baru</span>
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {config.pricing.yapAreas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    setSelectedYapAreaId(area.id);
                    setIsViewingMfd(false);
                  }}
                  className={"flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border " + (
                    !isViewingMfd && selectedYapAreaId === area.id
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-surface-1 border-border text-secondary hover:text-foreground hover:bg-surface-3"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{area.name}</span>
                </button>
              ))}

              <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={() => setIsViewingMfd(true)}
                className={"flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border " + (
                  isViewingMfd
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                    : "bg-surface-1 border-border text-secondary hover:text-foreground hover:bg-surface-3"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Multilateral (MFD)</span>
              </button>
            </div>
          </div>

          {!isViewingMfd && activeArea && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-500/30 bg-surface-1 p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-500 block">
                      Konfigurasi Identitas Wilayah
                    </span>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {activeArea.name}
                    </h3>
                  </div>

                  {config.pricing.yapAreas.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteArea(activeArea.id)}
                      className="text-xs text-red-500 hover:bg-red-500/10 hover:border-red-500/40 border-border inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Wilayah Ini</span>
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                      Nama Wilayah / Cabang (Tampil di Tombol Halaman Depan)
                    </label>
                    <input
                      type="text"
                      value={activeArea.name}
                      onChange={(e) => handleUpdateAreaMeta(activeArea.id, "name", e.target.value)}
                      placeholder="Contoh: Area Salatiga, Area Semarang, Cabang Solo"
                      className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <p className="text-[11px] text-muted">
                      Nama ini yang akan muncul sebagai tombol pilihan wilayah di halaman depan.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                      Keterangan Fasilitas / Venue Lapangan Wilayah Ini
                    </label>
                    <input
                      type="text"
                      value={activeArea.venueLocation || ""}
                      onChange={(e) =>
                        handleUpdateAreaMeta(activeArea.id, "venueLocation", e.target.value)
                      }
                      placeholder="Contoh: Lapangan Atletik Kridanggo Salatiga"
                      className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <p className="text-[11px] text-muted">
                      Memberikan kejelasan kepada orang tua mengenai lokasi sesi fisik diadakan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Daftar Paket Sesi untuk {activeArea.name}:
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddYapTier(activeArea.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Paket Sesi</span>
                  </Button>
                </div>

                {activeArea.tiers.map((tier, tIdx) => (
                  <div
                    key={tier.id || tIdx}
                    className="rounded-2xl border border-border bg-surface-1 p-5 space-y-4 shadow-2xs hover:border-accent/40 transition"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2 text-xs font-mono font-bold text-muted">
                          0{tIdx + 1}
                        </span>
                        <h4 className="font-display font-bold text-sm text-foreground">
                          {tier.type}
                        </h4>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-secondary border border-border">
                          {tier.capacity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-500 font-bold">{tier.price}</span>
                        {activeArea.tiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteYapTier(activeArea.id, tIdx)}
                            className="p-1 rounded text-muted hover:text-red-500 transition cursor-pointer"
                            title="Hapus paket ini"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                          Nama Paket Sesi
                        </label>
                        <input
                          type="text"
                          value={tier.type}
                          onChange={(e) =>
                            handleUpdateYapTier(activeArea.id, tIdx, "type", e.target.value)
                          }
                          className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                          Nominal Harga
                        </label>
                        <input
                          type="text"
                          value={tier.price}
                          onChange={(e) =>
                            handleUpdateYapTier(activeArea.id, tIdx, "price", e.target.value)
                          }
                          placeholder="Contoh: Rp200.000"
                          className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                            Satuan
                          </label>
                          <input
                            type="text"
                            value={tier.unit}
                            onChange={(e) =>
                              handleUpdateYapTier(activeArea.id, tIdx, "unit", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                            Kapasitas
                          </label>
                          <input
                            type="text"
                            value={tier.capacity}
                            onChange={(e) =>
                              handleUpdateYapTier(activeArea.id, tIdx, "capacity", e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                        Deskripsi Catatan & Target Atlet
                      </label>
                      <textarea
                        rows={2}
                        value={tier.notes}
                        onChange={(e) =>
                          handleUpdateYapTier(activeArea.id, tIdx, "notes", e.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2 text-xs text-secondary leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isViewingMfd && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Program Multilateral Athletic Development (MFD)
                  </h3>
                  <p className="text-xs text-muted">
                    Paket pelatihan fondasi gerak dasar untuk anak.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddMfdTier}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Paket MFD</span>
                </Button>
              </div>

              {config.pricing.mfdPricing.map((tier, mIdx) => (
                <div
                  key={tier.id || mIdx}
                  className="rounded-2xl border border-border bg-surface-1 p-5 space-y-4 shadow-2xs hover:border-emerald-500/40 transition"
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2 text-xs font-mono font-bold text-muted">
                        0{mIdx + 1}
                      </span>
                      <h4 className="font-display font-bold text-sm text-foreground">
                        {tier.type}
                      </h4>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-surface-2 text-secondary border border-border">
                        {tier.capacity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-500 font-bold">{tier.price}</span>
                      {config.pricing.mfdPricing.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMfdTier(mIdx)}
                          className="p-1 rounded text-muted hover:text-red-500 transition cursor-pointer"
                          title="Hapus paket ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                        Nama Paket Sesi
                      </label>
                      <input
                        type="text"
                        value={tier.type}
                        onChange={(e) => handleUpdateMfdTier(mIdx, "type", e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                        Nominal Harga
                      </label>
                      <input
                        type="text"
                        value={tier.price}
                        onChange={(e) => handleUpdateMfdTier(mIdx, "price", e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                          Satuan
                        </label>
                        <input
                          type="text"
                          value={tier.unit}
                          onChange={(e) => handleUpdateMfdTier(mIdx, "unit", e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                          Kapasitas
                        </label>
                        <input
                          type="text"
                          value={tier.capacity}
                          onChange={(e) => handleUpdateMfdTier(mIdx, "capacity", e.target.value)}
                          className="w-full rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                      Deskripsi Catatan & Target Atlet
                    </label>
                    <textarea
                      rows={2}
                      value={tier.notes}
                      onChange={(e) => handleUpdateMfdTier(mIdx, "notes", e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2 text-xs text-secondary leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CONTACT & LOCATIONS ──────────────────────────────────── */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-2/40 p-4 space-y-1.5 text-xs text-muted leading-relaxed">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-emerald-500" />
              Menghubungkan Pengunjung Langsung ke WhatsApp Anda:
            </span>
            <p>
              Setiap kali pengunjung mengklik tombol <strong>Konsultasi WA</strong> atau <strong>Daftar Paket</strong> di website, browser mereka akan langsung membuka aplikasi WhatsApp yang mengarah ke nomor di bawah ini dengan pesan pembuka otomatis.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 space-y-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MessageCircle className="h-4 w-4 text-emerald-500" />
              <h3 className="font-display text-sm font-semibold text-foreground">
                Kontak WhatsApp & Media Sosial
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                  Nomor WhatsApp Utama (Format Internasional: 62xxx)
                </label>
                <input
                  type="text"
                  value={config.contact.whatsappNumber}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, whatsappNumber: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="628886602440"
                />
                <p className="text-[11px] text-muted">
                  Gunakan awalan 62 tanpa tanda tambah (+), tanda strip (-), atau spasi.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                  Username Instagram
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-muted">
                    <Globe className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={config.contact.instagram}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, instagram: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-surface-2/60 pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="@zulficoach"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                Link URL Lengkap Instagram
              </label>
              <input
                type="url"
                value={config.contact.instagramUrl}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    contact: { ...prev.contact, instagramUrl: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="https://www.instagram.com/zulficoach/"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ANNOUNCEMENT BANNER ───────────────────────────────────── */}
      {activeTab === "announcement" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-surface-2/40 p-4 space-y-1.5 text-xs text-muted leading-relaxed">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Info className="h-4 w-4 text-amber-500" />
              Memberi Notifikasi Penting Tanpa Mengubah Tata Letak:
            </span>
            <p>
              Banner pengumuman akan tampil di baris teratas website (di atas bilah menu). Aktifkan fitur ini jika ada pembukaan pendaftaran batch baru, perubahan jadwal tes fisik, atau pengumuman libur sesi.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-1 p-5 sm:p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-amber-500" />
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Status Banner Pengumuman
                </h3>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-semibold text-muted">
                  {config.announcement.enabled ? "Banner Sedang Aktif" : "Banner Sedang Nonaktif"}
                </span>
                <input
                  type="checkbox"
                  checked={config.announcement.enabled}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: {
                        ...prev.announcement,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 relative" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                  Label Badge (Singkat)
                </label>
                <input
                  type="text"
                  value={config.announcement.badge}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: {
                        ...prev.announcement,
                        badge: e.target.value,
                      },
                    }))
                  }
                  placeholder="PENGUMUMAN / INFO JADWAL / PROMO"
                  className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
                  Teks Pesan Pengumuman
                </label>
                <input
                  type="text"
                  value={config.announcement.text}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      announcement: {
                        ...prev.announcement,
                        text: e.target.value,
                      },
                    }))
                  }
                  placeholder="Contoh: Pendaftaran Tes Fisik Atletik Batch Baru Salatiga & Semarang Resmi Dibuka!"
                  className="w-full rounded-xl border border-border bg-surface-2/60 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <Info className="h-3.5 w-3.5 text-accent" />
                <span>Pratinjau Banner Seperti yang Akan Dilihat Pengunjung:</span>
              </div>
              <div className="rounded-lg bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                    {config.announcement.badge || "PENGUMUMAN"}
                  </span>
                  <span>{config.announcement.text || "Tuliskan pesan Anda..."}</span>
                </div>
                <span className="text-[11px] underline opacity-90 shrink-0">Lihat Detail ➔</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isPending}
          className="w-full sm:w-auto text-xs text-muted hover:text-red-500 hover:border-red-500/40 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          <span>Kembalikan ke Nilai Default Awal</span>
        </Button>

        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 font-bold shadow-md cursor-pointer"
        >
          <Save className="h-4 w-4 mr-2" />
          <span>{isPending ? "Menyimpan ke Halaman Depan..." : "Simpan Perubahan Halaman Depan"}</span>
        </Button>
      </div>
    </div>
  );
}
