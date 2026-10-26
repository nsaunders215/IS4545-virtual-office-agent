/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AgentId,
  AgentMetadata,
  AgentStatus,
  AgentExecutionState,
  PatientRecord,
  ScreenTab,
  AnalysisOutputBundle,
} from './types/clinical';
import { CLINICAL_AGENTS } from './data/agentMetadata';
import { DEFAULT_BENCHMARK_PATIENTS } from './data/defaultBenchmarkData';
import {
  runAgentAnalysis,
  analyzeFeedbackInsight,
  analyzeExperienceMonitoring,
  analyzeComplaintTriage,
  analyzeManagerDecision,
  analyzeHealthcareAnalytics,
  analyzeRoutingCapacity,
  synthesizeCombinedInsights,
} from './services/clinicalAnalysisEngine';

// Screens
import { VirtualOfficeScreen } from './components/screens/VirtualOfficeScreen';
import { DataUploadScreen } from './components/screens/DataUploadScreen';
import { AgentConfigurationScreen } from './components/screens/AgentConfigurationScreen';
import { LiveProcessingScreen } from './components/screens/LiveProcessingScreen';
import { AgentResultsScreen } from './components/screens/AgentResultsScreen';
import { CombinedExecutiveScreen } from './components/screens/CombinedExecutiveScreen';
import { AgentWorkspaceModal } from './components/AgentWorkspaceModal';

import { Play, Sparkles, Building2, Upload, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ScreenTab>('virtual-office');
  const [dataset, setDataset] = useState<PatientRecord[]>(DEFAULT_BENCHMARK_PATIENTS);
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(
    new Set(CLINICAL_AGENTS.map((a) => a.id))
  );
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<AgentMetadata | null>(null);
  const [activeResultAgentTab, setActiveResultAgentTab] = useState<AgentId>('patient-feedback');

  // Multi-Agent Execution States
  const [executionStates, setExecutionStates] = useState<Record<string, AgentExecutionState>>(() => {
    const initial: Record<string, AgentExecutionState> = {};
    CLINICAL_AGENTS.forEach((agent) => {
      initial[agent.id] = {
        agentId: agent.id,
        status: 'idle',
        progress: 0,
        currentStep: 'Idle',
        estimatedRemainingStages: [],
        logs: [],
        options: { depth: 'standard', priorityThreshold: 'all', customPromptAppend: '' },
      };
    });
    return initial;
  });

  // Cached Output Bundle (initialized with instant pre-computed benchmark results)
  const [outputBundle, setOutputBundle] = useState<AnalysisOutputBundle>(() => {
    const feedbackResults = analyzeFeedbackInsight(DEFAULT_BENCHMARK_PATIENTS);
    const experienceResults = analyzeExperienceMonitoring(DEFAULT_BENCHMARK_PATIENTS);
    const triageResults = analyzeComplaintTriage(DEFAULT_BENCHMARK_PATIENTS);
    const managerResults = analyzeManagerDecision(DEFAULT_BENCHMARK_PATIENTS).cases;
    const analyticsResult = analyzeHealthcareAnalytics(DEFAULT_BENCHMARK_PATIENTS);
    const routingResult = analyzeRoutingCapacity(DEFAULT_BENCHMARK_PATIENTS);
    const combinedInsights = synthesizeCombinedInsights(
      DEFAULT_BENCHMARK_PATIENTS,
      feedbackResults,
      experienceResults,
      triageResults,
      managerResults,
      analyticsResult,
      routingResult
    );

    return {
      feedbackResults,
      experienceResults,
      triageResults,
      managerResults,
      analyticsResult,
      routingResult,
      combinedInsights,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
  });

  // Toggle selection
  const handleToggleSelectAgent = (id: string) => {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllAgents = () => {
    setSelectedAgentIds(new Set(CLINICAL_AGENTS.map((a) => a.id)));
  };

  const handleClearSelection = () => {
    setSelectedAgentIds(new Set());
  };

  const handleUpdateAgentOption = (
    agentId: string,
    key: 'depth' | 'priorityThreshold' | 'customPromptAppend',
    value: any
  ) => {
    setExecutionStates((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        options: {
          ...prev[agentId].options,
          [key]: value,
        },
      },
    }));
  };

  // Run a single agent
  const handleRunSingleAgent = async (agentId: string) => {
    setActiveTab('live-processing');
    setExecutionStates((prev) => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        status: 'processing',
        progress: 10,
        currentStep: 'Initializing agent tasks...',
      },
    }));

    try {
      const res = await runAgentAnalysis(agentId as AgentId, dataset, (pct, step, preview) => {
        setExecutionStates((prev) => ({
          ...prev,
          [agentId]: {
            ...prev[agentId],
            progress: pct,
            currentStep: step,
            newlyGeneratedPreview: preview,
          },
        }));
      });

      // Update output bundle
      setOutputBundle((prev: AnalysisOutputBundle) => {
        const updated = { ...prev };
        if (agentId === 'patient-feedback') updated.feedbackResults = res;
        else if (agentId === 'patient-experience') updated.experienceResults = res;
        else if (agentId === 'complaint-triage') updated.triageResults = res;
        else if (agentId === 'hospital-manager') updated.managerResults = res.cases;
        else if (agentId === 'healthcare-analytics') updated.analyticsResult = res;
        else if (agentId === 'routing-capacity') updated.routingResult = res;

        // Re-synthesize combined insights
        updated.combinedInsights = synthesizeCombinedInsights(
          dataset,
          updated.feedbackResults || analyzeFeedbackInsight(dataset),
          updated.experienceResults || analyzeExperienceMonitoring(dataset),
          updated.triageResults || analyzeComplaintTriage(dataset),
          updated.managerResults || analyzeManagerDecision(dataset).cases,
          updated.analyticsResult || analyzeHealthcareAnalytics(dataset),
          updated.routingResult || analyzeRoutingCapacity(dataset)
        );
        updated.timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        return updated;
      });

      setExecutionStates((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'completed',
          progress: 100,
          currentStep: 'Completed',
          completedAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch (err: any) {
      setExecutionStates((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'error',
          error: err.message,
        },
      }));
    }
  };

  // Run all selected agents in parallel
  const handleLaunchSimultaneousAnalysis = async () => {
    const agentsToRun = CLINICAL_AGENTS.filter((a) => selectedAgentIds.has(a.id));
    if (agentsToRun.length === 0) return;

    setActiveTab('live-processing');

    // Set all to processing
    setExecutionStates((prev) => {
      const next = { ...prev };
      agentsToRun.forEach((a) => {
        next[a.id] = {
          ...next[a.id],
          status: 'processing',
          progress: 15,
          currentStep: 'Parallel agent dispatch initiated...',
        };
      });
      return next;
    });

    // Execute in parallel
    const promises = agentsToRun.map(async (agent) => {
      try {
        const res = await runAgentAnalysis(agent.id, dataset, (pct, step, preview) => {
          setExecutionStates((prev) => ({
            ...prev,
            [agent.id]: {
              ...prev[agent.id],
              progress: pct,
              currentStep: step,
              newlyGeneratedPreview: preview,
            },
          }));
        });

        setExecutionStates((prev) => ({
          ...prev,
          [agent.id]: {
            ...prev[agent.id],
            status: 'completed',
            progress: 100,
            currentStep: 'Analysis Complete',
            completedAt: new Date().toLocaleTimeString(),
          },
        }));

        return { agentId: agent.id, data: res };
      } catch (err: any) {
        setExecutionStates((prev) => ({
          ...prev,
          [agent.id]: {
            ...prev[agent.id],
            status: 'error',
            error: err.message,
          },
        }));
        return { agentId: agent.id, error: err.message };
      }
    });

    const results = await Promise.all(promises);

    // Update entire output bundle and combined insights
    const feedbackResults = analyzeFeedbackInsight(dataset);
    const experienceResults = analyzeExperienceMonitoring(dataset);
    const triageResults = analyzeComplaintTriage(dataset);
    const managerResults = analyzeManagerDecision(dataset).cases;
    const analyticsResult = analyzeHealthcareAnalytics(dataset);
    const routingResult = analyzeRoutingCapacity(dataset);

    const combinedInsights = synthesizeCombinedInsights(
      dataset,
      feedbackResults,
      experienceResults,
      triageResults,
      managerResults,
      analyticsResult,
      routingResult
    );

    setOutputBundle({
      feedbackResults,
      experienceResults,
      triageResults,
      managerResults,
      analyticsResult,
      routingResult,
      combinedInsights,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
  };

  const handleCancelAgent = (id: string) => {
    setExecutionStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: 'idle',
        progress: 0,
        currentStep: 'Cancelled by user',
      },
    }));
  };

  const handleUpdateHumanReview = (
    id: string,
    decision: 'Approved' | 'Escalated' | 'Dismissed',
    notes: string
  ) => {
    setOutputBundle((prev: AnalysisOutputBundle) => {
      const updatedQueue = prev.combinedInsights.humanReviewQueue.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            humanDecisionStatus: decision,
            humanNotes: notes,
            reviewedBy: 'Hospital Operations Director',
            reviewedAt: new Date().toLocaleTimeString(),
          };
        }
        return item;
      });

      return {
        ...prev,
        combinedInsights: {
          ...prev.combinedInsights,
          humanReviewQueue: updatedQueue,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark (Single line text, no badges/descriptors) */}
          <button
            onClick={() => setActiveTab('virtual-office')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors text-left"
          >
            Aetheria Clinical Virtual-Office
          </button>

          {/* Zone 2: Navigation Links (Single-line whitespace-nowrap) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('virtual-office')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'virtual-office' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Virtual Office
            </button>

            <button
              onClick={() => setActiveTab('upload-data')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'upload-data' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Dataset
            </button>

            <button
              onClick={() => setActiveTab('configure-agents')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'configure-agents' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Configure
            </button>

            <button
              onClick={() => setActiveTab('live-processing')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'live-processing' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Live Processing
            </button>

            <button
              onClick={() => setActiveTab('agent-results')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'agent-results' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Agent Results
            </button>

            <button
              onClick={() => setActiveTab('executive-dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'executive-dashboard' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              Executive
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleLaunchSimultaneousAnalysis}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Selected Agents</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'virtual-office' && (
          <VirtualOfficeScreen
            agents={CLINICAL_AGENTS}
            agentStates={executionStates}
            selectedAgentIds={selectedAgentIds}
            onToggleSelectAgent={handleToggleSelectAgent}
            onSelectAllAgents={handleSelectAllAgents}
            onClearSelection={handleClearSelection}
            onOpenWorkspace={(agent) => setSelectedAgentForModal(agent)}
            onQuickRunAgent={handleRunSingleAgent}
            onViewResults={(id) => {
              if (id) setActiveResultAgentTab(id as AgentId);
              setActiveTab('agent-results');
            }}
            onLaunchSimultaneous={handleLaunchSimultaneousAnalysis}
            onNavigateToUpload={() => setActiveTab('upload-data')}
            onNavigateToConfigure={() => setActiveTab('configure-agents')}
            onNavigateToExecutive={() => setActiveTab('executive-dashboard')}
            dataset={dataset}
          />
        )}

        {activeTab === 'upload-data' && (
          <DataUploadScreen
            currentDataset={dataset}
            onUpdateDataset={(newRecords) => setDataset(newRecords)}
            onProceedToConfigure={() => setActiveTab('configure-agents')}
          />
        )}

        {activeTab === 'configure-agents' && (
          <AgentConfigurationScreen
            agents={CLINICAL_AGENTS}
            selectedAgentIds={selectedAgentIds}
            onToggleSelectAgent={handleToggleSelectAgent}
            onSelectAll={handleSelectAllAgents}
            onClearSelection={handleClearSelection}
            executionStates={executionStates}
            onUpdateAgentOption={handleUpdateAgentOption}
            onStartSimultaneousAnalysis={handleLaunchSimultaneousAnalysis}
            recordCount={dataset.length}
          />
        )}

        {activeTab === 'live-processing' && (
          <LiveProcessingScreen
            agents={CLINICAL_AGENTS}
            executionStates={executionStates}
            onCancelAgent={handleCancelAgent}
            onRerunAgent={handleRunSingleAgent}
            onViewResults={(id) => {
              if (id) setActiveResultAgentTab(id as AgentId);
              setActiveTab('agent-results');
            }}
            onViewExecutive={() => setActiveTab('executive-dashboard')}
            dataset={dataset}
          />
        )}

        {activeTab === 'agent-results' && (
          <AgentResultsScreen
            agents={CLINICAL_AGENTS}
            activeAgentId={activeResultAgentTab}
            onSelectAgentTab={(id) => setActiveResultAgentTab(id)}
            outputBundle={outputBundle}
            onNavigateToExecutive={() => setActiveTab('executive-dashboard')}
          />
        )}

        {activeTab === 'executive-dashboard' && (
          <CombinedExecutiveScreen
            insights={outputBundle.combinedInsights}
            agents={CLINICAL_AGENTS}
            onUpdateHumanReview={handleUpdateHumanReview}
            onNavigateToAgent={(agentId) => {
              setActiveResultAgentTab(agentId);
              setActiveTab('agent-results');
            }}
            completedTimestamp={outputBundle.timestamp}
          />
        )}
      </main>

      {/* Agent Workspace Detail Modal */}
      <AgentWorkspaceModal
        metadata={selectedAgentForModal}
        status={selectedAgentForModal ? executionStates[selectedAgentForModal.id]?.status || 'idle' : 'idle'}
        isOpen={!!selectedAgentForModal}
        onClose={() => setSelectedAgentForModal(null)}
        onRunAgent={(id) => handleRunSingleAgent(id)}
      />

      {/* Clean Editorial Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>Aetheria Clinical Virtual-Office Portal</span>
            <span className="mx-2">·</span>
            <span>Six Specialized Healthcare Intelligence AI Agents</span>
          </div>

          <div className="flex items-center gap-4">
            <span>De-Identified Synthetic Data Protocol</span>
            <span>·</span>
            <span>Human-In-The-Loop Governance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
