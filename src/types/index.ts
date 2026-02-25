// ── Common ──────────────────────────────────────────────────────────────────

export type Status = "active" | "inactive" | "pending" | "suspended" | "archived";
export type ReviewStatus = "pending" | "in_review" | "approved" | "rejected" | "escalated";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type KycStatus = "not_started" | "in_progress" | "verified" | "failed" | "expired";
export type ApplicationType = "kyc" | "kyb" | "aml";

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ── Overview ────────────────────────────────────────────────────────────────

export interface OverviewStats {
  totalEntities: number;
  totalIndividuals: number;
  totalApplications: number;
  pendingReviews: number;
  activeAlerts: number;
  completedToday: number;
  riskDistribution: { low: number; medium: number; high: number; critical: number };
  applicationsByStatus: Record<ReviewStatus, number>;
  recentActivity: ActivityEvent[];
  complianceScore: number;
}

export interface ActivityEvent {
  id: string;
  type: "application_submitted" | "review_completed" | "alert_triggered" | "entity_created" | "risk_changed" | "document_uploaded";
  description: string;
  entityId?: string;
  entityName?: string;
  timestamp: string;
}

// ── Entities (KYB) ──────────────────────────────────────────────────────────

export interface Entity extends Timestamps {
  id: string;
  name: string;
  legalName: string;
  type: "corporation" | "llc" | "partnership" | "trust" | "non_profit" | "sole_proprietorship";
  status: Status;
  riskLevel: RiskLevel;
  riskScore: number;
  country: string;
  registrationNumber: string;
  taxId?: string;
  incorporationDate: string;
  industry: string;
  website?: string;
  address: Address;
  contacts: ContactInfo[];
  beneficialOwners: BeneficialOwner[];
  documents: Document[];
  tags: string[];
  notes?: string;
  assignedTo?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface BeneficialOwner {
  id: string;
  individualId?: string;
  name: string;
  ownershipPercentage: number;
  controlType: "direct" | "indirect";
  nationality: string;
  verified: boolean;
}

export interface Document {
  id: string;
  type: "passport" | "drivers_license" | "national_id" | "utility_bill" | "bank_statement" | "certificate_of_incorporation" | "articles_of_association" | "proof_of_address" | "tax_return" | "financial_statement";
  name: string;
  status: "pending" | "verified" | "rejected" | "expired";
  uploadedAt: string;
  expiresAt?: string;
  url?: string;
}

// ── Individuals (KYC) ───────────────────────────────────────────────────────

export interface Individual extends Timestamps {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  status: Status;
  kycStatus: KycStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  address: Address;
  documents: Document[];
  pepStatus: boolean;
  sanctionsHit: boolean;
  adverseMedia: boolean;
  sourceOfFunds?: string;
  occupation?: string;
  employer?: string;
  entityIds: string[];
  tags: string[];
  notes?: string;
  assignedTo?: string;
  lastScreeningDate?: string;
}

// ── Applications ────────────────────────────────────────────────────────────

export interface Application extends Timestamps {
  id: string;
  type: ApplicationType;
  status: ReviewStatus;
  applicantType: "individual" | "entity";
  applicantId: string;
  applicantName: string;
  workflowId: string;
  workflowName: string;
  currentStepIndex: number;
  steps: ApplicationStep[];
  riskLevel?: RiskLevel;
  riskScore?: number;
  assignedTo?: string;
  reviewNotes?: string;
  submittedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface ApplicationStep {
  id: string;
  name: string;
  type:
    | "introduction_page"
    | "personal_information"
    | "contact_information"
    | "legal_residences"
    | "document_collection"
    | "identity_verification"
    | "address_verification"
    | "sanctions_screening"
    | "pep_check"
    | "adverse_media"
    | "risk_assessment"
    | "manual_review"
    | "biometric_check"
    | "business_verification"
    | "ubo_verification";
  status: ReviewStatus;
  result?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
}

// ── Configure ───────────────────────────────────────────────────────────────

export interface Configuration {
  general: GeneralConfig;
  compliance: ComplianceConfig;
  notifications: NotificationConfig;
  integrations: IntegrationConfig;
}

export interface GeneralConfig {
  companyName: string;
  defaultCountry: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  autoApproveThreshold: number;
  sessionTimeoutMinutes: number;
}

export interface ComplianceConfig {
  enablePepScreening: boolean;
  enableSanctionsScreening: boolean;
  enableAdverseMedia: boolean;
  enableTransactionMonitoring: boolean;
  documentExpiryDays: number;
  reviewExpiryDays: number;
  kycRenewalMonths: number;
  highRiskCountries: string[];
  sanctionsLists: string[];
}

export interface NotificationConfig {
  emailNotifications: boolean;
  slackIntegration: boolean;
  slackWebhookUrl?: string;
  alertOnHighRisk: boolean;
  alertOnSanctionsHit: boolean;
  alertOnPepMatch: boolean;
  dailyDigest: boolean;
  digestRecipients: string[];
}

export interface IntegrationConfig {
  idVerificationProvider: string;
  sanctionsProvider: string;
  pepProvider: string;
  adverseMediaProvider: string;
  documentVerificationProvider: string;
}

// ── KYC Workflows ───────────────────────────────────────────────────────────

export interface KycWorkflow extends Timestamps {
  id: string;
  name: string;
  description: string;
  type: ApplicationType;
  themeId?: string;
  flowLayout?: "split" | "steps_top";
  status: Status;
  version: number;
  isDefault: boolean;
  applicantType: "individual" | "entity" | "both";
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  tags: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: ApplicationStep["type"];
  order: number;
  required: boolean;
  config: Record<string, unknown>;
  timeoutHours?: number;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "in";
  value: string | number | string[];
  action: "skip_step" | "add_step" | "escalate" | "reject" | "flag";
  targetStepId?: string;
}

// ── Risk Scoring ────────────────────────────────────────────────────────────

export interface RiskScoringModel extends Timestamps {
  id: string;
  name: string;
  description: string;
  status: Status;
  version: number;
  isDefault: boolean;
  maxScore: number;
  thresholds: RiskThresholds;
  categories: RiskCategory[];
}

export interface RiskThresholds {
  low: { min: number; max: number };
  medium: { min: number; max: number };
  high: { min: number; max: number };
  critical: { min: number; max: number };
}

export interface RiskCategory {
  id: string;
  name: string;
  weight: number;
  factors: RiskFactor[];
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  score: number;
  condition: string;
}

// ── Risk Monitoring ─────────────────────────────────────────────────────────

export interface RiskAlert extends Timestamps {
  id: string;
  type: "sanctions_hit" | "pep_match" | "adverse_media" | "risk_score_change" | "unusual_activity" | "document_expired" | "screening_match";
  severity: RiskLevel;
  status: "open" | "investigating" | "resolved" | "dismissed";
  entityType: "individual" | "entity";
  entityId: string;
  entityName: string;
  title: string;
  description: string;
  source: string;
  assignedTo?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolution?: string;
}

export interface MonitoringRule extends Timestamps {
  id: string;
  name: string;
  description: string;
  status: Status;
  type: "continuous" | "periodic";
  frequency?: "daily" | "weekly" | "monthly" | "quarterly";
  conditions: Record<string, unknown>[];
  actions: ("alert" | "escalate" | "suspend" | "block")[];
  lastRunAt?: string;
  nextRunAt?: string;
}

// ── ODD (Ongoing Due Diligence) ─────────────────────────────────────────────

export interface OddCase extends Timestamps {
  id: string;
  entityType: "individual" | "entity";
  entityId: string;
  entityName: string;
  status: "scheduled" | "in_progress" | "pending_review" | "completed" | "overdue";
  riskLevel: RiskLevel;
  triggerType: "scheduled" | "event_driven" | "manual";
  triggerReason?: string;
  dueDate: string;
  assignedTo?: string;
  findings: OddFinding[];
  previousReviewDate?: string;
  nextReviewDate?: string;
  completedAt?: string;
}

export interface OddFinding {
  id: string;
  category: "risk_change" | "adverse_media" | "sanctions" | "pep" | "financial" | "ownership_change" | "regulatory";
  severity: RiskLevel;
  description: string;
  recommendation: string;
  resolved: boolean;
  createdAt: string;
}

export interface OddSchedule extends Timestamps {
  id: string;
  name: string;
  riskLevel: RiskLevel;
  frequencyMonths: number;
  entityType: "individual" | "entity" | "both";
  autoTrigger: boolean;
  checks: string[];
  status: Status;
}

// ── Properties ──────────────────────────────────────────────────────────────

export interface CustomProperty extends Timestamps {
  id: string;
  name: string;
  label: string;
  description?: string;
  type: "text" | "number" | "boolean" | "date" | "select" | "multi_select" | "email" | "phone" | "url" | "country";
  entityType: "individual" | "entity" | "application" | "transaction";
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: PropertyOption[];
  validation?: PropertyValidation;
  order: number;
  status: Status;
  group?: string;
}

export interface PropertyOption {
  label: string;
  value: string;
}

export interface PropertyValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

// ── Transactions ────────────────────────────────────────────────────────────

export interface Transaction extends Timestamps {
  id: string;
  type: "wire_transfer" | "ach" | "crypto" | "card_payment" | "cash_deposit" | "cash_withdrawal" | "internal_transfer";
  status: "pending" | "completed" | "flagged" | "blocked" | "reversed";
  amount: number;
  currency: string;
  direction: "inbound" | "outbound";
  senderName: string;
  senderId?: string;
  senderAccount?: string;
  senderCountry: string;
  receiverName: string;
  receiverId?: string;
  receiverAccount?: string;
  receiverCountry: string;
  reference?: string;
  riskFlags: string[];
  riskScore: number;
  screeningResult?: "clear" | "hit" | "pending";
  narrative?: string;
}

// ── Themes ──────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  id: string;
  name: string;
  isActive: boolean;
  branding: BrandingConfig;
  colors: ColorConfig;
  typography: TypographyConfig;
  components: ComponentThemeConfig;
  updatedAt: string;
}

export interface BrandingConfig {
  logoUrl?: string;
  faviconUrl?: string;
  companyName: string;
  tagline?: string;
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily: string;
  baseFontSize: string;
  headingWeight: string;
}

export interface ComponentThemeConfig {
  borderRadius: string;
  buttonStyle: "rounded" | "pill" | "square";
  cardShadow: "none" | "sm" | "md" | "lg";
  inputStyle: "outline" | "filled" | "underline";
}

// ── Developer Tools ─────────────────────────────────────────────────────────

export interface ApiKey extends Timestamps {
  id: string;
  name: string;
  key: string;
  prefix: string;
  status: Status;
  environment: "production" | "sandbox";
  permissions: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdBy: string;
}

export interface Webhook extends Timestamps {
  id: string;
  url: string;
  description: string;
  status: Status;
  events: string[];
  secret: string;
  version: "v1" | "v2";
  failureCount: number;
  lastTriggeredAt?: string;
  lastResponseCode?: number;
}

export interface ApiLog {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  statusCode: number;
  duration: number;
  apiKeyId: string;
  apiKeyName: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}
