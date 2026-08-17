import { Badge } from "@/components/ui/badge";
import type { ScheduleStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  ScheduleStatus,
  { label: string; variant: "accent" | "success" | "danger" | "warning" | "outline" }
> = {
  SCHEDULED: {
    label: "Terjadwal",
    variant: "accent",
  },
  COMPLETED: {
    label: "Selesai",
    variant: "success",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "outline",
  },
  NO_SHOW: {
    label: "Tidak Hadir",
    variant: "danger",
  },
};

export function ScheduleStatusBadge({ status }: { status: ScheduleStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;

  return (
    <Badge variant={config.variant} className="text-[10px]">
      {config.label}
    </Badge>
  );
}
