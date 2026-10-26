export type AgentId =
  | 'patient-feedback'
  | 'patient-experience'
  | 'complaint-triage'
  | 'hospital-manager'
  | 'healthcare-analytics'
  | 'routing-capacity';

export type AgentStatus = 'idle' | 'selected' | 'processing' | 'completed' | 'error';

export interface PatientRecord {
  id: string;
  patientName?: string; // Synthetic de-identified identifier e.g. "PT-8821"
  age: number;
  ageGroup: 'Pediatric Caregiver' | 'Adult' | 'Senior';
  gender: string;
  persona: string;
  visitType: 'Specialty Care' | 'Primary Care' | 'Telehealth' | 'Emergency Department';
  serviceLine: string; // e.g. Cardiology, Pediatrics, Emergency, Oncology, Orthopedics, Family Medicine
  satisfaction: number; // 1 to 5 scale
  communicationRating: number; // 1 to 5 scale
  followUpCompliance: boolean;
  complaintSeverity: 'Low' | 'Moderate' | 'High' | 'Critical';
  patientPortalUsage: 'Active' | 'Infrequent' | 'Never' | 'Blocked';
  readmissionRisk: 'Low' | 'Moderate' | 'High';
  aiRiskFlag: 'None' | 'Hallucination Risk' | 'Bias Review' | 'Human Review Required';
  comment: string;
  timestamp: string;
}

export interface AgentMetadata {
  id: AgentId;
  roomNumber: string;
  roomName: string;
  name: string;
  title: string;
  role: string;
  avatarSeed: string;
  primaryColor: string;
  accentBg: string;
  shortDescription: string;
  tasksOverview: string[];
  systemPrompt: string;
}

// 1. Patient Feedback Insight
export interface FeedbackInsightResult {
  recordId: string;
  theme:
    | 'Communication'
    | 'Scheduling'
    | 'Wait Time'
    | 'Technology / Patient Portal'
    | 'Billing'
    | 'Clinical Care'
    | 'Discharge / Follow-Up'
    | 'Accessibility / Equity'
    | 'Mixed or Ambiguous';
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  reasoning: string;
  operationalIssue: string;
  riskOrBiasConcern: string;
  recommendedAction: string;
  rawComment: string;
}

// 2. Patient Experience Monitoring
export interface ExperienceMonitoringResult {
  recordId: string;
  primaryTheme: string;
  secondaryThemes: string[];
  operationalIssue: string;
  equityReview: {
    flagged: boolean;
    groupConcern: string; // e.g. Older adult, Rural patient, Disability, Limited English Proficiency, Low digital literacy
    details: string;
  };
  riskAssessment: {
    overallRisk: 'Low' | 'Moderate' | 'High';
    patientSafety: 'Low' | 'Moderate' | 'High';
    reputational: 'Low' | 'Moderate' | 'High';
    compliance: 'Low' | 'Moderate' | 'High';
    equity: 'Low' | 'Moderate' | 'High';
    explanation: string;
  };
  managerialRecommendation: string;
  rawComment: string;
}

// 3. Complaint Triage Assistant
export interface ComplaintTriageResult {
  recordId: string;
  primaryCategory:
    | 'Communication'
    | 'Scheduling'
    | 'Wait Time'
    | 'Technology / Patient Portal'
    | 'Billing'
    | 'Clinical Care'
    | 'Patient Safety'
    | 'Privacy or Security'
    | 'Staff Conduct'
    | 'Other';
  secondaryCategories: string[];
  severityLevel: 'LEVEL 1 – Low' | 'LEVEL 2 – Moderate' | 'LEVEL 3 – High' | 'LEVEL 4 – Critical';
  severityReasoning: string;
  riskDetection: {
    risks: string[]; // e.g. Patient Safety Risk, Clinical Risk, Compliance Risk, Privacy Risk, Accessibility Risk, Equity Risk, Reputational Risk, Operational Risk
    explanation: string;
  };
  escalationRoute:
    | 'Patient Experience Team'
    | 'Nursing Leadership'
    | 'Physician Leadership'
    | 'Quality Improvement Team'
    | 'Compliance Office'
    | 'Information Technology'
    | 'Revenue Cycle / Billing'
    | 'Accessibility Coordinator'
    | 'Risk Management'
    | 'Executive Review';
  humanInterventionRequired: boolean;
  slaTargetHours: number;
  rawComment: string;
}

// 4. Hospital Manager Decision Support
export interface ManagerDecisionResult {
  recordId: string;
  mainProblem: string;
  priority: 'Low' | 'Medium' | 'High';
  priorityReasoning: string;
  recommendedActions: string[];
  humanReviewNeeded: boolean;
  aiRiskFlagAssessment: string;
  serviceLine: string;
  visitType: string;
  readmissionRisk: string;
  rawComment: string;
}

// 5. Healthcare Analytics
export interface AnalyticsAgentResult {
  executiveOverview: {
    totalComments: number;
    avgSatisfaction: number;
    avgCommunication: number;
    followUpComplianceRate: number; // percentage
    serviceLinesCount: number;
  };
  satisfactionInsights: {
    distribution: { score: number; count: number; percentage: number }[];
    byServiceLine: { serviceLine: string; avgScore: number; count: number }[];
    byVisitType: { visitType: string; avgScore: number; count: number }[];
    byPersona: { persona: string; avgScore: number; count: number }[];
  };
  nlpAnalysis: {
    topThemes: { theme: string; count: number; percentage: number }[];
    frequentKeywords: { keyword: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[];
    wordCloud: { text: string; value: number; category: string }[];
  };
  hiddenProblems: {
    highComplaintServiceLines: { serviceLine: string; complaintRate: number; keyFactor: string }[];
    communicationBottlenecks: string[];
    technologyIssues: string[];
    schedulingIssues: string[];
    waitTimeComplaints: string[];
  };
  aiRiskMonitoring: {
    hallucinationTraps: { recordId: string; comment: string; note: string }[];
    biasRelatedComments: { recordId: string; comment: string; equityNote: string }[];
    casesRequiringHumanReview: { recordId: string; reason: string; severity: string }[];
  };
  executiveRecommendations: {
    topPriorities: string[];
    quickWins: string[]; // < 3 months
    longTermAIOpportunities: string[]; // 6-12 months
  };
}

// 6. Routing & Capacity Agent
export interface RoutingCapacityResult {
  crossTabulation: {
    matrix: {
      visitType: 'Specialty Care' | 'Primary Care' | 'Telehealth' | 'Emergency Department';
      pediatricCount: number;
      adultCount: number;
      seniorCount: number;
      total: number;
      capacityRisk: 'Normal' | 'Moderate' | 'Critical';
    }[];
    ageTotals: {
      pediatric: number;
      adult: number;
      senior: number;
      total: number;
    };
  };
  caseRoutings: {
    recordId: string;
    visitType: string;
    ageGroup: string;
    departmentOwner: string; // e.g. Emergency Pediatrics, Senior Specialty Services, Adult Telehealth Operations
    capacityFlag: 'Normal' | 'Capacity Strain' | 'Equipment Mismatch' | 'Staffing Shortage';
    capacityDetails: string;
    managerialDirective: string;
  }[];
  departmentalDirectives: {
    department: string;
    status: 'Nominal' | 'Watch' | 'Urgent Reallocation';
    directive: string;
    recommendedStaffing: string;
  }[];
}

// Combined cross-agent insights
export interface CombinedInsights {
  multiAgentCorroborated: {
    title: string;
    agentsInvolved: AgentId[];
    finding: string;
    impactLevel: 'High' | 'Critical' | 'Medium';
    evidenceIds: string[];
  }[];
  conflictingInterpretations: {
    recordId: string;
    topic: string;
    agentA: { agentId: AgentId; claim: string };
    agentB: { agentId: AgentId; claim: string };
    recommendedResolution: string;
  }[];
  prioritizedRisks: {
    rank: number;
    issue: string;
    affectedArea: string;
    severity: 'Critical' | 'High' | 'Moderate';
    suggestedMitigation: string;
  }[];
  humanReviewQueue: {
    id: string;
    recordId: string;
    patientId: string;
    flaggedBy: AgentId[];
    primaryReason: string;
    aiFinding: string;
    evidenceQuote: string;
    humanDecisionStatus: 'Pending Review' | 'Approved' | 'Escalated' | 'Dismissed';
    humanNotes?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  }[];
  nextActions: {
    timeline: 'Immediate (24-48h)' | 'Short Term (1-4w)' | 'Strategic (1-3m)';
    action: string;
    ownerRole: string;
    sourceAgent: AgentId;
  }[];
  missingDataWarnings: string[];
}

export interface AgentExecutionState {
  agentId: AgentId;
  status: AgentStatus;
  progress: number; // 0 to 100
  currentStep: string;
  estimatedRemainingStages: string[];
  logs: string[];
  newlyGeneratedPreview?: string;
  completedAt?: string;
  error?: string;
  options: {
    depth: 'standard' | 'deep';
    priorityThreshold: 'all' | 'high-only';
    customPromptAppend?: string;
  };
}

export interface AnalysisOutputBundle {
  feedbackResults?: FeedbackInsightResult[];
  experienceResults?: ExperienceMonitoringResult[];
  triageResults?: ComplaintTriageResult[];
  managerResults?: ManagerDecisionResult[];
  analyticsResult?: AnalyticsAgentResult;
  routingResult?: RoutingCapacityResult;
  combinedInsights: CombinedInsights;
  timestamp: string;
}

export type ScreenTab =
  | 'virtual-office'
  | 'upload-data'
  | 'configure-agents'
  | 'live-processing'
  | 'agent-results'
  | 'executive-dashboard';
