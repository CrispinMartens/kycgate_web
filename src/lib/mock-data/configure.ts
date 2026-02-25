import { Configuration } from "@/types";

export const configuration: Configuration = {
  general: {
    companyName: "KYCGate",
    defaultCountry: "US",
    defaultLanguage: "en",
    timezone: "America/New_York",
    dateFormat: "YYYY-MM-DD",
    autoApproveThreshold: 25,
    sessionTimeoutMinutes: 30,
  },
  compliance: {
    enablePepScreening: true,
    enableSanctionsScreening: true,
    enableAdverseMedia: true,
    enableTransactionMonitoring: true,
    documentExpiryDays: 365,
    reviewExpiryDays: 30,
    kycRenewalMonths: 12,
    highRiskCountries: ["AF", "IR", "KP", "SY", "YE", "MM", "RU", "BY", "VE", "CU"],
    sanctionsLists: ["OFAC SDN", "OFAC Consolidated", "EU Sanctions", "UN Sanctions", "UK HMT", "AU DFAT"],
  },
  notifications: {
    emailNotifications: true,
    slackIntegration: true,
    slackWebhookUrl: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    alertOnHighRisk: true,
    alertOnSanctionsHit: true,
    alertOnPepMatch: true,
    dailyDigest: true,
    digestRecipients: ["compliance@kycgate.com", "alerts@kycgate.com"],
  },
  integrations: {
    idVerificationProvider: "onfido",
    sanctionsProvider: "dow_jones",
    pepProvider: "dow_jones",
    adverseMediaProvider: "lexis_nexis",
    documentVerificationProvider: "onfido",
  },
};
