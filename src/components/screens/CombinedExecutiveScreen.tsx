import React, { useState } from 'react';
import { CombinedInsights, AgentMetadata, AgentId } from '../../types/clinical';
import {
  Layers,
  ShieldAlert,
  GitCompare,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Clock,
  Download,
  AlertTriangle,
  FileText,
  Calendar,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface CombinedExecutiveScreenProps {
  insights: CombinedInsights;
  agents: AgentMetadata[];
  onUpdateHumanReview: (
    id: string,
    decision: 'Approved' | 'Escalated' | 'Dismissed',
    notes: string
  ) => void;
  onNavigateToAgent: (agentId: AgentId) => void;
  completedTimestamp: string;
}

export const CombinedExecutiveScreen: React.FC<CombinedExecutiveScreenProps> = ({
  insights,
  agents,
  onUpdateHumanReview,
  onNavigateToAgent,
  completedTimestamp,
}) => {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const getAgentName = (id: AgentId) => {
    return agents.find((a) => a.id === id)?.name || id;
  };

  const handleDownloadExecutiveReport = () => {
    const reportData = {
      title: 'Aetheria Clinical Virtual-Office Executive Report',
      analysisCompleted: completedTimestamp,
      multiAgentCorroborated: insights.multiAgentCorroborated,
      prioritizedRisks: insights.prioritizedRisks,
      conflictingInterpretations: insights.conflictingInterpretations,
      humanReviewQueue: insights.humanReviewQueue,
      recommendedNextActions: insights.nextActions,
      missingDataNotices: insights.missingDataWarnings,
    };

    const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical_executive_multiagent_report_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Executive Command Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Cross-Agent Intelligence & Synthesis</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Combined Executive Dashboard
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Correlated operational findings, cross-agent corroboration, conflicting interpretations, and human review governance across all six specialized clinical agents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right text-xs text-slate-400 font-mono hidden sm:block">
            <span>Completed: </span>
            <span className="text-slate-700 font-semibold">{completedTimestamp}</span>
          </div>

          <button
            onClick={handleDownloadExecutiveReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Executive Report</span>
          </button>
        </div>
      </div>

      {/* 1. Multi-Agent Corroborated Findings (Supported by 2+ Agents) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            Cross-Agent Corroborated Findings (Supported by 2+ Agents)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Systemic issues independently validated across multiple specialized clinical lenses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.multiAgentCorroborated.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      item.impactLevel === 'Critical'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.impactLevel} Impact
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">{item.finding}</p>

                {/* Evidence quotes / IDs */}
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mb-4">
                  <span>Evidence Records:</span>
                  {item.evidenceIds.map((id) => (
                    <span key={id} className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
                      {id}
                    </span>
                  ))}
                </div>
              </div>

              {/* Supporting Agents Attribution */}
              <div className="pt-3 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Corroborated By:</span>
                {item.agentsInvolved.map((agentId) => (
                  <button
                    key={agentId}
                    onClick={() => onNavigateToAgent(agentId)}
                    className="text-[11px] font-medium text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
                  >
                    {getAgentName(agentId)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Prioritized Organizational Risks (Ranked 1 to 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Top Prioritized Institutional Risks & Opportunities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked risk exposures combining clinical safety, regulatory liability, and reputational hazard.
          </p>
        </div>

        <div className="space-y-3">
          {insights.prioritizedRisks.map((risk) => (
            <div
              key={risk.rank}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                  {risk.rank}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{risk.issue}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        risk.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {risk.severity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Affected Domain: <strong className="text-slate-700">{risk.affectedArea}</strong>
                  </p>
                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                    <strong>Mitigation: </strong> {risk.suggestedMitigation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Conflicting Interpretations Between Agents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-600" />
            Conflicting Interpretations Between Agents
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instances where specialized analytical agents reached divergent conclusions on the same case.
          </p>
        </div>

        <div className="space-y-4">
          {insights.conflictingInterpretations.map((conflict, i) => (
            <div key={i} className="p-5 rounded-xl border border-purple-100 bg-purple-50/30 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-purple-900 text-xs bg-purple-100 px-2 py-0.5 rounded">
                  Case {conflict.recordId}
                </span>
                <span className="font-semibold text-slate-700">{conflict.topic}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <span className="font-semibold text-blue-700 block mb-1">
                    Agent A ({getAgentName(conflict.agentA.agentId)}):
                  </span>
                  <p className="text-slate-700">{conflict.agentA.claim}</p>
                </div>

                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <span className="font-semibold text-rose-700 block mb-1">
                    Agent B ({getAgentName(conflict.agentB.agentId)}):
                  </span>
                  <p className="text-slate-700">{conflict.agentB.claim}</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-white/90 rounded-lg border border-purple-200 text-purple-950">
                <strong>Recommended Human Leadership Resolution: </strong>
                {conflict.recommendedResolution}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Human-Review Queue & Governance Checkpoints */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Human-Review Governance Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-risk cases requiring professional or managerial confirmation before operational execution.
            </p>
          </div>

          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {insights.humanReviewQueue.filter((q) => q.humanDecisionStatus === 'Pending Review').length} Pending Review
          </span>
        </div>

        <div className="space-y-4">
          {insights.humanReviewQueue.map((queueItem) => (
            <div
              key={queueItem.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {queueItem.patientId}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800">{queueItem.primaryReason}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      queueItem.humanDecisionStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : queueItem.humanDecisionStatus === 'Escalated'
                        ? 'bg-rose-100 text-rose-800'
                        : queueItem.humanDecisionStatus === 'Dismissed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {queueItem.humanDecisionStatus}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                "{queueItem.evidenceQuote}"
              </div>

              <div className="text-xs text-slate-700">
                <strong>AI Finding: </strong> {queueItem.aiFinding}
              </div>

              {/* Review notes if entered */}
              {queueItem.humanNotes && (
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900">
                  <strong>Decision Note: </strong> {queueItem.humanNotes}
                  <span className="text-[10px] text-blue-600 block mt-0.5">
                    Recorded at {queueItem.reviewedAt} by {queueItem.reviewedBy}
                  </span>
                </div>
              )}

              {/* Decision Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-[11px] text-slate-400">
                  Flagged by:{' '}
                  {queueItem.flaggedBy.map((id) => getAgentName(id)).join(', ')}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onUpdateHumanReview(
                        queueItem.id,
                        'Approved',
                        'Clinically verified by hospital quality team.'
                      );
                    }}
                    className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    Approve Action
                  </button>

                  <button
                    onClick={() => {
                      onUpdateHumanReview(
                        queueItem.id,
                        'Escalated',
                        'Escalated to Chief Medical Officer & Legal Counsel.'
                      );
                    }}
                    className="px-3 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  >
                    Escalate to CMO
                  </button>

                  <button
                    onClick={() => {
                      onUpdateHumanReview(
                        queueItem.id,
                        'Dismissed',
                        'Reviewed and resolved at department level.'
                      );
                    }}
                    className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recommended Strategic Next Actions by Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Recommended Operational Next Actions by Timeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequenced clinical directives based on cross-agent analytical findings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {['Immediate (24-48h)', 'Short Term (1-4w)', 'Strategic (1-3m)'].map((tl) => {
            const actions = insights.nextActions.filter((a) => a.timeline === tl);
            return (
              <div key={tl} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-3 pb-2 border-b border-slate-200">
                    {tl}
                  </span>

                  <div className="space-y-3">
                    {actions.map((act, i) => (
                      <div key={i} className="text-slate-700">
                        <p className="leading-relaxed font-medium">{act.action}</p>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <span>Owner: <strong>{act.ownerRole}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                  Priority Directive
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Areas Where Additional Data May Be Needed */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-1">Administrative Data Quality & Gap Notices:</strong>
          <ul className="list-disc pl-4 space-y-1 text-amber-800">
            {insights.missingDataWarnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
