import { AvailabilityStatus } from "@/types/cv";

interface AvailabilityBadgeProps {
  status?: AvailabilityStatus;
  size?: 'sm' | 'md';
}

export const AVAILABILITY_CONFIG = {
  immediate: {
    label: "Immédiate",
    dotColor: "bg-green-500",
    badgeClass: "bg-green-100 text-green-700",
    dotShadow: "shadow-[0_0_8px_rgba(34,197,94,0.6)]"
  },
  "1_month": {
    label: "Sous 1 mois",
    dotColor: "bg-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-700",
    dotShadow: ""
  },
  "3_months": {
    label: "Sous 3 mois",
    dotColor: "bg-orange-500",
    badgeClass: "bg-orange-100 text-orange-700",
    dotShadow: ""
  },
  unavailable: {
    label: "Indisponible",
    dotColor: "bg-slate-400",
    badgeClass: "bg-slate-100 text-slate-600",
    dotShadow: ""
  }
};

export default function AvailabilityBadge({ status, size = 'md' }: AvailabilityBadgeProps) {
  if (!status) return null;

  const config = AVAILABILITY_CONFIG[status];
  
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${config.dotColor} ${status === 'immediate' ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-medium text-slate-600">{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-sm ${config.badgeClass}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor} ${config.dotShadow} ${status === 'immediate' ? 'animate-pulse' : ''}`} />
      {config.label}
    </div>
  );
}
