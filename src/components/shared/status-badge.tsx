import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  suspended: { label: "Suspended", variant: "destructive" },
  archived: { label: "Archived", variant: "secondary" },
  in_review: { label: "In Review", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  escalated: { label: "Escalated", variant: "destructive" },
  verified: { label: "Verified", variant: "default" },
  not_started: { label: "Not Started", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "outline" },
  failed: { label: "Failed", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
  completed: { label: "Completed", variant: "default" },
  flagged: { label: "Flagged", variant: "destructive" },
  blocked: { label: "Blocked", variant: "destructive" },
  reversed: { label: "Reversed", variant: "secondary" },
  clear: { label: "Clear", variant: "default" },
  hit: { label: "Hit", variant: "destructive" },
  open: { label: "Open", variant: "outline" },
  investigating: { label: "Investigating", variant: "outline" },
  resolved: { label: "Resolved", variant: "default" },
  dismissed: { label: "Dismissed", variant: "secondary" },
  scheduled: { label: "Scheduled", variant: "outline" },
  pending_review: { label: "Pending Review", variant: "outline" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
