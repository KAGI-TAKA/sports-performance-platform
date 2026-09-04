"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X, Plus, Users, ChevronRight, Phone, ExternalLink, ShieldCheck } from "lucide-react";
import type { PortalSiblingItem } from "../types";

interface ParentChildBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  childrenList: PortalSiblingItem[];
  selectedChildId: string;
  onSelectChild: (childId: string) => void;
  loadingChild?: boolean;
}

export function ParentChildBottomSheet({
  isOpen,
  onClose,
  childrenList,
  selectedChildId,
  onSelectChild,
  loadingChild = false,
}: ParentChildBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [showAddChildInfo, setShowAddChildInfo] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
        setShowAddChildInfo(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowAddChildInfo(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={() => {
          onClose();
          setShowAddChildInfo(false);
        }}
        aria-hidden="true"
      />

      {/* Sheet / Modal Container */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="child-switcher-title"
        className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131f3c] shadow-2xl p-5 sm:p-6 z-50 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 space-y-4"
      >
        {/* Mobile Pull Bar */}
        <div className="flex justify-center -mt-2 mb-2 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {!showAddChildInfo ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 id="child-switcher-title" className="font-display text-lg font-black text-slate-900 dark:text-white">
                  Pilih Anak
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Siapa yang ingin Anda lihat?
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Children List */}
            <div className="space-y-2.5">
              {childrenList.map((child, idx) => {
                const isSelected = child.id === selectedChildId;
                const initials = child.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                // Status label derivation
                const statusLabel =
                  idx === 0 ? "Progressing Well" : idx === 1 ? "Needs Attention" : "On Track";
                const statusStyle =
                  idx === 0
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : idx === 1
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      onSelectChild(child.id);
                      onClose();
                    }}
                    disabled={loadingChild}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 min-h-[68px] cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500/40"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#182649] hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Photo / Avatar */}
                      <div className="relative shrink-0">
                        {child.photoUrl ? (
                          <img
                            src={child.photoUrl}
                            alt={child.fullName}
                            className="h-12 w-12 rounded-2xl object-cover border-2 border-blue-400/40"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm font-display shadow-xs">
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Bio Info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="font-display font-bold text-sm text-slate-900 dark:text-white truncate block">
                          {child.fullName}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-500">
                            {child.competitionLevel || child.sportCategory || "U-14 • Football"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Radio selection circle */}
                    <div className="shrink-0 pl-2">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border-2 border-slate-300 dark:border-slate-600 bg-transparent"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action button: + Tambah Anak / Hubungi Coach */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAddChildInfo(true)}
                className="w-full py-3 px-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Anak / Hubungi Manajemen</span>
              </button>
            </div>
          </>
        ) : (
          /* Subview: Tambah Anak Info & Alur Pendaftaran */
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Pendaftaran &amp; Penautan Profil Ananda</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddChildInfo(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕ Kembali
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-semibold text-blue-900 dark:text-blue-200">
                Mengapa penambahan anak dilakukan melalui Admin / Pelatih?
              </p>
              <p>
                Demi perlindungan privasi dan validasi data atletik resmi, penautan akun ananda baru wajib diverifikasi oleh tim administrasi akademi Coach Zulfi sebelum tampil di portal ini.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Langkah Cepat Penautan:
              </span>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 dark:text-slate-400">
                <li>Klik tombol WhatsApp di bawah untuk menghubungi tim Admin Akademi.</li>
                <li>Kirimkan nama lengkap ananda dan tanggal lahir.</li>
                <li>Tim akademi akan memverifikasi dan menghubungkan profil ananda secara instan ke portal Anda.</li>
              </ol>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href="https://wa.me/?text=Halo%20Admin%20Akademi%20Coach%20Zulfi,%20saya%20ingin%20mendaftarkan%20atau%20menautkan%20profil%20ananda%20baru%20ke%20dalam%20Portal%20Orang%20Tua."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Phone className="h-4 w-4" />
                <span>Hubungi Admin via WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>

              <button
                type="button"
                onClick={() => setShowAddChildInfo(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Kembali ke Pilih Anak
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
