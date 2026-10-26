import React from 'react';
import { AgentMetadata, AgentExecutionState, PatientRecord } from '../../types/clinical';
import { AgentAvatar } from '../AgentAvatar';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  StopCircle,
  Eye,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface LiveProcessingScreenProps {
  agents: AgentMetadata[];
  executionStates: Record<string, AgentExecutionState>;
  onCancelAgent: (id: string) => void;
  onRerunAgent: (id: string) => void;
  onViewResults: (id?: string) => void;
  onViewExecutive: () => void;
  dataset: PatientRecord[];
}

export const LiveProcessingScreen: React.FC<LiveProcessingScreenProps> = ({
  agents,
  executionStates,
  onCancelAgent,
  onRerunAgent,
  onViewResults,
  onViewExecutive,
  dataset,
}) => {
  const activeStates = Object.values(executionStates);
  const totalAgents = agents.length;
  const completedCount = activeStates.filter((s) => s.status === 'completed').length;
  const processingCount = activeStates.filter((s) => s.status === 'processing').length;
  const allFinished = processingCount === 0 && completedCount > 0;

  return (
    <div className="space-y-8">
      {/* Live Processing Control Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Parallel Multi-Agent Execution Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {allFinished
              ? 'Multi-Agent Analysis Completed'
              : 'Live Parallel Analysis in Progress'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Simultaneous multi-tasking across {dataset.length} clinical records without blocking dependent threads.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-3">
          {allFinished ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewResults()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Agent Tabs</span>
              </button>

              <button
                onClick={onViewExecutive}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs"
              >
                <span>View Executive Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 font-medium">
              <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
              <span>{processingCount} Agents Working Simultaneously...</span>
            </div>
          )}
        </div>
      </div>

      {/* Agents Live Processing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const state = executionStates[agent.id] || {
            status: 'idle',
            progress: 0,
            currentStep: 'Idle',
            estimatedRemainingStages: [],
            logs: [],
          };
          const isWorking = state.status === 'processing';
          const isDone = state.status === 'completed';
          const isError = state.status === 'error';

          return (
            <div
              key={agent.id}
              className={`rounded-2xl border p-5 bg-white shadow-xs flex flex-col justify-between transition-all ${
                isWorking
                  ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                  : isDone
                  ? 'border-emerald-300'
                  : 'border-slate-200 opacity-70'
              }`}
            >
              {/* Agent Room Title & Avatar */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">
                    {agent.roomNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isWorking
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : isError
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isWorking ? 'Processing' : isDone ? 'Completed' : isError ? 'Error' : 'Idle'}
                  </span>
                </div>

                {/* Animated Avatar Center */}
                <div className="flex items-center gap-4 mb-4">
                  <AgentAvatar agentId={agent.id} status={state.status} size="md" />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{agent.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{agent.title}</p>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      {isWorking ? 'Task execution active' : isDone ? 'Output ready' : 'Awaiting start'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Current Analytical Step */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium truncate max-w-[200px]">
                      {state.currentStep || 'Ready'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-900">
                      {state.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-500'
                          : isError
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>

                {/* Newly Generated Findings Preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block mb-1">
                    Live Findings Preview:
                  </span>
                  <p className="text-slate-700 leading-relaxed italic line-clamp-2">
                    {state.newlyGeneratedPreview ||
                      (isDone
                        ? 'Analysis complete. Full metrics and managerial recommendations available.'
                        : 'Standby for stage generation...')}
                  </p>
                </div>
              </div>

              {/* Card Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {isWorking && (
                  <button
                    type="button"
                    onClick={() => onCancelAgent(agent.id)}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
                  >
                    <StopCircle className="w-3.5 h-3.5" />
                    <span>Cancel Task</span>
                  </button>
                )}

                {(isDone || isError) && (
                  <button
                    type="button"
                    onClick={() => onRerunAgent(agent.id)}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rerun Agent</span>
                  </button>
                )}

                {isDone && (
                  <button
                    type="button"
                    onClick={() => onViewResults(agent.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
