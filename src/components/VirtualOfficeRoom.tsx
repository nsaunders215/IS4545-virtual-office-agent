import React from 'react';
import { AgentMetadata, AgentStatus } from '../types/clinical';
import { AgentAvatar } from './AgentAvatar';
import { Check, Play, Settings, Eye, AlertCircle, Sparkles } from 'lucide-react';

interface VirtualOfficeRoomProps {
  metadata: AgentMetadata;
  status: AgentStatus;
  progress: number;
  currentStep?: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  onOpenWorkspace: () => void;
  onQuickRun: () => void;
  onViewResults: () => void;
}

export const VirtualOfficeRoom: React.FC<VirtualOfficeRoomProps> = ({
  metadata,
  status,
  progress,
  currentStep,
  isSelected,
  onToggleSelect,
  onOpenWorkspace,
  onQuickRun,
  onViewResults,
}) => {
  const isWorking = status === 'processing';
  const isCompleted = status === 'completed';

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 bg-white shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={(e) => {
        // Only trigger open workspace if not clicking on child buttons
        if ((e.target as HTMLElement).closest('button')) return;
        onOpenWorkspace();
      }}
    >
      {/* Top Architectural Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
            {metadata.roomNumber}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-slate-800 truncate max-w-[150px]">
            {metadata.roomName}
          </span>
        </div>

        {/* Selection Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
            isSelected
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
          title={isSelected ? 'Deselect agent' : 'Select agent'}
        >
          <div
            className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
              isSelected ? 'bg-white border-white text-blue-600' : 'border-slate-300'
            }`}
          >
            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span className="whitespace-nowrap">{isSelected ? 'Selected' : 'Select'}</span>
        </button>
      </div>

      {/* Main Room Floor: Avatar + Agent Info */}
      <div className="p-5 flex gap-4 items-start">
        {/* Avatar in Office setting */}
        <div className="shrink-0">
          <AgentAvatar agentId={metadata.id} status={status} size="lg" />
        </div>

        {/* Agent Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {metadata.name}
            </h3>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1">
            {metadata.title}
          </p>

          <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
            {metadata.shortDescription}
          </p>

          {/* Key tasks pill-free tags */}
          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-slate-400">
            <span>{metadata.tasksOverview[0]}</span>
            <span>·</span>
            <span>{metadata.tasksOverview[1]}</span>
          </div>
        </div>
      </div>

      {/* Live Working Progress Banner if Active */}
      {isWorking && (
        <div className="px-5 py-2.5 bg-amber-50/80 border-t border-b border-amber-200/60">
          <div className="flex items-center justify-between text-xs text-amber-900 font-medium mb-1.5">
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              {currentStep || 'Analyzing clinical records...'}
            </span>
            <span className="font-mono tabular-nums font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Room Footer Action Strip */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isWorking
                ? 'bg-amber-500 animate-ping'
                : isCompleted
                ? 'bg-emerald-500'
                : isSelected
                ? 'bg-blue-500'
                : 'bg-slate-300'
            }`}
          />
          <span className="text-slate-600 font-medium capitalize">
            {isWorking ? 'Processing' : isCompleted ? 'Completed' : isSelected ? 'Ready' : 'Idle'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewResults();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Results</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickRun();
              }}
              disabled={isWorking}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            >
              <Play className="w-3 h-3 text-slate-700" />
              <span>Analyze</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenWorkspace();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Configure or view role specifications"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
