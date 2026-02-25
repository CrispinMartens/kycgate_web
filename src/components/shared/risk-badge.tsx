import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const riskStyles: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
};

export function RiskBadge({ level }: { level: string }) {
  return (
    <Badge variant="outline" className={cn("capitalize", riskStyles[level])}>
      {level}
    </Badge>
  );
}

export function RiskScore({ score, className }: { score: number; className?: string }) {
  const color =
    score <= 25
      ? "text-emerald-600"
      : score <= 50
        ? "text-amber-600"
        : score <= 75
          ? "text-orange-600"
          : "text-red-600";

  return <span className={cn("font-mono font-semibold", color, className)}>{score}</span>;
}
