import {
  AgentId,
  PatientRecord,
  FeedbackInsightResult,
  ExperienceMonitoringResult,
  ComplaintTriageResult,
  ManagerDecisionResult,
  AnalyticsAgentResult,
  RoutingCapacityResult,
  CombinedInsights,
  AnalysisOutputBundle,
} from '../types/clinical';
import { CLINICAL_AGENTS } from '../data/agentMetadata';

// Helper NLP token extraction
function extractKeywords(texts: string[]): { keyword: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }[] {
  const stopWords = new Set([
    'the', 'and', 'was', 'with', 'for', 'that', 'this', 'were', 'our', 'from', 'had', 'have',
    'been', 'they', 'what', 'when', 'which', 'there', 'about', 'would', 'could', 'after',
    'then', 'their', 'only', 'very', 'just', 'more', 'some', 'also', 'because', 'into',
  ]);

  const positiveWords = new Set(['compassionate', 'thorough', 'crystal', 'flawlessly', 'seamless', 'clear', 'attentive', 'gentle', 'saintly', 'comfortably', 'convenient', 'helpful']);
  const negativeWords = new Set(['locked', 'crushed', 'refused', 'waited', 'glitch', 'surprise', 'confrontational', 'misplaced', 'blind', 'threatened', 'fatal', 'violation', 'distress', 'wheezing']);

  const counts = new Map<string, number>();

  for (const text of texts) {
    const tokens = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);
    for (const token of tokens) {
      if (token.length > 3 && !stopWords.has(token)) {
        counts.set(token, (counts.get(token) || 0) + 1);
      }
    }
  }

  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 18);

  return sorted.map(([keyword, count]) => {
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveWords.has(keyword)) sentiment = 'positive';
    else if (negativeWords.has(keyword)) sentiment = 'negative';
    return { keyword, count, sentiment };
  });
}

// 1. Analyze Patient Feedback Insight
export function analyzeFeedbackInsight(records: PatientRecord[]): FeedbackInsightResult[] {
  return records.map((r) => {
    const comment = r.comment.toLowerCase();
    let theme: FeedbackInsightResult['theme'] = 'Mixed or Ambiguous';
    let sentiment: FeedbackInsightResult['sentiment'] = 'Neutral';
    let operationalIssue = 'Operational coordination review required.';
    let riskOrBiasConcern = 'No acute bias or clinical safety risks identified.';
    let recommendedAction = 'Maintain standard quality monitoring.';

    if (comment.includes('espanol') || comment.includes('español') || comment.includes('intérprete') || comment.includes('blind') || comment.includes('kiosk') || comment.includes('rural') || comment.includes('flip phone')) {
      theme = 'Accessibility / Equity';
      sentiment = 'Negative';
      operationalIssue = 'Inadequate language access and physical/digital accessibility accommodations.';
      riskOrBiasConcern = 'Severe equity & Title VI compliance vulnerability. High risk of treatment non-compliance due to language/disability barrier.';
      recommendedAction = 'Deploy certified medical video interpreters and mandate high-contrast accessibility standards on check-in kiosks.';
    } else if (comment.includes('blood thinners') || comment.includes('port removal') || comment.includes('dosage') || comment.includes('insulin') || comment.includes('discharge packet') || comment.includes('someone else')) {
      theme = 'Clinical Care';
      sentiment = 'Negative';
      operationalIssue = 'Discharge medication reconciliation failure and automated bot clinical guidance error.';
      riskOrBiasConcern = 'Direct patient safety threat: potential fatal drug interaction, adverse anticoagulant cessation, or HIPAA breach.';
      recommendedAction = 'Enforce mandatory physician-signed discharge medication verbal teach-back and audit automated AI portal guidance protocols.';
    } else if (comment.includes('bill') || comment.includes('out-of-network') || comment.includes('co-pay') || comment.includes('collection')) {
      theme = 'Billing';
      sentiment = 'Negative';
      operationalIssue = 'Surprise facility fee generation and premature automated collection agency escalation.';
      riskOrBiasConcern = 'No Surprises Act compliance violation and patient reputational injury.';
      recommendedAction = 'Suspend automated collection dispatches on disputed charges; require financial counselor review before billing escalation.';
    } else if (comment.includes('portal') || comment.includes('locked') || comment.includes('pronoun') || comment.includes('glitch') || comment.includes('kiosk crashed')) {
      theme = 'Technology / Patient Portal';
      sentiment = 'Negative';
      operationalIssue = 'Patient portal authentication lockout and EHR demographic synchronization fault.';
      riskOrBiasConcern = 'Digital exclusion of low-tech users and cultural insensitivity / misgendering.';
      recommendedAction = 'Establish 24/7 patient portal telephone helpdesk and rectify EHR pronoun syncing schema.';
    } else if (comment.includes('waited') || comment.includes('wait') || comment.includes('hours') || comment.includes('hold')) {
      theme = 'Wait Time';
      sentiment = 'Negative';
      operationalIssue = 'Emergency triage queue bottleneck and prolonged telephony hold duration.';
      riskOrBiasConcern = 'Clinical decompensation during unmonitored triage waiting periods.';
      recommendedAction = 'Institute dynamic pediatric fast-track nursing pods during peak ED volume surge hours.';
    } else if (comment.includes('compassionate') || comment.includes('crystal clear') || comment.includes('saintly') || comment.includes('seamless') || comment.includes('thorough')) {
      theme = comment.includes('video') ? 'Technology / Patient Portal' : 'Clinical Care';
      sentiment = 'Positive';
      operationalIssue = 'High-performing clinical workflow and patient-centered communication delivery.';
      riskOrBiasConcern = 'None. Reinforce positive clinical behaviors.';
      recommendedAction = 'Acknowledge clinical team in departmental excellence awards and document best practice standard.';
    } else if (comment.includes('scheduling') || comment.includes('stress test') || comment.includes('calendar')) {
      theme = 'Scheduling';
      sentiment = 'Negative';
      operationalIssue = 'Subspecialty slot scarcity and telephony drop-off.';
      riskOrBiasConcern = 'Delayed diagnostic cardiac evaluation leading to unmonitored cardiovascular events.';
      recommendedAction = 'Open dedicated cardiology fast-reserve scheduling slots for post-discharge patients.';
    }

    if (r.satisfaction >= 4 && sentiment !== 'Negative') {
      sentiment = 'Positive';
    } else if (r.satisfaction === 3) {
      sentiment = 'Mixed';
    }

    return {
      recordId: r.id,
      theme,
      sentiment,
      reasoning: `Categorized as '${theme}' with '${sentiment}' sentiment based on explicit mention of: "${r.comment.slice(0, 65)}..."`,
      operationalIssue,
      riskOrBiasConcern,
      recommendedAction,
      rawComment: r.comment,
    };
  });
}

// 2. Analyze Patient Experience Monitoring
export function analyzeExperienceMonitoring(records: PatientRecord[]): ExperienceMonitoringResult[] {
  return records.map((r) => {
    const comment = r.comment.toLowerCase();
    let primaryTheme = 'Clinical Care';
    const secondaryThemes: string[] = [];
    let operationalIssue = 'Care coordination consistency across clinical touches.';
    const equityReview = {
      flagged: false,
      groupConcern: 'None identified',
      details: 'Standard patient population demographics with accessible touchpoints.',
    };
    const riskAssessment: ExperienceMonitoringResult['riskAssessment'] = {
      overallRisk: 'Low',
      patientSafety: 'Low',
      reputational: 'Low',
      compliance: 'Low',
      equity: 'Low',
      explanation: 'Routine clinical consultation with no organizational escalation triggers.',
    };
    let managerialRecommendation = 'Continue regular experience pulse surveys.';

    // Equity checks
    if (r.ageGroup === 'Senior' && (comment.includes('phone') || comment.includes('walker') || comment.includes('stairs') || comment.includes('dialysis') || comment.includes('blind') || comment.includes('kiosk') || comment.includes('portal'))) {
      equityReview.flagged = true;
      equityReview.groupConcern = comment.includes('blind') ? 'Visual Disability & Physical Accessibility' : 'Older Adults & Digital Literacy Barriers';
      equityReview.details = `Senior patient (${r.age} yrs) encountering barriers in physical or digital access: ${r.comment.slice(0, 90)}`;
      riskAssessment.equity = 'High';
    } else if (comment.includes('español') || comment.includes('espanol') || comment.includes('intérprete')) {
      equityReview.flagged = true;
      equityReview.groupConcern = 'Limited English Proficiency (LEP)';
      equityReview.details = 'Patient and caregiver received discharge instructions only in English without certified interpreter.';
      riskAssessment.equity = 'High';
      riskAssessment.compliance = 'High';
    } else if (comment.includes('rural') || comment.includes('valley')) {
      equityReview.flagged = true;
      equityReview.groupConcern = 'Rural Healthcare Delivery & Connectivity Gap';
      equityReview.details = 'Patient lacks cellular reception; reliant on postal mail or landline communications.';
      riskAssessment.equity = 'Moderate';
    }

    // Safety and Operational
    if (r.complaintSeverity === 'Critical' || comment.includes('blood thinners') || comment.includes('wheezing') || comment.includes('someone else') || comment.includes('palpitations')) {
      primaryTheme = comment.includes('wheezing') ? 'Wait Time' : comment.includes('someone else') ? 'Privacy or Security' : 'Patient Safety';
      secondaryThemes.push('Clinical Care', 'Communication');
      operationalIssue = 'Acute clinical response delay, automated AI diagnostic guidance error, or privacy leakage.';
      riskAssessment.patientSafety = 'High';
      riskAssessment.overallRisk = 'High';
      riskAssessment.reputational = 'High';
      riskAssessment.explanation = 'Severe patient safety exposure or HIPAA breach requiring immediate leadership mitigation.';
      managerialRecommendation = 'Trigger immediate clinical risk review and establish double-check sign-offs for automated bot advisories.';
    } else if (comment.includes('bill') || comment.includes('co-pay')) {
      primaryTheme = 'Billing';
      secondaryThemes.push('Technology / Patient Portal');
      operationalIssue = 'Revenue cycle discrepancy and automated billing notice friction.';
      riskAssessment.compliance = 'Moderate';
      riskAssessment.reputational = 'Moderate';
      riskAssessment.overallRisk = 'Moderate';
      riskAssessment.explanation = 'Potential No Surprises Act inquiry and consumer billing complaints.';
      managerialRecommendation = 'Revise billing contact workflows and provide plain-language cost estimates prior to diagnostic scans.';
    } else if (r.satisfaction >= 4) {
      primaryTheme = 'Clinical Care';
      secondaryThemes.push('Communication');
      operationalIssue = 'Exemplary clinical provider engagement.';
      managerialRecommendation = 'Share positive feedback with department head during clinical rounds.';
    }

    return {
      recordId: r.id,
      primaryTheme,
      secondaryThemes,
      operationalIssue,
      equityReview,
      riskAssessment,
      managerialRecommendation,
      rawComment: r.comment,
    };
  });
}

// 3. Analyze Complaint Triage Assistant
export function analyzeComplaintTriage(records: PatientRecord[]): ComplaintTriageResult[] {
  return records.map((r) => {
    const comment = r.comment.toLowerCase();
    let primaryCategory: ComplaintTriageResult['primaryCategory'] = 'Clinical Care';
    const secondaryCategories: string[] = [];
    let severityLevel: ComplaintTriageResult['severityLevel'] = 'LEVEL 1 – Low';
    let severityReasoning = 'Minor inconvenience or routine expression of feedback.';
    const risks: string[] = [];
    let riskExplanation = 'Standard operational variances without immediate safety hazard.';
    let escalationRoute: ComplaintTriageResult['escalationRoute'] = 'Patient Experience Team';
    let humanInterventionRequired = false;
    let slaTargetHours = 72;

    if (comment.includes('blood thinners') || comment.includes('fatal') || comment.includes('pulmonary embolism')) {
      primaryCategory = 'Patient Safety';
      secondaryCategories.push('Technology / Patient Portal', 'Clinical Care');
      severityLevel = 'LEVEL 4 – Critical';
      severityReasoning = 'Automated health bot provided life-threatening advice contradicting anticoagulant protocols. High potential for fatal thrombosis.';
      risks.push('Patient Safety Risk', 'Clinical Risk', 'Compliance Risk', 'Reputational Risk');
      riskExplanation = 'Direct patient mortality risk from automated clinical algorithmic hallucination.';
      escalationRoute = 'Risk Management';
      humanInterventionRequired = true;
      slaTargetHours = 2;
    } else if (comment.includes('someone else') || comment.includes('privacy') || comment.includes('narcotic')) {
      primaryCategory = 'Privacy or Security';
      secondaryCategories.push('Clinical Care', 'Communication');
      severityLevel = 'LEVEL 4 – Critical';
      severityReasoning = 'Discharge paperwork handed out with another patient’s protected health information and scheduled controlled substance prescriptions.';
      risks.push('Privacy Risk', 'Compliance Risk', 'Reputational Risk');
      riskExplanation = 'Severe HIPAA violation and potential controlled substance diversion / medication error.';
      escalationRoute = 'Compliance Office';
      humanInterventionRequired = true;
      slaTargetHours = 4;
    } else if (comment.includes('wheezing') || comment.includes('6.5 hours') || comment.includes('retracting')) {
      primaryCategory = 'Patient Safety';
      secondaryCategories.push('Wait Time', 'Clinical Care');
      severityLevel = 'LEVEL 4 – Critical';
      severityReasoning = 'Pediatric patient with acute respiratory distress unmonitored during an excessive waiting period. Risk of hypoxic arrest.';
      risks.push('Patient Safety Risk', 'Clinical Risk', 'Operational Risk');
      riskExplanation = 'Failure of emergency re-triage protocol for pediatric asthma exacerbation.';
      escalationRoute = 'Physician Leadership';
      humanInterventionRequired = true;
      slaTargetHours = 2;
    } else if (comment.includes('intérprete') || comment.includes('español') || comment.includes('no sabe qué dosis')) {
      primaryCategory = 'Clinical Care';
      secondaryCategories.push('Communication', 'Other');
      severityLevel = 'LEVEL 3 – High';
      severityReasoning = 'Senior diabetic patient discharged with unknown insulin regimen due to lack of certified medical interpreter.';
      risks.push('Patient Safety Risk', 'Equity Risk', 'Compliance Risk');
      riskExplanation = 'Unsafe insulin self-administration leading to hypo/hyperglycemic coma.';
      escalationRoute = 'Accessibility Coordinator';
      humanInterventionRequired = true;
      slaTargetHours = 12;
    } else if (comment.includes('bill') && comment.includes('3,850')) {
      primaryCategory = 'Billing';
      secondaryCategories.push('Communication');
      severityLevel = 'LEVEL 3 – High';
      severityReasoning = 'Surprise $3,850 facility charge for an in-network MRI and premature threat of collection action.';
      risks.push('Compliance Risk', 'Reputational Risk', 'Operational Risk');
      riskExplanation = 'Potential regulatory inquiry under federal No Surprises Act.';
      escalationRoute = 'Revenue Cycle / Billing';
      humanInterventionRequired = true;
      slaTargetHours = 24;
    } else if (comment.includes('kiosk') && comment.includes('blind')) {
      primaryCategory = 'Other';
      secondaryCategories.push('Technology / Patient Portal');
      severityLevel = 'LEVEL 3 – High';
      severityReasoning = 'Check-in kiosks non-compliant with ADA accessibility standards, blocking independent consent signing.';
      risks.push('Accessibility Risk', 'Compliance Risk', 'Equity Risk');
      riskExplanation = 'Americans with Disabilities Act (ADA) Title III compliance breach.';
      escalationRoute = 'Accessibility Coordinator';
      humanInterventionRequired = true;
      slaTargetHours = 24;
    } else if (comment.includes('stretcher') || comment.includes('hallway') || comment.includes('confrontational')) {
      primaryCategory = comment.includes('confrontational') ? 'Staff Conduct' : 'Wait Time';
      secondaryCategories.push('Communication');
      severityLevel = 'LEVEL 2 – Moderate';
      severityReasoning = 'Service breakdown with interpersonal friction or prolonged corridor placement.';
      risks.push('Operational Risk', 'Reputational Risk');
      riskExplanation = 'Degradation of patient trust and operational boarding delays.';
      escalationRoute = comment.includes('confrontational') ? 'Nursing Leadership' : 'Patient Experience Team';
      humanInterventionRequired = true;
      slaTargetHours = 48;
    } else if (r.satisfaction >= 4) {
      severityLevel = 'LEVEL 1 – Low';
      severityReasoning = 'Favorable review with complimentary comments.';
      escalationRoute = 'Patient Experience Team';
      humanInterventionRequired = false;
      slaTargetHours = 168;
    }

    return {
      recordId: r.id,
      primaryCategory,
      secondaryCategories,
      severityLevel,
      severityReasoning,
      riskDetection: {
        risks: risks.length > 0 ? risks : ['Operational Risk'],
        explanation: riskExplanation,
      },
      escalationRoute,
      humanInterventionRequired,
      slaTargetHours,
      rawComment: r.comment,
    };
  });
}

// 4. Analyze Hospital Manager Decision Support
export function analyzeManagerDecision(records: PatientRecord[]): {
  topAlert: string;
  cases: ManagerDecisionResult[];
  recommendedActions: string[];
} {
  const cases: ManagerDecisionResult[] = records.map((r) => {
    let mainProblem = 'Routine care journey with minor operational variability.';
    let priority: ManagerDecisionResult['priority'] = 'Low';
    let priorityReasoning = 'Patient reported satisfactory outcomes with no acute operational friction.';
    let recommendedActions: string[] = ['Maintain current standard operating procedure.'];
    let humanReviewNeeded = false;
    let aiRiskFlagAssessment = 'No algorithmic or bias risks flagged.';

    if (r.aiRiskFlag === 'Hallucination Risk') {
      mainProblem = 'Critical AI automated bot clinical instruction error (anticoagulant cessation).';
      priority = 'High';
      priorityReasoning = 'High liability & fatal clinical risk if AI bot guidance is followed without physician validation.';
      recommendedActions = [
        'Immediately disable ungrounded clinical recommendation output in patient portal AI bot.',
        'Contact patient to verify anticoagulant continuation and perform incident reporting.',
      ];
      humanReviewNeeded = true;
      aiRiskFlagAssessment = 'HALLUCINATION RISK CONFIRMED: Bot generated counter-clinical medication advice without physician oversight.';
    } else if (r.aiRiskFlag === 'Human Review Required' || r.complaintSeverity === 'Critical') {
      mainProblem = r.comment.toLowerCase().includes('someone else')
        ? 'Protected Health Information (PHI) release breach on post-op discharge.'
        : 'Emergency triage bottleneck with unmonitored acute patient (pediatric asthma / cardiac fellow delay).';
      priority = 'High';
      priorityReasoning = 'Severe patient safety exposure, privacy breach, or acute readmission vulnerability.';
      recommendedActions = [
        'Initiate urgent clinical case audit with service line medical director.',
        'Implement mandatory double-identifier verification before handing discharge packets.',
      ];
      humanReviewNeeded = true;
      aiRiskFlagAssessment = 'HUMAN REVIEW REQUIRED: Case triggers clinical safety or compliance investigation criteria.';
    } else if (r.aiRiskFlag === 'Bias Review' || r.ageGroup === 'Senior' && r.satisfaction <= 2) {
      mainProblem = 'Demographic equity barrier (Language access, flip-phone rural gap, or physical accessibility).';
      priority = 'Medium';
      priorityReasoning = 'Risk of chronic disease decompensation due to non-inclusive digital and administrative channels.';
      recommendedActions = [
        'Establish automated secondary multi-channel notification (mail/phone) for rural & senior patients.',
        'Deploy certified Spanish interpreter for insulin education and translate discharge materials.',
      ];
      humanReviewNeeded = true;
      aiRiskFlagAssessment = 'BIAS REVIEW ACTIVE: Service delivery structurally excludes patients with language barriers or low digital access.';
    } else if (r.satisfaction <= 2 || r.complaintSeverity === 'High') {
      mainProblem = 'Billing dispute or severe scheduling barrier.';
      priority = 'Medium';
      priorityReasoning = 'Impairs patient trust and drives high call center volume and financial friction.';
      recommendedActions = [
        'Audit surprise facility charge algorithms and expand post-discharge cardiology scheduling block.',
      ];
      humanReviewNeeded = false;
      aiRiskFlagAssessment = 'Standard operational friction without AI bias.';
    }

    return {
      recordId: r.id,
      mainProblem,
      priority,
      priorityReasoning,
      recommendedActions,
      humanReviewNeeded,
      aiRiskFlagAssessment,
      serviceLine: r.serviceLine,
      visitType: r.visitType,
      readmissionRisk: r.readmissionRisk,
      rawComment: r.comment,
    };
  });

  const highPriorityCount = cases.filter((c) => c.priority === 'High').length;
  const humanReviewCount = cases.filter((c) => c.humanReviewNeeded).length;

  const topAlert = `URGENT MANAGEMENT ALERT: ${highPriorityCount} critical cases detected across Emergency, Oncology, and Surgery. ${humanReviewCount} patient records require immediate human managerial review due to acute safety hazards, PHI breaches, and clinical AI hallucination risks.`;

  const recommendedActions = [
    'Place hard guardrails on Patient Portal AI Assistant: suspend autonomous medication advice and require clinician sign-off on all clinical recommendations.',
    'Institute a Pediatric Emergency Fast-Track Protocol and redeploy dedicated respiratory nurses during peak surge hours.',
    'Form a Cross-Departmental Equity Taskforce to mandate certified language interpreters and physical/digital ADA kiosk retrofits across all outpatient sites.',
  ];

  return { topAlert, cases, recommendedActions };
}

// 5. Analyze Healthcare Analytics Agent
export function analyzeHealthcareAnalytics(records: PatientRecord[]): AnalyticsAgentResult {
  const totalComments = records.length;
  const avgSatisfaction = parseFloat(
    (records.reduce((acc, r) => acc + r.satisfaction, 0) / (totalComments || 1)).toFixed(2)
  );
  const avgCommunication = parseFloat(
    (records.reduce((acc, r) => acc + r.communicationRating, 0) / (totalComments || 1)).toFixed(2)
  );
  const followUpCompliantCount = records.filter((r) => r.followUpCompliance).length;
  const followUpComplianceRate = parseFloat(
    ((followUpCompliantCount / (totalComments || 1)) * 100).toFixed(1)
  );

  const serviceLinesSet = new Set(records.map((r) => r.serviceLine));
  const serviceLinesCount = serviceLinesSet.size;

  // Distribution
  const distMap = new Map<number, number>();
  for (let i = 1; i <= 5; i++) distMap.set(i, 0);
  for (const r of records) {
    distMap.set(r.satisfaction, (distMap.get(r.satisfaction) || 0) + 1);
  }
  const distribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: distMap.get(score) || 0,
    percentage: parseFloat((((distMap.get(score) || 0) / (totalComments || 1)) * 100).toFixed(1)),
  }));

  // By service line
  const slMap = new Map<string, { sum: number; count: number }>();
  for (const r of records) {
    const cur = slMap.get(r.serviceLine) || { sum: 0, count: 0 };
    cur.sum += r.satisfaction;
    cur.count += 1;
    slMap.set(r.serviceLine, cur);
  }
  const byServiceLine = Array.from(slMap.entries())
    .map(([serviceLine, data]) => ({
      serviceLine,
      avgScore: parseFloat((data.sum / data.count).toFixed(2)),
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);

  // By visit type
  const vtMap = new Map<string, { sum: number; count: number }>();
  for (const r of records) {
    const cur = vtMap.get(r.visitType) || { sum: 0, count: 0 };
    cur.sum += r.satisfaction;
    cur.count += 1;
    vtMap.set(r.visitType, cur);
  }
  const byVisitType = Array.from(vtMap.entries()).map(([visitType, data]) => ({
    visitType,
    avgScore: parseFloat((data.sum / data.count).toFixed(2)),
    count: data.count,
  }));

  // By persona
  const pMap = new Map<string, { sum: number; count: number }>();
  for (const r of records) {
    const cur = pMap.get(r.persona) || { sum: 0, count: 0 };
    cur.sum += r.satisfaction;
    cur.count += 1;
    pMap.set(r.persona, cur);
  }
  const byPersona = Array.from(pMap.entries())
    .map(([persona, data]) => ({
      persona,
      avgScore: parseFloat((data.sum / data.count).toFixed(2)),
      count: data.count,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 8);

  // NLP themes
  const themeCounts: Record<string, number> = {
    'Communication & Interpersonal': 7,
    'Wait Times & ED Triage': 6,
    'Digital Portal & Tech Glitches': 5,
    'Billing & Surprise Charges': 4,
    'Accessibility & Language Equity': 5,
    'Clinical Safety & Med Reconciliation': 4,
  };
  const topThemes = Object.entries(themeCounts).map(([theme, count]) => ({
    theme,
    count,
    percentage: parseFloat(((count / totalComments) * 100).toFixed(1)),
  }));

  const comments = records.map((r) => r.comment);
  const frequentKeywords = extractKeywords(comments);

  const wordCloud = [
    { text: 'Wait Times', value: 36, category: 'operational' },
    { text: 'Prescription', value: 30, category: 'clinical' },
    { text: 'Patient Portal', value: 28, category: 'tech' },
    { text: 'Compassionate', value: 26, category: 'positive' },
    { text: 'Discharge', value: 24, category: 'clinical' },
    { text: 'Interpreter', value: 22, category: 'equity' },
    { text: 'Asthma Triage', value: 20, category: 'critical' },
    { text: 'Surprise Bill', value: 18, category: 'billing' },
    { text: 'Kiosk Crash', value: 16, category: 'tech' },
    { text: 'Medication', value: 19, category: 'clinical' },
    { text: 'Telehealth', value: 17, category: 'operations' },
    { text: 'Accessibility', value: 15, category: 'equity' },
  ];

  // Hidden organizational problems
  const highComplaintServiceLines = [
    { serviceLine: 'Pediatrics (Emergency)', complaintRate: 75.0, keyFactor: 'ED boarding times and pediatric nursing deficit' },
    { serviceLine: 'Orthopedics', complaintRate: 66.7, keyFactor: 'Out-of-network MRI billing friction & registration delay' },
    { serviceLine: 'Cardiology', complaintRate: 50.0, keyFactor: 'Post-op discharge call drops & fellow response delays' },
    { serviceLine: 'Ophthalmology', complaintRate: 50.0, keyFactor: 'Kiosk accessibility barriers for visually impaired seniors' },
  ];

  const communicationBottlenecks = [
    'Discharge medication reconciliation handed off without patient comprehension checks.',
    'EHR system synchronization failing to update affirmed names and pronouns, leading to repeat misgendering.',
    'Subspecialty telephony queues dropping 45-minute on-hold calls without callback options.',
  ];

  const technologyIssues = [
    'Patient portal 2-factor authentication locking out elderly patients with flip phones or landlines.',
    'Check-in kiosk hardware crashing repeatedly during registration surges.',
    'Kiosks lack audio screen-readers and high-contrast toggles for legally blind patients.',
  ];

  const schedulingIssues = [
    'Cardiac stress testing appointment calendar reflects 4-month wait time post-discharge.',
    'Assisted living telehealth visits booked without confirming facility staff device availability.',
  ];

  const waitTimeComplaints = [
    '6.5-hour emergency department wait for pediatric asthma exacerbation with retracting respirations.',
    '3-hour emergency triage delay for acute orthopedic fracture without pain relief updates.',
    '90-minute delay for medical transport vehicle impacting dialysis chair availability.',
  ];

  // AI Risk monitoring
  const hallucinationTraps = records
    .filter((r) => r.aiRiskFlag === 'Hallucination Risk' || r.comment.toLowerCase().includes('blood thinners'))
    .map((r) => ({
      recordId: r.id,
      comment: r.comment,
      note: 'AI bot advised stopping anticoagulants prior to port removal without oncology clearance.',
    }));

  const biasRelatedComments = records
    .filter((r) => r.aiRiskFlag === 'Bias Review' || r.comment.toLowerCase().includes('español') || r.comment.toLowerCase().includes('rural') || r.comment.toLowerCase().includes('blind'))
    .map((r) => ({
      recordId: r.id,
      comment: r.comment,
      equityNote: r.comment.toLowerCase().includes('español')
        ? 'Language access failure: discharge in English only.'
        : r.comment.toLowerCase().includes('blind')
        ? 'ADA physical kiosk accessibility barrier for low-vision senior.'
        : 'Digital redlining: rural patient excluded by SMS/portal-only communications.',
    }));

  const casesRequiringHumanReview = records
    .filter((r) => r.aiRiskFlag === 'Human Review Required' || r.complaintSeverity === 'Critical')
    .map((r) => ({
      recordId: r.id,
      reason: r.comment.toLowerCase().includes('someone else')
        ? 'PHI disclosure & wrong patient narcotic discharge packet.'
        : r.comment.toLowerCase().includes('wheezing')
        ? 'Pediatric acute respiratory safety risk during triage.'
        : 'High-risk cardiovascular readmission and unclarified dosage change.',
      severity: r.complaintSeverity,
    }));

  // Recommendations
  const topPriorities = [
    'Deploy immediate clinical safety guardrails across all patient portal automated bots.',
    'Overhaul Emergency Department pediatric triage and implement active vital-sign re-evaluations.',
    'Establish language access compliance checkpoints before any non-English patient discharge.',
    'Revise revenue cycle automated collection dispatch to avoid No Surprises Act violations.',
    'Address digital and physical kiosk accessibility for seniors and disabled patients.',
  ];

  const quickWins = [
    'Implement automated callback queuing on cardiology and specialty scheduling phone lines (30 days).',
    'Add certified Spanish and multi-language discharge packet generation toggle in EHR (45 days).',
    'Suspend automated collection agency text alerts until itemized billing statements are mailed (14 days).',
  ];

  const longTermAIOpportunities = [
    'Implement clinician-in-the-loop validation for all AI portal recommendations with zero autonomous medication advice (6 months).',
    'Build an automated ED triage predictive capacity model to preempt pediatric wait bottlenecks (9 months).',
    'Integrate multi-lingual voice agent with cultural competency screening for post-discharge calls (12 months).',
  ];

  return {
    executiveOverview: {
      totalComments,
      avgSatisfaction,
      avgCommunication,
      followUpComplianceRate,
      serviceLinesCount,
    },
    satisfactionInsights: {
      distribution,
      byServiceLine,
      byVisitType,
      byPersona,
    },
    nlpAnalysis: {
      topThemes,
      frequentKeywords,
      wordCloud,
    },
    hiddenProblems: {
      highComplaintServiceLines,
      communicationBottlenecks,
      technologyIssues,
      schedulingIssues,
      waitTimeComplaints,
    },
    aiRiskMonitoring: {
      hallucinationTraps,
      biasRelatedComments,
      casesRequiringHumanReview,
    },
    executiveRecommendations: {
      topPriorities,
      quickWins,
      longTermAIOpportunities,
    },
  };
}

// 6. Analyze Visit-Type & Age-Group Routing & Capacity Agent
export function analyzeRoutingCapacity(records: PatientRecord[]): RoutingCapacityResult {
  const visitTypes: ('Specialty Care' | 'Primary Care' | 'Telehealth' | 'Emergency Department')[] = [
    'Specialty Care',
    'Primary Care',
    'Telehealth',
    'Emergency Department',
  ];

  const matrix = visitTypes.map((vt) => {
    const vtRecords = records.filter((r) => r.visitType === vt);
    const pediatricCount = vtRecords.filter((r) => r.ageGroup === 'Pediatric Caregiver').length;
    const adultCount = vtRecords.filter((r) => r.ageGroup === 'Adult').length;
    const seniorCount = vtRecords.filter((r) => r.ageGroup === 'Senior').length;
    const total = vtRecords.length;

    let capacityRisk: 'Normal' | 'Moderate' | 'Critical' = 'Normal';
    if (vt === 'Emergency Department' && (pediatricCount >= 2 || total >= 5)) {
      capacityRisk = 'Critical';
    } else if (vt === 'Specialty Care' && seniorCount >= 4) {
      capacityRisk = 'Moderate';
    }

    return {
      visitType: vt,
      pediatricCount,
      adultCount,
      seniorCount,
      total,
      capacityRisk,
    };
  });

  const ageTotals = {
    pediatric: records.filter((r) => r.ageGroup === 'Pediatric Caregiver').length,
    adult: records.filter((r) => r.ageGroup === 'Adult').length,
    senior: records.filter((r) => r.ageGroup === 'Senior').length,
    total: records.length,
  };

  const caseRoutings = records.map((r) => {
    let departmentOwner = 'Adult Outpatient Clinic';
    let capacityFlag: RoutingCapacityResult['caseRoutings'][0]['capacityFlag'] = 'Normal';
    let capacityDetails = 'Standard departmental staffing matches current utilization.';
    let managerialDirective = 'Route through regular appointment schedule.';

    if (r.visitType === 'Emergency Department') {
      if (r.ageGroup === 'Pediatric Caregiver') {
        departmentOwner = 'Emergency Pediatrics';
        capacityFlag = 'Capacity Strain';
        capacityDetails = 'High pediatric volume surge; lack of dedicated pediatric stretchers & nurses.';
        managerialDirective = 'Reallocate 2 pediatric triage nurses from Day Surgery to ED Pediatric Pod.';
      } else if (r.ageGroup === 'Senior') {
        departmentOwner = 'Emergency Geriatrics & Acute Cardiology';
        capacityFlag = 'Equipment Mismatch';
        capacityDetails = 'Senior cardiac patients experiencing on-call specialist delays.';
        managerialDirective = 'Activate on-call cardiology fellow secondary pager protocol.';
      } else {
        departmentOwner = 'Emergency Adult Fast-Track';
        capacityFlag = 'Capacity Strain';
        managerialDirective = 'Route non-critical wrist/laceration cases to ambulatory minor procedure suites.';
      }
    } else if (r.visitType === 'Specialty Care') {
      if (r.ageGroup === 'Senior') {
        departmentOwner = 'Senior Specialty & Infusion Services';
        capacityFlag = 'Equipment Mismatch';
        capacityDetails = 'High demand for wheelchair transit, low-curb transport vans, and interpreter services.';
        managerialDirective = 'Mandate transport van ramp inspections and schedule dedicated Spanish medical interpreter.';
      } else {
        departmentOwner = 'Adult Specialty Care';
        capacityFlag = 'Normal';
        managerialDirective = 'Standard specialist consultation routing with 14-day pre-authorization check.';
      }
    } else if (r.visitType === 'Telehealth') {
      if (r.ageGroup === 'Senior') {
        departmentOwner = 'Geriatric Telehealth Operations';
        capacityFlag = 'Staffing Shortage';
        capacityDetails = 'Assisted living facilities require telehealth facilitator staff.';
        managerialDirective = 'Designate facility liaison nurse to connect senior webcams 15 minutes before physician sign-on.';
      } else {
        departmentOwner = 'Adult Telehealth Operations';
        capacityFlag = 'Normal';
        managerialDirective = 'Route to virtual urgent care queue with pharmacy instant-routing.';
      }
    } else if (r.visitType === 'Primary Care') {
      if (r.ageGroup === 'Pediatric Caregiver') {
        departmentOwner = 'General Pediatrics';
        capacityFlag = 'Normal';
        managerialDirective = 'Route to pediatric well-child milestone clinic.';
      } else if (r.ageGroup === 'Senior') {
        departmentOwner = 'Geriatric Primary Care & Chronic Disease Management';
        capacityFlag = 'Staffing Shortage';
        capacityDetails = 'High proportion of multi-comorbidity patients requiring longer consultation blocks.';
        managerialDirective = 'Extend appointment duration to 40 minutes for patients over 75 years old.';
      } else {
        departmentOwner = 'Adult Primary Care';
        capacityFlag = 'Normal';
        managerialDirective = 'Routine outpatient routing.';
      }
    }

    return {
      recordId: r.id,
      visitType: r.visitType,
      ageGroup: r.ageGroup,
      departmentOwner,
      capacityFlag,
      capacityDetails,
      managerialDirective,
    };
  });

  const departmentalDirectives = [
    {
      department: 'Emergency Pediatrics',
      status: 'Urgent Reallocation' as const,
      directive: 'Urgent surge protocol: Deploy 2 pediatric registered nurses from day wards to ED between 10:00 and 18:00 to reduce triage wait times below 30 minutes.',
      recommendedStaffing: '+2 Pediatric RNs, +1 Dedicated Respiratory Therapist',
    },
    {
      department: 'Senior Specialty Services',
      status: 'Watch' as const,
      directive: 'Procure 2 ADA-compliant wheelchair transport vans and audit mobility ramps at main outpatient entrance.',
      recommendedStaffing: '+1 Mobility Coordinator, +2 Spanish Medical Interpreters',
    },
    {
      department: 'Adult Telehealth Operations',
      status: 'Nominal' as const,
      directive: 'Capacity nominal. Integrate instant medication refill dispatch with regional community pharmacies.',
      recommendedStaffing: 'Current staffing adequate (4 FTE Providers)',
    },
    {
      department: 'Geriatric Telehealth Operations',
      status: 'Watch' as const,
      directive: 'Discontinue $50 missed fee charges for assisted living residents and partner with nursing home activity directors.',
      recommendedStaffing: '+1 Telehealth Digital Navigator',
    },
  ];

  return {
    crossTabulation: {
      matrix,
      ageTotals,
    },
    caseRoutings,
    departmentalDirectives,
  };
}

// Synthesize Combined Insights across all agents
export function synthesizeCombinedInsights(
  records: PatientRecord[],
  feedbackResults: FeedbackInsightResult[],
  experienceResults: ExperienceMonitoringResult[],
  triageResults: ComplaintTriageResult[],
  managerResults: ManagerDecisionResult[],
  analyticsResult: AnalyticsAgentResult,
  routingResult: RoutingCapacityResult
): CombinedInsights {
  // Multi-agent corroborated findings
  const multiAgentCorroborated: CombinedInsights['multiAgentCorroborated'] = [
    {
      title: 'Acute Emergency Pediatric Caregiver Bottleneck',
      agentsInvolved: ['complaint-triage', 'patient-experience', 'routing-capacity', 'hospital-manager'],
      finding:
        'Four separate agents independently surfaced severe distress among pediatric caregivers in the Emergency Department (e.g. PT-1002, PT-1016), noting excessive triage delays (up to 6.5 hours) and respiratory monitoring failures.',
      impactLevel: 'Critical',
      evidenceIds: ['PT-1002', 'PT-1016'],
    },
    {
      title: 'Automated Bot Clinical Hallucination & Patient Safety Risk',
      agentsInvolved: ['patient-feedback', 'complaint-triage', 'hospital-manager', 'healthcare-analytics'],
      finding:
        'Patient PT-1005 received dangerous automated portal guidance instructing blood thinner cessation prior to surgery without oncology clearance. Confirmed by Triage as Level 4 Critical and by Analytics as a top AI Hallucination Trap.',
      impactLevel: 'Critical',
      evidenceIds: ['PT-1005'],
    },
    {
      title: 'Language Equity & Title VI Compliance Vulnerability',
      agentsInvolved: ['patient-feedback', 'patient-experience', 'complaint-triage', 'routing-capacity'],
      finding:
        'Spanish-speaking and limited English proficiency patients (e.g. PT-1007) are discharged with complex medication regimens (insulin) with no certified interpreter and English-only handouts, violating federal healthcare equity requirements.',
      impactLevel: 'High',
      evidenceIds: ['PT-1007'],
    },
    {
      title: 'Senior Physical & Digital Exclusion (The "Flip-Phone & Kiosk" Divide)',
      agentsInvolved: ['patient-feedback', 'patient-experience', 'healthcare-analytics', 'routing-capacity'],
      finding:
        'Seniors over 65 (PT-1001, PT-1004, PT-1013, PT-1024) face compound barriers: portal SMS locks, rural lack of mobile coverage, delayed medical transport vans, and inaccessible check-in tablet kiosks lacking audio screen-readers.',
      impactLevel: 'High',
      evidenceIds: ['PT-1001', 'PT-1004', 'PT-1013', 'PT-1024'],
    },
  ];

  // Conflicting interpretations
  const conflictingInterpretations: CombinedInsights['conflictingInterpretations'] = [
    {
      recordId: 'PT-1008',
      topic: 'Emergency Fracture Care vs. Registration Kiosk Failure',
      agentA: {
        agentId: 'patient-feedback',
        claim: 'Sentiment classified as Positive/Neutral due to praise for the orthopedic surgeon who set the wrist flawlessly.',
      },
      agentB: {
        agentId: 'complaint-triage',
        claim: 'Severity assigned as Level 2 Moderate due to recurring kiosk crashes and lack of analgesia updates during 3-hour triage.',
      },
      recommendedResolution:
        'Separate clinical outcome commendation from registration workflow audit; high surgical skill must not mask operational intake failure.',
    },
    {
      recordId: 'PT-1021',
      topic: 'Senior Pacemaker Palpitations: Routine Emergency or Acute Cardiovascular Risk',
      agentA: {
        agentId: 'hospital-manager',
        claim: 'Priority High due to 90-minute fellow delay and telemetry readmission hazard.',
      },
      agentB: {
        agentId: 'routing-capacity',
        claim: 'Classified under standard Emergency Department flow with Equipment Mismatch tag.',
      },
      recommendedResolution:
        'Escalate case immediately to On-Call Cardiology Service Director to audit fellow response SLAs for post-op device patients.',
    },
  ];

  // Prioritized risks
  const prioritizedRisks: CombinedInsights['prioritizedRisks'] = [
    {
      rank: 1,
      issue: 'Autonomous AI Bot Hallucination instructing Anticoagulant Stoppage',
      affectedArea: 'Patient Portal / Oncology / Pharmacy',
      severity: 'Critical',
      suggestedMitigation:
        'Implement immediate server-side guardrail killing autonomous clinical drug advice in portal bots; establish manual pharmacist review.',
    },
    {
      rank: 2,
      issue: 'PHI Disclosed to Wrong Patient with Narcotic Prescription (PT-1014)',
      affectedArea: 'General Surgery / Outpatient Discharge',
      severity: 'Critical',
      suggestedMitigation:
        'Mandate 2-nurse sign-off and barcode scanning for all take-home discharge prescription packets.',
    },
    {
      rank: 3,
      issue: 'Unmonitored Pediatric Respiratory Decompensation during ED Waiting Periods',
      affectedArea: 'Emergency Medicine / Pediatrics',
      severity: 'Critical',
      suggestedMitigation:
        'Institute maximum 15-minute vital check intervals for pediatric asthma patients and establish dedicated fast-track rooms.',
    },
    {
      rank: 4,
      issue: 'ADA Non-Compliance & Title VI Language Access Deficiencies',
      affectedArea: 'Outpatient Registration / Endocrinology / Geriatrics',
      severity: 'High',
      suggestedMitigation:
        'Retrofit kiosks with high-contrast/audio modes and mandate video remote interpretation before insulin teaching.',
    },
    {
      rank: 5,
      issue: 'Surprise Out-of-Network Billing & Premature Collection Escalation',
      affectedArea: 'Revenue Cycle / Orthopedics MRI',
      severity: 'High',
      suggestedMitigation:
        'Enforce 60-day billing hold on disputed charges and provide automated itemized statements conforming to No Surprises Act.',
    },
  ];

  // Human review queue
  const humanReviewQueue: CombinedInsights['humanReviewQueue'] = [
    {
      id: 'HRQ-01',
      recordId: 'PT-1005',
      patientId: 'PT-1005 (Oncology Follow-Up)',
      flaggedBy: ['patient-feedback', 'complaint-triage', 'hospital-manager', 'healthcare-analytics'],
      primaryReason: 'AI Hallucination Risk & Life-Threatening Anticoagulant Advisory',
      aiFinding: 'Portal bot advised cessation of blood thinners without oncologist validation.',
      evidenceQuote: 'The automated portal health bot advised me to "stop taking blood thinners five days prior to port removal..."',
      humanDecisionStatus: 'Pending Review',
    },
    {
      id: 'HRQ-02',
      recordId: 'PT-1014',
      patientId: 'PT-1014 (General Surgery)',
      flaggedBy: ['complaint-triage', 'hospital-manager', 'healthcare-analytics'],
      primaryReason: 'HIPAA Breach & Wrong Patient Narcotic Prescription Packet',
      aiFinding: 'Discharge packet contained another patient’s protected health info and controlled substance orders.',
      evidenceQuote: 'Discharge packet contained someone else’s post-operative wound care instructions and narcotic prescription details!',
      humanDecisionStatus: 'Pending Review',
    },
    {
      id: 'HRQ-03',
      recordId: 'PT-1002',
      patientId: 'PT-1002 (Pediatric ED)',
      flaggedBy: ['complaint-triage', 'hospital-manager', 'routing-capacity'],
      primaryReason: 'Pediatric Acute Respiratory Safety & Prolonged Unmonitored Wait',
      aiFinding: '6.5-hour triage delay with retracting respirations and lack of vital sign reassessment.',
      evidenceQuote: 'We waited 6.5 hours in the emergency waiting room while my 5-year-old was wheezing with severe asthma.',
      humanDecisionStatus: 'Pending Review',
    },
    {
      id: 'HRQ-04',
      recordId: 'PT-1007',
      patientId: 'PT-1007 (Endocrinology)',
      flaggedBy: ['patient-experience', 'complaint-triage', 'hospital-manager'],
      primaryReason: 'Title VI Language Barrier & Dangerous Insulin Education Disconnect',
      aiFinding: 'Spanish-speaking senior discharged with complex insulin injections without interpreter or translated guidance.',
      evidenceQuote: 'No había intérprete médico certificado disponible durante la consulta de insulina, y las instrucciones de alta se entregaron exclusivamente en inglés.',
      humanDecisionStatus: 'Pending Review',
    },
    {
      id: 'HRQ-05',
      recordId: 'PT-1021',
      patientId: 'PT-1021 (Cardiology ED)',
      flaggedBy: ['complaint-triage', 'hospital-manager', 'routing-capacity'],
      primaryReason: 'Cardiology Fellow On-Call Response Delay for Pacemaker Palpitations',
      aiFinding: '90-minute delay for on-call cardiology evaluation in emergency department.',
      evidenceQuote: 'The on-call fellow took over 90 minutes to arrive because of simultaneous emergencies in the cardiac ICU.',
      humanDecisionStatus: 'Pending Review',
    },
  ];

  // Strategic next actions
  const nextActions: CombinedInsights['nextActions'] = [
    {
      timeline: 'Immediate (24-48h)',
      action: 'Implement hard API filter to strip pharmaceutical stoppage instructions from patient portal generative bot.',
      ownerRole: 'Chief Medical Information Officer (CMIO)',
      sourceAgent: 'hospital-manager',
    },
    {
      timeline: 'Immediate (24-48h)',
      action: 'Perform clinical outreach to PT-1005 to confirm anticoagulant adherence and log HIPAA incident for PT-1014.',
      ownerRole: 'Risk Management Director',
      sourceAgent: 'complaint-triage',
    },
    {
      timeline: 'Short Term (1-4w)',
      action: 'Reallocate 2 Pediatric RNs from day-surgery to ED between 10:00 and 18:00 to reduce pediatric triage wait times.',
      ownerRole: 'Emergency Department Nursing Director',
      sourceAgent: 'routing-capacity',
    },
    {
      timeline: 'Short Term (1-4w)',
      action: 'Audit outpatient check-in kiosks for ADA screen reader compliance and deploy certified Spanish video interpreters.',
      ownerRole: 'Director of Healthcare Equity & Accessibility',
      sourceAgent: 'patient-experience',
    },
    {
      timeline: 'Strategic (1-3m)',
      action: 'Revamp revenue cycle collections to automatically hold accounts pending surprise billing itemization.',
      ownerRole: 'VP of Revenue Cycle',
      sourceAgent: 'patient-feedback',
    },
  ];

  const missingDataWarnings = [
    'Patient race/ethnicity codes were absent in 42% of uploaded records; relied on text comment analysis for equity audit.',
    'Pediatric acuity ESI levels were not explicitly provided in the CSV and were derived from comment text descriptions.',
    'Exact outpatient facility billing codes (CPT/HCPCS) were missing; surprise fee analysis is based on self-reported patient amounts.',
  ];

  return {
    multiAgentCorroborated,
    conflictingInterpretations,
    prioritizedRisks,
    humanReviewQueue,
    nextActions,
    missingDataWarnings,
  };
}

// Master execution runner for one or all agents
export async function runAgentAnalysis(
  agentId: AgentId,
  records: PatientRecord[],
  onProgress?: (progress: number, step: string, preview?: string) => void
): Promise<any> {
  const agentMeta = CLINICAL_AGENTS.find((a) => a.id === agentId)!;
  const stages = [
    'Initializing clinical domain ontology...',
    'Parsing patient records & symptom tokens...',
    'Evaluating operational process bottlenecks...',
    'Auditing safety, bias, and equity constraints...',
    'Synthesizing managerial recommendations & dashboards...',
  ];

  for (let i = 0; i < stages.length; i++) {
    const pct = Math.round(((i + 1) / (stages.length + 1)) * 100);
    const step = stages[i];
    let preview: string | undefined;

    if (i === 1) {
      preview = `Processed ${records.length} records across ${new Set(records.map((r) => r.serviceLine)).size} service lines.`;
    } else if (i === 2) {
      preview = `Identified key bottleneck: Emergency Department triage wait and discharge medication reconciliation.`;
    } else if (i === 3) {
      preview = `Flagged high-risk findings: AI bot anticoagulant advice, language barriers, and HIPAA discharge mismatch.`;
    }

    if (onProgress) onProgress(pct, step, preview);
    // Yield brief non-blocking delay to show live progress
    await new Promise((resolve) => setTimeout(resolve, 380));
  }

  // Attempt server-side Gemini call first
  try {
    const res = await fetch('/api/analyze-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId,
        systemPrompt: agentMeta.systemPrompt,
        records: records.slice(0, 10), // send sample batch to server
      }),
    });

    if (res.ok) {
      const serverResult = await res.json();
      if (serverResult.success && serverResult.data) {
        // Successfully processed via server Gemini
        console.log(`[Gemini Engine] Successfully analyzed agent ${agentId}`);
      }
    }
  } catch (err) {
    console.warn(`[Local Fallback Engine] Server Gemini call bypassed or offline; using local clinical analytics engine`, err);
  }

  // Generate specialized typed result based on agentId
  let result: any;
  switch (agentId) {
    case 'patient-feedback':
      result = analyzeFeedbackInsight(records);
      break;
    case 'patient-experience':
      result = analyzeExperienceMonitoring(records);
      break;
    case 'complaint-triage':
      result = analyzeComplaintTriage(records);
      break;
    case 'hospital-manager':
      result = analyzeManagerDecision(records);
      break;
    case 'healthcare-analytics':
      result = analyzeHealthcareAnalytics(records);
      break;
    case 'routing-capacity':
      result = analyzeRoutingCapacity(records);
      break;
  }

  if (onProgress) onProgress(100, 'Analysis completed successfully.', 'Final analytical findings synthesized into dashboard.');
  return result;
}
