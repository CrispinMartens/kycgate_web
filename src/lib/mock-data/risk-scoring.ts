import { RiskScoringModel } from "@/types";

export const riskScoringModels: RiskScoringModel[] = [
  {
    id: "rsm_01",
    name: "Individual Risk Model",
    description: "Standard risk scoring model for individuals. Factors include geography, PEP status, sanctions exposure, source of funds, and occupation risk.",
    status: "active",
    version: 4,
    isDefault: true,
    maxScore: 100,
    thresholds: {
      low: { min: 0, max: 25 },
      medium: { min: 26, max: 50 },
      high: { min: 51, max: 75 },
      critical: { min: 76, max: 100 },
    },
    categories: [
      {
        id: "rc_01",
        name: "Geographic Risk",
        weight: 25,
        factors: [
          { id: "rf_01_01", name: "High-risk country nationality", description: "Applicant holds nationality from a high-risk jurisdiction", score: 25, condition: "nationality IN high_risk_countries" },
          { id: "rf_01_02", name: "High-risk country residence", description: "Applicant resides in a high-risk jurisdiction", score: 20, condition: "country_of_residence IN high_risk_countries" },
          { id: "rf_01_03", name: "Cross-border activity", description: "Nationality and residence country differ", score: 5, condition: "nationality != country_of_residence" },
        ],
      },
      {
        id: "rc_02",
        name: "Political Exposure",
        weight: 25,
        factors: [
          { id: "rf_02_01", name: "Direct PEP", description: "Applicant is a politically exposed person", score: 20, condition: "pep_status == true AND pep_type == direct" },
          { id: "rf_02_02", name: "PEP Family Member", description: "Applicant is a family member of a PEP", score: 15, condition: "pep_status == true AND pep_type == family_member" },
          { id: "rf_02_03", name: "PEP Associate", description: "Applicant is a close associate of a PEP", score: 12, condition: "pep_status == true AND pep_type == associate" },
        ],
      },
      {
        id: "rc_03",
        name: "Screening Results",
        weight: 30,
        factors: [
          { id: "rf_03_01", name: "Sanctions list match", description: "Applicant matches a name on a sanctions list", score: 30, condition: "sanctions_hit == true" },
          { id: "rf_03_02", name: "Adverse media hit", description: "Negative news articles found", score: 15, condition: "adverse_media == true" },
          { id: "rf_03_03", name: "Document verification failure", description: "Identity documents failed verification", score: 20, condition: "document_verification == failed" },
        ],
      },
      {
        id: "rc_04",
        name: "Profile Risk",
        weight: 20,
        factors: [
          { id: "rf_04_01", name: "High-risk occupation", description: "Occupation is in a high-risk category (e.g., money services, gambling)", score: 10, condition: "occupation IN high_risk_occupations" },
          { id: "rf_04_02", name: "Unclear source of funds", description: "Source of funds not adequately explained", score: 15, condition: "source_of_funds == unclear OR source_of_funds == null" },
          { id: "rf_04_03", name: "Cash-intensive business", description: "Primary source of funds involves cash-intensive business", score: 8, condition: "source_of_funds CONTAINS cash" },
        ],
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-09-01T10:00:00Z",
  },
  {
    id: "rsm_02",
    name: "Entity Risk Model",
    description: "Risk scoring model for business entities. Evaluates jurisdiction, industry, corporate structure complexity, UBO transparency, and screening results.",
    status: "active",
    version: 3,
    isDefault: true,
    maxScore: 100,
    thresholds: {
      low: { min: 0, max: 20 },
      medium: { min: 21, max: 50 },
      high: { min: 51, max: 75 },
      critical: { min: 76, max: 100 },
    },
    categories: [
      {
        id: "rc_05",
        name: "Jurisdiction Risk",
        weight: 25,
        factors: [
          { id: "rf_05_01", name: "High-risk incorporation country", description: "Entity incorporated in a high-risk jurisdiction", score: 25, condition: "country IN high_risk_countries" },
          { id: "rf_05_02", name: "Tax haven jurisdiction", description: "Entity incorporated in a known tax haven", score: 15, condition: "country IN tax_haven_countries" },
          { id: "rf_05_03", name: "Multi-jurisdiction operations", description: "Entity operates across 5+ jurisdictions", score: 8, condition: "operating_jurisdictions_count > 5" },
        ],
      },
      {
        id: "rc_06",
        name: "Industry Risk",
        weight: 20,
        factors: [
          { id: "rf_06_01", name: "High-risk industry", description: "Entity operates in gambling, crypto, arms, or similar", score: 20, condition: "industry IN high_risk_industries" },
          { id: "rf_06_02", name: "Cash-intensive industry", description: "Industry involves significant cash transactions", score: 10, condition: "industry IN cash_intensive_industries" },
        ],
      },
      {
        id: "rc_07",
        name: "Corporate Structure",
        weight: 25,
        factors: [
          { id: "rf_07_01", name: "Complex ownership structure", description: "Multiple layers of ownership or nominee arrangements", score: 20, condition: "ownership_layers > 2" },
          { id: "rf_07_02", name: "Unverified UBOs", description: "One or more beneficial owners could not be verified", score: 15, condition: "unverified_ubo_count > 0" },
          { id: "rf_07_03", name: "Bearer shares", description: "Entity has bearer shares outstanding", score: 25, condition: "has_bearer_shares == true" },
          { id: "rf_07_04", name: "Shell company indicators", description: "Entity shows indicators of being a shell company", score: 20, condition: "shell_company_indicators > 2" },
        ],
      },
      {
        id: "rc_08",
        name: "Screening & History",
        weight: 30,
        factors: [
          { id: "rf_08_01", name: "Sanctions match", description: "Entity or UBO matches sanctions list", score: 30, condition: "sanctions_hit == true" },
          { id: "rf_08_02", name: "Adverse media", description: "Negative news coverage about entity or principals", score: 15, condition: "adverse_media == true" },
          { id: "rf_08_03", name: "Regulatory actions", description: "Entity has been subject to regulatory actions or fines", score: 20, condition: "regulatory_actions_count > 0" },
        ],
      },
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-08-15T14:00:00Z",
  },
  {
    id: "rsm_03",
    name: "Transaction Risk Model",
    description: "Risk scoring for individual transactions. Evaluates amount, counterparty risk, geographic risk, and pattern anomalies.",
    status: "active",
    version: 2,
    isDefault: false,
    maxScore: 100,
    thresholds: {
      low: { min: 0, max: 30 },
      medium: { min: 31, max: 55 },
      high: { min: 56, max: 80 },
      critical: { min: 81, max: 100 },
    },
    categories: [
      {
        id: "rc_09",
        name: "Amount Risk",
        weight: 25,
        factors: [
          { id: "rf_09_01", name: "Large transaction", description: "Single transaction exceeding reporting threshold", score: 15, condition: "amount > reporting_threshold" },
          { id: "rf_09_02", name: "Structuring pattern", description: "Multiple transactions just below reporting threshold", score: 25, condition: "structuring_pattern_detected == true" },
        ],
      },
      {
        id: "rc_10",
        name: "Counterparty Risk",
        weight: 30,
        factors: [
          { id: "rf_10_01", name: "Unknown counterparty", description: "Counterparty is not in the system", score: 10, condition: "counterparty_known == false" },
          { id: "rf_10_02", name: "High-risk counterparty", description: "Counterparty has elevated risk profile", score: 20, condition: "counterparty_risk_level IN [high, critical]" },
          { id: "rf_10_03", name: "Sanctioned counterparty", description: "Counterparty matches sanctions list", score: 30, condition: "counterparty_sanctions_hit == true" },
        ],
      },
      {
        id: "rc_11",
        name: "Geographic Risk",
        weight: 25,
        factors: [
          { id: "rf_11_01", name: "High-risk origin/destination", description: "Funds originate from or are sent to high-risk jurisdiction", score: 20, condition: "country IN high_risk_countries" },
          { id: "rf_11_02", name: "Unusual corridor", description: "Transaction corridor is inconsistent with expected activity", score: 10, condition: "unusual_corridor == true" },
        ],
      },
      {
        id: "rc_12",
        name: "Behavioral Risk",
        weight: 20,
        factors: [
          { id: "rf_12_01", name: "Anomalous pattern", description: "Transaction deviates significantly from historical pattern", score: 15, condition: "anomaly_score > 0.8" },
          { id: "rf_12_02", name: "Rapid movement", description: "Funds moved in and out within 24 hours", score: 12, condition: "rapid_movement == true" },
        ],
      },
    ],
    createdAt: "2024-05-01T00:00:00Z",
    updatedAt: "2025-10-20T09:00:00Z",
  },
];
