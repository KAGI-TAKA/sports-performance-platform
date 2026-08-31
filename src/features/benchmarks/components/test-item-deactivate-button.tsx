"use client";

import { useState } from "react";
import { deactivateTestItem } from "./../actions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface TestItemDeactivateButtonProps {
  testItemId: string;
  itemName: string;
}

export function TestItemDeactivateButton({ testItemId, itemName }: TestItemDeactivateButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDeactivate() {
    if (!confirm(`Yakin ingin menonaktifkan item tes "${itemName}"? Data hasil tes yang sudah ada tetap aman.`)) return;
    setLoading(true);
    const result = await deactivateTestItem(testItemId);
    setLoading(false);
    
    if (result.success) {
      toast.success("Item tes dinonaktifkan");
    } else {
      toast.error(result.error ?? "Gagal menonaktifkan item tes");
    }
  }

  return (
    <button
      onClick={handleDeactivate}
      disabled={loading}
      className="flex h-6 w-6 items-center justify-center rounded text-muted hover:text-danger hover:bg-danger/10 transition border border-transparent hover:border-danger/20 disabled:opacity-50"
      title="Hapus / Nonaktifkan item tes"
    >
      <Trash2 className="h-3 w-3" />
    </button>
  );
}
