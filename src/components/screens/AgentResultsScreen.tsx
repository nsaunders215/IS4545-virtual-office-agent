import React, { useState } from 'react';
import {
  AgentId,
  AgentMetadata,
  AnalysisOutputBundle,
  FeedbackInsightResult,
  ExperienceMonitoringResult,
  ComplaintTriageResult,
  ManagerDecisionResult,
  AnalyticsAgentResult,
  RoutingCapacityResult,
} from '../../types/clinical';
import { analyzeManagerDecision } from '../../services/clinicalAnalysisEngine';
import { AgentAvatar } from '../AgentAvatar';
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Activity,
  UserCheck,
  Building2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AgentResultsScreenProps {
  agents: AgentMetadata[];
  activeAgentId: AgentId;
  onSelectAgentTab: (id: AgentId) => void;
  outputBundle: AnalysisOutputBundle;
  onNavigateToExecutive: () => void;
}

export const AgentResultsScreen: React.FC<AgentResultsScreenProps> = ({
  agents,
  activeAgentId,
  onSelectAgentTab,
  outputBundle,
  onNavigateToExecutive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const currentAgent = agents.find((a) => a.id === activeAgentId)!;

  const feedbackResults: FeedbackInsightResult[] = outputBundle.feedbackResults || [];
  const experienceResults: ExperienceMonitoringResult[] = outputBundle.experienceResults || [];
  const triageResults: ComplaintTriageResult[] = outputBundle.triageResults || [];
  const managerResults: ManagerDecisionResult[] = outputBundle.managerResults || [];
  const analyticsResult: AnalyticsAgentResult | undefined = outputBundle.analyticsResult;
  const routingResult: RoutingCapacityResult | undefined = outputBundle.routingResult;

  const toggleExpand = (id: string) => {
    setExpandedCaseId(expandedCaseId === id ? null : id);
  };

  const handleExportCSV = (filename: string, data: any[]) => {
    if (!data || data.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      encodeURIComponent(
        Object.keys(data[0] || {}).join(',') +
          '\n' +
          data
            .map((row) =>
              Object.values(row)
                .map((val) => `"${String(val).replace(/"/g, '""')}"`)
                .join(',')
            )
            .join('\n')
      );
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation Strip: All 6 Agent Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {agents.map((agent) => {
            const isActive = agent.id === activeAgentId;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgentTab(agent.id);
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{agent.roomNumber}</span>
                <span>{agent.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Agent Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <AgentAvatar agentId={currentAgent.id} status="completed" size="md" />
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span>{currentAgent.roomNumber}</span>
              <span>·</span>
              <span>{currentAgent.roomName}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentAgent.title}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {currentAgent.shortDescription}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onNavigateToExecutive}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Combined Executive Summary</span>
          </button>
        </div>
      </div>

      {/* RENDER INDIVIDUAL AGENT RESULTS BASED ON SPECIFICATION */}

      {/* 1. PATIENT FEEDBACK INSIGHT AGENT */}
      {activeAgentId === 'patient-feedback' && (
        <div className="space-y-6">
          {/* Sentiment & Theme Breakdown Bars */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Positive', 'Negative', 'Neutral', 'Mixed'].map((sent) => {
              const count = feedbackResults.filter(
                (r: FeedbackInsightResult) => r.sentiment.toLowerCase() === sent.toLowerCase()
              ).length;
              return (
                <div
                  key={sent}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-slate-500 font-medium">{sent} Sentiment</span>
                    <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{count}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sent === 'Positive'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sent === 'Negative'
                        ? 'bg-rose-100 text-rose-800'
                        : sent === 'Mixed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {sent}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Search & Export Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search feedback cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-64"
              />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="all">All Themes</option>
                <option value="Clinical Care">Clinical Care</option>
                <option value="Accessibility / Equity">Accessibility / Equity</option>
                <option value="Wait Time">Wait Time</option>
                <option value="Billing">Billing</option>
                <option value="Technology / Patient Portal">Technology / Patient Portal</option>
              </select>
            </div>

            <button
              onClick={() => handleExportCSV('patient_feedback_insights', feedbackResults)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table of Structured Feedback Insights */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {feedbackResults
              .filter((r: FeedbackInsightResult) => {
                const matchesSearch =
                  r.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  r.rawComment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  r.operationalIssue.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesTheme =
                  selectedFilter === 'all' || r.theme === selectedFilter;
                return matchesSearch && matchesTheme;
              })
              .map((item: FeedbackInsightResult) => (
                <div key={item.recordId} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div
                    className="flex items-start justify-between gap-4 cursor-pointer"
                    onClick={() => toggleExpand(item.recordId)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {item.recordId}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        Theme: {item.theme}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`text-xs font-medium ${
                          item.sentiment === 'Positive'
                            ? 'text-emerald-700'
                            : item.sentiment === 'Negative'
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {item.sentiment} Sentiment
                      </span>
                    </div>

                    <button className="text-slate-400 hover:text-slate-700">
                      {expandedCaseId === item.recordId ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{item.rawComment}"
                  </p>

                  {/* 6 Step Deliverables */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="font-semibold text-slate-500 uppercase text-[10px] block mb-1">
                        Step 3 · Reasoning
                      </span>
                      <p className="text-slate-700">{item.reasoning}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="font-semibold text-slate-500 uppercase text-[10px] block mb-1">
                        Step 4 · Operational Issue
                      </span>
                      <p className="text-slate-700">{item.operationalIssue}</p>
                    </div>

                    <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60">
                      <span className="font-semibold text-rose-800 uppercase text-[10px] block mb-1">
                        Step 5 · Risk / Bias Concern
                      </span>
                      <p className="text-rose-900">{item.riskOrBiasConcern}</p>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs">
                    <span className="font-semibold text-blue-800 uppercase text-[10px] block mb-1">
                      Step 6 · Recommended Managerial Action
                    </span>
                    <p className="text-blue-900 font-medium">{item.recommendedAction}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 2. PATIENT EXPERIENCE MONITORING AGENT */}
      {activeAgentId === 'patient-experience' && (
        <div className="space-y-6">
          {/* Equity Vulnerability Radar Strip */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Step 3 · Healthcare Equity and Accessibility Audit
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Vulnerability review tracking older adults, rural patients, physical disabilities, limited English proficiency (LEP), and low digital literacy.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <span className="text-[11px] font-semibold text-purple-700 uppercase">
                  Language Access (LEP)
                </span>
                <div className="text-lg font-bold text-purple-900 mt-1">Title VI Alert</div>
                <p className="text-xs text-purple-800 mt-1">
                  Discharge instructions given in English only to Spanish-speaking diabetic senior.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-[11px] font-semibold text-blue-700 uppercase">
                  Rural Digital Redlining
                </span>
                <div className="text-lg font-bold text-blue-900 mt-1">Connectivity Gap</div>
                <p className="text-xs text-blue-800 mt-1">
                  Flip-phone user missed critical lab results due to SMS/portal-only notices.
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-700 uppercase">
                  Physical & Wheelchair
                </span>
                <div className="text-lg font-bold text-amber-900 mt-1">Mobility Barrier</div>
                <p className="text-xs text-amber-800 mt-1">
                  Dialysis transport driver lacked ramp; curbside stairs blocked walker patient.
                </p>
              </div>

              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[11px] font-semibold text-rose-700 uppercase">
                  Visual Impairment (ADA)
                </span>
                <div className="text-lg font-bold text-rose-900 mt-1">Kiosk Inaccessible</div>
                <p className="text-xs text-rose-800 mt-1">
                  Low-contrast check-in tablet kiosk lacked audio screen reader for blind patient.
                </p>
              </div>
            </div>
          </div>

          {/* Cases List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {experienceResults.map((item: ExperienceMonitoringResult) => (
              <div key={item.recordId} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {item.recordId}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        Primary: {item.primaryTheme}
                      </span>
                      {item.secondaryThemes.length > 0 && (
                        <span className="text-xs text-slate-500">
                          (Secondary: {item.secondaryThemes.join(', ')})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 italic">
                      "{item.rawComment}"
                    </p>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                      item.riskAssessment.overallRisk === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : item.riskAssessment.overallRisk === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Risk: {item.riskAssessment.overallRisk}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                      Step 2 · Operational Bottleneck
                    </span>
                    <p className="text-slate-800">{item.operationalIssue}</p>
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                    <span className="text-[10px] font-semibold uppercase text-blue-800 block mb-1">
                      Step 5 · Managerial Recommendation
                    </span>
                    <p className="text-blue-900 font-medium">{item.managerialRecommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. COMPLAINT TRIAGE ASSISTANT */}
      {activeAgentId === 'complaint-triage' && (
        <div className="space-y-6">
          {/* Triage Severity Breakdown Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['LEVEL 4 – Critical', 'LEVEL 3 – High', 'LEVEL 2 – Moderate', 'LEVEL 1 – Low'].map(
              (lvl) => {
                const count = triageResults.filter((r: ComplaintTriageResult) =>
                  r.severityLevel.startsWith(lvl.slice(0, 7))
                ).length;
                return (
                  <div
                    key={lvl}
                    className={`p-4 rounded-xl border shadow-xs ${
                      lvl.includes('Critical')
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : lvl.includes('High')
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-semibold uppercase block">
                      {lvl.split('–')[1] || lvl}
                    </span>
                    <div className="text-2xl font-bold font-mono mt-1">{count} Cases</div>
                  </div>
                );
              }
            )}
          </div>

          {/* Triage Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {triageResults.map((triage: ComplaintTriageResult) => (
              <div key={triage.recordId} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {triage.recordId}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {triage.primaryCategory}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        triage.severityLevel.includes('Critical')
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : triage.severityLevel.includes('High')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {triage.severityLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Route To:</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {triage.escalationRoute}
                    </span>
                    <span className="font-mono text-slate-400">SLA: {triage.slaTargetHours}h</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{triage.rawComment}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                      Step 2 · Severity Reasoning
                    </span>
                    <p className="text-slate-800">{triage.severityReasoning}</p>
                  </div>

                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
                    <span className="text-[10px] font-semibold uppercase text-rose-800 block mb-1">
                      Step 3 · Detected Risks
                    </span>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {triage.riskDetection.risks.map((r: string, i: number) => (
                        <span key={i} className="text-[11px] font-medium text-rose-700">
                          {r} {i < triage.riskDetection.risks.length - 1 ? '·' : ''}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-700">{triage.riskDetection.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. HOSPITAL MANAGER DECISION SUPPORT AGENT */}
      {activeAgentId === 'hospital-manager' && (
        <div className="space-y-6">
          {/* Top Management Alert Banner required by instructions! */}
          <div className="p-6 bg-rose-900 text-white rounded-2xl shadow-md border border-rose-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-200 uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span>Executive Priority Finding · Top Management Alert</span>
            </div>
            <h2 className="text-lg font-bold leading-tight">
              {analyzeManagerDecision([]).topAlert}
            </h2>
            <p className="text-xs text-rose-200 mt-2 max-w-3xl leading-relaxed">
              Immediate executive intervention required across Emergency Pediatric overcrowding, patient portal clinical bot advice, and surgical discharge identification verification.
            </p>
          </div>

          {/* Cases Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {managerResults.map((item: ManagerDecisionResult) => (
              <div key={item.recordId} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {item.recordId}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{item.serviceLine}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500">{item.visitType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        item.priority === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : item.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Priority: {item.priority}
                    </span>

                    {item.humanReviewNeeded && (
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Human Review Needed
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Main Problem: </span>
                  <span className="text-slate-800 font-medium">{item.mainProblem}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-semibold uppercase text-slate-500 block mb-1">
                      Priority Reasoning
                    </span>
                    <p className="text-slate-700">{item.priorityReasoning}</p>
                  </div>

                  <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60">
                    <span className="text-[10px] font-semibold uppercase text-purple-800 block mb-1">
                      AI Risk Flag Audit
                    </span>
                    <p className="text-purple-900">{item.aiRiskFlagAssessment}</p>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 text-xs">
                  <span className="text-[10px] font-semibold uppercase text-blue-800 block mb-1">
                    Recommended Management Actions
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-blue-900">
                    {item.recommendedActions.map((act: string, i: number) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom 2-3 Recommended Actions required by instructions! */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Strategic Management Recommendations for Hospital Leadership
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analyzeManagerDecision([]).recommendedActions.map((action: string, i: number) => (
                <div key={i} className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
                  <div className="font-mono text-teal-400 font-bold mb-1">Directive 0{i + 1}</div>
                  <p className="text-slate-200 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. HEALTHCARE ANALYTICS AGENT */}
      {activeAgentId === 'healthcare-analytics' && analyticsResult && (
        <div className="space-y-8">
          {/* SECTION 1: Executive Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Section 1 · Executive KPI Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Comments Analyzed</span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {analyticsResult.executiveOverview.totalComments}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Avg Satisfaction</span>
                <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                  {analyticsResult.executiveOverview.avgSatisfaction}
                  <span className="text-xs text-slate-400">/5</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Communication Rating</span>
                <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
                  {analyticsResult.executiveOverview.avgCommunication}
                  <span className="text-xs text-slate-400">/5</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Follow-Up Compliance</span>
                <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                  {analyticsResult.executiveOverview.followUpComplianceRate}%
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-medium">Service Lines</span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  {analyticsResult.executiveOverview.serviceLinesCount}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Patient Satisfaction Insights */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 2 · Patient Satisfaction Visualizations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Satisfaction Distribution */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-3">Satisfaction Rating Distribution</h4>
                <div className="space-y-2">
                  {analyticsResult.satisfactionInsights.distribution.map((d: any) => (
                    <div key={d.score} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-mono text-slate-600 font-medium">{d.score} Stars</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${d.percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-right font-mono text-slate-500">
                        {d.count} ({d.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Service Line */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-3">Average Score by Service Line</h4>
                <div className="space-y-2">
                  {analyticsResult.satisfactionInsights.byServiceLine.slice(0, 5).map((sl: any) => (
                    <div key={sl.serviceLine} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                      <span className="text-slate-700 font-medium">{sl.serviceLine}</span>
                      <span className="font-mono font-bold text-slate-900">{sl.avgScore} / 5</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: NLP Analysis & Word Cloud */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 3 · NLP Analysis & Interactive Word Cloud
            </h3>

            <div className="p-6 bg-slate-950 text-white rounded-xl flex flex-wrap items-center justify-center gap-4 py-8">
              {analyticsResult.nlpAnalysis.wordCloud.map((item: any, i: number) => (
                <span
                  key={i}
                  className="transition-transform hover:scale-110 cursor-default font-medium"
                  style={{
                    fontSize: `${Math.max(12, item.value * 0.9)}px`,
                    color:
                      item.category === 'critical'
                        ? '#F87171'
                        : item.category === 'positive'
                        ? '#34D399'
                        : item.category === 'equity'
                        ? '#C084FC'
                        : '#60A5FA',
                  }}
                >
                  {item.text}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Top Identified Comment Themes</h4>
                <div className="space-y-1.5 text-xs">
                  {analyticsResult.nlpAnalysis.topThemes.map((t: any, idx: number) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-700">{t.theme}</span>
                      <span className="font-mono text-slate-900 font-semibold">{t.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Most Frequent Keywords</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                  {analyticsResult.nlpAnalysis.frequentKeywords.slice(0, 10).map((k: any, idx: number) => (
                    <span
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg border font-mono ${
                        k.sentiment === 'positive'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : k.sentiment === 'negative'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {k.keyword} ({k.count})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Hidden Organizational Problems */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 4 · Hidden Organizational Problems
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl">
                <h4 className="font-bold text-rose-900 mb-2">High Complaint Service Lines</h4>
                <ul className="space-y-1.5 text-rose-800">
                  {analyticsResult.hiddenProblems.highComplaintServiceLines.map((s: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>{s.serviceLine}</span>
                      <span className="font-mono font-bold">{s.complaintRate}%</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-900 mb-2">Communication Bottlenecks</h4>
                <ul className="list-disc pl-4 space-y-1 text-amber-800">
                  {analyticsResult.hiddenProblems.communicationBottlenecks.map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-2">Technology & Portal Friction</h4>
                <ul className="list-disc pl-4 space-y-1 text-blue-800">
                  {analyticsResult.hiddenProblems.technologyIssues.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 5: AI Risk Monitoring */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 5 · AI Risk Monitoring & Hallucination Traps
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Hallucination Trap Comments
                </h4>
                {analyticsResult.aiRiskMonitoring.hallucinationTraps.map((h: any, i: number) => (
                  <div key={i} className="mt-2 text-purple-800">
                    <span className="font-mono font-semibold">{h.recordId}: </span>
                    <span>{h.note}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <h4 className="font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-rose-600" />
                  Cases Requiring Human Review ({analyticsResult.aiRiskMonitoring.casesRequiringHumanReview.length})
                </h4>
                {analyticsResult.aiRiskMonitoring.casesRequiringHumanReview.map((c: any, i: number) => (
                  <div key={i} className="mt-2 text-rose-800">
                    <span className="font-mono font-semibold">{c.recordId}: </span>
                    <span>{c.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 6: Executive Recommendations */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Section 6 · C-Suite Executive Recommendations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <h4 className="font-bold text-emerald-400 uppercase text-[11px] mb-2">
                  Top 5 Organizational Priorities
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {analyticsResult.executiveRecommendations.topPriorities.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">0{i + 1}.</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-blue-400 uppercase text-[11px] mb-2">
                  Quick Wins (Within 3 Months)
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {analyticsResult.executiveRecommendations.quickWins.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-mono">⚡</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-purple-400 uppercase text-[11px] mb-2">
                  Long-Term AI Opportunities (6–12 Mo)
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  {analyticsResult.executiveRecommendations.longTermAIOpportunities.map((o: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-purple-400 font-mono">🚀</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. VISIT-TYPE & AGE-GROUP ROUTING & CAPACITY AGENT */}
      {activeAgentId === 'routing-capacity' && routingResult && (
        <div className="space-y-6">
          {/* Top Cross-Tabulation Matrix required by instructions! */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cross-Tabulation Matrix: Patient Volume by Visit Type & Age Group
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Step 1 & Step 2 demographic intersection showing utilization and departmental capacity flags.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500">
                Total Sample: {routingResult.crossTabulation.ageTotals.total}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Visit Type</th>
                    <th className="py-3 px-4 text-center">Pediatric Caregiver</th>
                    <th className="py-3 px-4 text-center">Adult (18-64)</th>
                    <th className="py-3 px-4 text-center">Senior (65+)</th>
                    <th className="py-3 px-4 text-center font-bold">Total Volume</th>
                    <th className="py-3 px-4 text-center">Capacity Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routingResult.crossTabulation.matrix.map((row: any) => (
                    <tr key={row.visitType} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.visitType}</td>
                      <td className="py-3 px-4 text-center font-mono font-medium">{row.pediatricCount}</td>
                      <td className="py-3 px-4 text-center font-mono font-medium">{row.adultCount}</td>
                      <td className="py-3 px-4 text-center font-mono font-medium">{row.seniorCount}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                        {row.total}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            row.capacityRisk === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : row.capacityRisk === 'Moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {row.capacityRisk}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td className="py-3 px-4">Total By Age Group</td>
                    <td className="py-3 px-4 text-center font-mono">
                      {routingResult.crossTabulation.ageTotals.pediatric}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {routingResult.crossTabulation.ageTotals.adult}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {routingResult.crossTabulation.ageTotals.senior}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-blue-700">
                      {routingResult.crossTabulation.ageTotals.total}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">·</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Departmental Routings Case Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {routingResult.caseRoutings.slice(0, 8).map((item: any) => (
              <div key={item.recordId} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                      {item.recordId}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      Dept Owner: {item.departmentOwner}
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      item.capacityFlag === 'Capacity Strain'
                        ? 'bg-rose-100 text-rose-800'
                        : item.capacityFlag === 'Equipment Mismatch'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.capacityFlag}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-2">
                  <strong>Managerial Directive:</strong> {item.managerialDirective}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Actionable Routing & Capacity Recommendations required by instructions! */}
          <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Departmental Routing & Capacity Directives for Hospital Leadership
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {routingResult.departmentalDirectives.map((d: any, i: number) => (
                <div key={i} className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-100 text-sm">{d.department}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        d.status === 'Urgent Reallocation'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : d.status === 'Watch'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{d.directive}</p>
                  <div className="mt-3 text-[11px] font-mono text-teal-400">
                    Recommended: {d.recommendedStaffing}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
