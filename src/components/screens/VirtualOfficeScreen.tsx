import React from 'react';
import { AgentMetadata, AgentStatus, PatientRecord } from '../../types/clinical';
import { VirtualOfficeRoom } from '../VirtualOfficeRoom';
import {
  Building2,
  Play,
  Upload,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';

interface VirtualOfficeScreenProps {
  agents: AgentMetadata[];
  agentStates: Record<string, { status: AgentStatus; progress: number; currentStep: string }>;
  selectedAgentIds: Set<string>;
  onToggleSelectAgent: (id: string) => void;
  onSelectAllAgents: () => void;
  onClearSelection: () => void;
  onOpenWorkspace: (agent: AgentMetadata) => void;
  onQuickRunAgent: (id: string) => void;
  onViewResults: (id?: string) => void;
  onLaunchSimultaneous: () => void;
  onNavigateToUpload: () => void;
  onNavigateToConfigure: () => void;
  onNavigateToExecutive: () => void;
  dataset: PatientRecord[];
}

export const VirtualOfficeScreen: React.FC<VirtualOfficeScreenProps> = ({
  agents,
  agentStates,
  selectedAgentIds,
  onToggleSelectAgent,
  onSelectAllAgents,
  onClearSelection,
  onOpenWorkspace,
  onQuickRunAgent,
  onViewResults,
  onLaunchSimultaneous,
  onNavigateToUpload,
  onNavigateToConfigure,
  onNavigateToExecutive,
  dataset,
}) => {
  // Counts
  const counts = {
    idle: 0,
    selected: 0,
    processing: 0,
    completed: 0,
    error: 0,
  };

  agents.forEach((a) => {
    const s = agentStates[a.id]?.status || 'idle';
    if (s === 'processing') counts.processing++;
    else if (s === 'completed') counts.completed++;
    else if (s === 'error') counts.error++;
    else if (selectedAgentIds.has(a.id)) counts.selected++;
    else counts.idle++;
  });

  const anyProcessing = counts.processing > 0;
  const anyCompleted = counts.completed > 0;
  const selectedCount = selectedAgentIds.size;

  return (
    <div className="space-y-8">
      {/* Virtual Office Floor Plan Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Clinical Virtual Office · Multi-Agent Operations Floor</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Six Specialized Healthcare Intelligence Rooms
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Each AI agent operates from an assigned virtual room with independent analytical responsibilities, animated working indicators, and dedicated clinical dashboards.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onNavigateToUpload}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Dataset</span>
            </button>

            <button
              onClick={onNavigateToConfigure}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Run</span>
            </button>

            <button
              onClick={onLaunchSimultaneous}
              disabled={anyProcessing || selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {anyProcessing
                  ? 'Analysis in Progress...'
                  : `Run ${selectedCount === 6 ? 'All 6' : selectedCount} Selected`}
              </span>
            </button>
          </div>
        </div>

        {/* Shared Activity & Telemetry Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Status Breakdown */}
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 font-medium">Activity Status:</span>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span className="text-slate-600 font-mono tabular-nums">{counts.idle} Idle</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-600 font-mono tabular-nums">{counts.selected} Selected</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-amber-800 font-semibold font-mono tabular-nums">{counts.processing} Processing</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-800 font-semibold font-mono tabular-nums">{counts.completed} Completed</span>
            </div>
          </div>

          {/* Active Dataset Pill-Free Metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Dataset: <strong>{dataset.length}</strong> De-Identified Patient Records</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Synthetic HIPAA Compliant</span>
          </div>

          {/* Quick Selection Toggles */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onSelectAllAgents}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Select All (6)
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onClearSelection}
              className="text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Six Agent Virtual Office Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const state = agentStates[agent.id] || { status: 'idle', progress: 0, currentStep: '' };
          const isSelected = selectedAgentIds.has(agent.id);

          return (
            <VirtualOfficeRoom
              key={agent.id}
              metadata={agent}
              status={state.status}
              progress={state.progress}
              currentStep={state.currentStep}
              isSelected={isSelected}
              onToggleSelect={() => onToggleSelectAgent(agent.id)}
              onOpenWorkspace={() => onOpenWorkspace(agent)}
              onQuickRun={() => onQuickRunAgent(agent.id)}
              onViewResults={() => onViewResults(agent.id)}
            />
          );
        })}
      </div>

      {/* Bottom Executive & Combined Review Callout */}
      {anyCompleted && (
        <div className="p-6 bg-linear-to-r from-blue-900 to-slate-900 text-white rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Multi-Agent Findings Available</span>
            </div>
            <h3 className="text-lg font-bold">Cross-Agent Executive Intelligence & Review Queue</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Inspect corroborated findings, conflicting interpretations, prioritized operational risks, and the human oversight queue.
            </p>
          </div>

          <button
            onClick={onNavigateToExecutive}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm shrink-0"
          >
            <span>Open Executive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Responsible AI & Human Review Safe Harbor Notice */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Responsible Clinical AI Notice:</strong> The six virtual AI agents assist healthcare management by identifying operational trends, triage priorities, equity gaps, and satisfaction metrics. Agents do not make independent medical diagnoses, clinical treatment decisions, employment evaluations, or final legal compliance determinations. All high-risk cases require designated human managerial review.
        </div>
      </div>
    </div>
  );
};
