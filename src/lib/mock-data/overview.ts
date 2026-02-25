import { OverviewStats } from "@/types";

export const overviewStats: OverviewStats = {
  totalEntities: 6,
  totalIndividuals: 8,
  totalApplications: 8,
  pendingReviews: 3,
  activeAlerts: 4,
  completedToday: 2,
  riskDistribution: { low: 8, medium: 2, high: 3, critical: 2 },
  applicationsByStatus: {
    pending: 1,
    in_review: 2,
    approved: 3,
    rejected: 1,
    escalated: 1,
  },
  recentActivity: [
    { id: "act_01", type: "application_submitted", description: "New KYC application submitted for Yuki Tanaka", entityId: "ind_06", entityName: "Yuki Tanaka", timestamp: "2026-02-20T08:30:00Z" },
    { id: "act_02", type: "alert_triggered", description: "OFAC SDN sanctions match detected for Carlos Mendes", entityId: "ind_07", entityName: "Carlos Silva Mendes", timestamp: "2025-12-20T14:00:00Z" },
    { id: "act_03", type: "review_completed", description: "Annual ODD review completed for Meridian Capital Partners", entityId: "ent_01", entityName: "Meridian Capital Partners LLC", timestamp: "2025-11-20T16:45:00Z" },
    { id: "act_04", type: "risk_changed", description: "Risk score increased from 28 to 42 for Nordic Timber Group", entityId: "ent_02", entityName: "Nordic Timber Group AS", timestamp: "2025-10-15T09:00:00Z" },
    { id: "act_05", type: "entity_created", description: "New entity onboarded: Bavaria Pharma GmbH", entityId: "ent_06", entityName: "Bavaria Pharma GmbH", timestamp: "2024-04-01T07:00:00Z" },
    { id: "act_06", type: "alert_triggered", description: "Unusual transaction pattern detected for Al-Rashid Trading", entityId: "ent_03", entityName: "Al-Rashid Trading Company WLL", timestamp: "2025-11-14T15:30:00Z" },
    { id: "act_07", type: "document_uploaded", description: "2024 Audited Financials uploaded for Meridian Capital Partners", entityId: "ent_01", entityName: "Meridian Capital Partners LLC", timestamp: "2025-02-15T14:30:00Z" },
    { id: "act_08", type: "review_completed", description: "Annual ODD review completed for Bavaria Pharma GmbH", entityId: "ent_06", entityName: "Bavaria Pharma GmbH", timestamp: "2025-09-20T13:00:00Z" },
  ],
  complianceScore: 87,
};
