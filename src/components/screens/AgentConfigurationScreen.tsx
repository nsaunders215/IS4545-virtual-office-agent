import React from 'react';
import { AgentMetadata, AgentExecutionState } from '../../types/clinical';
import { AgentAvatar } from '../AgentAvatar';
import { Check, Play, Sliders, CheckSquare, Square, Info, Sparkles } from 'lucide-react';

interface AgentConfigurationScreenProps {
  agents: AgentMetadata[];
  selectedAgentIds: Set<string>;
  onToggleSelectAgent: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  executionStates: Record<string, AgentExecutionState>;
  onUpdateAgentOption: (
    agentId: string,
    key: 'depth' | 'priorityThreshold' | 'customPromptAppend',
    value: any
  ) => void;
  onStartSimultaneousAnalysis: () => void;
  recordCount: number;
}

export const AgentConfigurationScreen: React.FC<AgentConfigurationScreenProps> = ({
  agents,
  selectedAgentIds,
  onToggleSelectAgent,
  onSelectAll,
  onClearSelection,
  executionStates,
  onUpdateAgentOption,
  onStartSimultaneousAnalysis,
  recordCount,
}) => {
  const selectedCount = selectedAgentIds.size;

  return (
    <div className="space-y-8">
      {/* Configuration Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Agent Selection & Analysis Configuration
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Choose which agents to deploy and configure task sensitivity, analytical depth, and review priorities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onSelectAll}
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

          <button
            onClick={onStartSimultaneousAnalysis}
            disabled={selectedCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Analysis ({selectedCount} Selected)</span>
          </button>
        </div>
      </div>

      {/* Agents Configuration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const isSelected = selectedAgentIds.has(agent.id);
          const state = executionStates[agent.id] || {
            options: { depth: 'standard', priorityThreshold: 'all', customPromptAppend: '' },
          };

          return (
            <div
              key={agent.id}
              className={`rounded-2xl border transition-all p-5 bg-white shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200 opacity-80'
              }`}
            >
              {/* Agent Title & Toggle */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <AgentAvatar
                      agentId={agent.id}
                      status={isSelected ? 'selected' : 'idle'}
                      size="sm"
                      showOfficeBackground={false}
                    />
                    <div>
                      <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase">
                        {agent.roomNumber} · {agent.roomName}
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{agent.name}</h3>
                      <p className="text-xs text-slate-500">{agent.title}</p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => onToggleSelectAgent(agent.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-white border-white text-blue-600' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{isSelected ? 'Enabled' : 'Disabled'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {agent.shortDescription}
                </p>

                {/* Per-Agent Options (when enabled) */}
                {isSelected ? (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-slate-700 font-medium">Analytical Depth:</label>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => onUpdateAgentOption(agent.id, 'depth', 'standard')}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            state.options?.depth === 'standard'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Standard
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateAgentOption(agent.id, 'depth', 'deep')}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            state.options?.depth === 'deep'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Exhaustive Deep
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <label className="text-slate-700 font-medium">Triage Priority Filter:</label>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAgentOption(agent.id, 'priorityThreshold', 'all')
                          }
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            state.options?.priorityThreshold === 'all'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All Cases ({recordCount})
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateAgentOption(agent.id, 'priorityThreshold', 'high-only')
                          }
                          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                            state.options?.priorityThreshold === 'high-only'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          High & Critical Only
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-500 font-medium block mb-1">
                        Custom Clinical Directive / Focus (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Prioritize Title VI language access & pediatric respiratory..."
                        value={state.options?.customPromptAppend || ''}
                        onChange={(e) =>
                          onUpdateAgentOption(agent.id, 'customPromptAppend', e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
                    Agent disabled for this run. Enable above to configure tasks.
                  </div>
                )}
              </div>

              {/* Task Deliverable Count */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{agent.tasksOverview.length} standard analytical tasks</span>
                <span>Parallel Multi-Agent</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch Action Footer */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold">Ready to Start Parallel Processing</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {selectedCount} agents will run simultaneously across {recordCount} patient records.
          </p>
        </div>

        <button
          onClick={onStartSimultaneousAnalysis}
          disabled={selectedCount === 0}
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Multi-Agent Analysis Now</span>
        </button>
      </div>
    </div>
  );
};
