import React from 'react';
import { AgentMetadata, AgentStatus } from '../types/clinical';
import { AgentAvatar } from './AgentAvatar';
import { X, Play, Sliders, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface AgentWorkspaceModalProps {
  metadata: AgentMetadata | null;
  status: AgentStatus;
  isOpen: boolean;
  onClose: () => void;
  onRunAgent: (agentId: string) => void;
}

export const AgentWorkspaceModal: React.FC<AgentWorkspaceModalProps> = ({
  metadata,
  status,
  isOpen,
  onClose,
  onRunAgent,
}) => {
  if (!isOpen || !metadata) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <AgentAvatar agentId={metadata.id} status={status} size="sm" showOfficeBackground={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                  {metadata.roomNumber}
                </span>
                <span className="text-slate-300">·</span>
                <h2 className="text-base font-bold text-slate-900">{metadata.name}</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">{metadata.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Functional Role & Room Mission */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Role & Core Responsibilities
            </h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 leading-relaxed text-slate-800">
              {metadata.shortDescription}
            </div>
          </div>

          {/* Prompt Tasks Specification */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Full Prompt Specification & Analytical Workflow
            </h4>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto border border-slate-800">
              {metadata.systemPrompt}
            </div>
          </div>

          {/* Tasks Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Key Output Deliverables
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {metadata.tasksOverview.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Harbor Notice */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
            <p>
              <strong>Clinical Decision Support Protocol:</strong> This agent operates under human-in-the-loop oversight. AI observations must be reviewed by designated clinical leadership before implementation.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Assigned Room: <strong>{metadata.roomName}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onRunAgent(metadata.id);
                onClose();
              }}
              disabled={status === 'processing'}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Run Agent Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
