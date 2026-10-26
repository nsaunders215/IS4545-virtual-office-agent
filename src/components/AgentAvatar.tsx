import React from 'react';
import { AgentId, AgentStatus } from '../types/clinical';

interface AgentAvatarProps {
  agentId: AgentId;
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOfficeBackground?: boolean;
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agentId,
  status,
  size = 'md',
  showOfficeBackground = true,
}) => {
  const isWorking = status === 'processing';
  const isSelected = status === 'selected';
  const isCompleted = status === 'completed';

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  }[size];

  // Colors & visual motifs per agent
  const agentConfigs: Record<
    AgentId,
    {
      skin: string;
      coat: string;
      hair: string;
      accent: string;
      deskTool: string;
      icon: string;
      wallColor: string;
    }
  > = {
    'patient-feedback': {
      skin: '#FCD34D',
      coat: '#0D9488', // Teal
      hair: '#78350F',
      accent: '#14B8A6',
      deskTool: 'Audio Wave & Headset',
      icon: '🎙️',
      wallColor: '#CCFBF1',
    },
    'patient-experience': {
      skin: '#FDE047',
      coat: '#1E40AF', // Royal Blue
      hair: '#1F2937',
      accent: '#3B82F6',
      deskTool: 'Journey Map & Tablet',
      icon: '🗺️',
      wallColor: '#DBEAFE',
    },
    'complaint-triage': {
      skin: '#FDBA74',
      coat: '#991B1B', // Crimson
      hair: '#374151',
      accent: '#EF4444',
      deskTool: 'Emergency Triage Board',
      icon: '🚨',
      wallColor: '#FEE2E2',
    },
    'hospital-manager': {
      skin: '#FBBF24',
      coat: '#4C1D95', // Violet
      hair: '#9CA3AF',
      accent: '#8B5CF6',
      deskTool: 'Operations Binder & Coffee',
      icon: '🏛️',
      wallColor: '#EDE9FE',
    },
    'healthcare-analytics': {
      skin: '#FED7AA',
      coat: '#0369A1', // Sky Blue
      hair: '#451A03',
      accent: '#0284C7',
      deskTool: 'Multi-screen Analytics Array',
      icon: '📊',
      wallColor: '#E0F2FE',
    },
    'routing-capacity': {
      skin: '#FCD34D',
      coat: '#B45309', // Amber
      hair: '#1E293B',
      accent: '#F59E0B',
      deskTool: 'Logistics Map & Radio',
      icon: '🧭',
      wallColor: '#FEF3C7',
    },
  };

  const cfg = agentConfigs[agentId];

  return (
    <div className={`relative ${sizeClasses} select-none flex items-center justify-center`}>
      {/* Office Room Backdrop */}
      {showOfficeBackground && (
        <div
          className="absolute inset-0 rounded-2xl border transition-all duration-300 overflow-hidden shadow-inner"
          style={{
            backgroundColor: cfg.wallColor,
            borderColor: isWorking ? cfg.accent : isSelected ? cfg.accent : 'rgba(0,0,0,0.08)',
          }}
        >
          {/* Subtle architectural office details */}
          <div className="absolute top-0 inset-x-0 h-4 bg-white/40 border-b border-black/5 flex items-center justify-between px-2">
            <span className="text-[9px] font-mono tracking-wider opacity-60 uppercase">Office</span>
            <span className="text-[9px] font-mono opacity-50">{cfg.icon}</span>
          </div>

          {/* Wall charts or screen lines */}
          <div className="absolute top-6 left-2 right-2 flex gap-1 opacity-25">
            <div className="h-1 flex-1 bg-slate-800 rounded-full" />
            <div className="h-1 w-3 bg-slate-800 rounded-full" />
            <div className="h-1 w-4 bg-slate-800 rounded-full" />
          </div>

          {/* Working Scanline / Glow effect */}
          {isWorking && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent animate-pulse" />
          )}
        </div>
      )}

      {/* Interactive Avatar Container */}
      <div
        className={`relative z-10 w-full h-full p-2 flex flex-col items-center justify-end transition-transform duration-300 ${
          isWorking ? 'scale-105' : ''
        }`}
      >
        {/* Holographic analysis rays when working */}
        {isWorking && (
          <div className="absolute -top-1 inset-x-4 flex justify-between pointer-events-none opacity-80">
            <span className="text-[10px] animate-bounce text-slate-700 font-mono">01</span>
            <span className="text-[10px] animate-ping text-teal-600 font-mono">✦</span>
            <span className="text-[10px] animate-bounce text-slate-700 font-mono delay-150">10</span>
          </div>
        )}

        {/* SVG Agent Illustration */}
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full max-h-[85%] transition-all ${
            isWorking ? 'animate-bounce' : ''
          }`}
          style={{ animationDuration: isWorking ? '1.8s' : '0s' }}
        >
          {/* Head & Face */}
          <circle cx="50" cy="36" r="18" fill={cfg.skin} />

          {/* Hair styles */}
          {agentId === 'patient-feedback' && (
            // Bun hair
            <path
              d="M32 34 C32 20, 68 20, 68 34 C64 24, 36 24, 32 34 Z M44 14 C44 9, 56 9, 56 14 Z"
              fill={cfg.hair}
            />
          )}
          {agentId === 'patient-experience' && (
            // Slick crop
            <path d="M32 30 C34 18, 66 18, 68 30 C60 22, 40 22, 32 30 Z" fill={cfg.hair} />
          )}
          {agentId === 'complaint-triage' && (
            // Ponytail & alert stance
            <path
              d="M32 32 C32 18, 68 18, 68 32 C68 22, 32 22, 32 32 Z M66 30 C74 34, 72 44, 70 48 Z"
              fill={cfg.hair}
            />
          )}
          {agentId === 'hospital-manager' && (
            // Distinguished grey parted hair & glasses
            <>
              <path d="M30 32 C32 17, 68 17, 70 32 C60 22, 40 22, 30 32 Z" fill={cfg.hair} />
              <rect x="38" y="32" width="10" height="6" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
              <rect x="52" y="32" width="10" height="6" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
              <line x1="48" y1="35" x2="52" y2="35" stroke="#334155" strokeWidth="1.5" />
            </>
          )}
          {agentId === 'healthcare-analytics' && (
            // Sleek bob & modern smart glasses
            <>
              <path d="M30 36 C30 20, 70 20, 70 36 C72 46, 70 48, 68 50 C68 30, 32 30, 32 50 Z" fill={cfg.hair} />
              <circle cx="43" cy="35" r="4" fill="none" stroke="#0284C7" strokeWidth="1.5" />
              <circle cx="57" cy="35" r="4" fill="none" stroke="#0284C7" strokeWidth="1.5" />
              <line x1="47" y1="35" x2="53" y2="35" stroke="#0284C7" strokeWidth="1.5" />
            </>
          )}
          {agentId === 'routing-capacity' && (
            // Short trimmed hair & headset
            <>
              <path d="M33 30 C36 20, 64 20, 67 30 Z" fill={cfg.hair} />
              <path d="M29 36 A 21 21 0 0 1 71 36" fill="none" stroke="#475569" strokeWidth="2" />
              <circle cx="29" cy="36" r="3" fill="#0F172A" />
            </>
          )}

          {/* Eyes and subtle facial expression */}
          <circle cx="43" cy="36" r="2" fill="#1E293B" />
          <circle cx="57" cy="36" r="2" fill="#1E293B" />
          <path
            d={isWorking ? 'M46 43 Q50 40 54 43' : 'M46 42 Q50 45 54 42'}
            stroke="#1E293B"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Stethoscope for clinical agents */}
          {(agentId === 'patient-feedback' || agentId === 'hospital-manager' || agentId === 'complaint-triage') && (
            <path
              d="M40 54 C40 68, 60 68, 60 54"
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Clinical Lab Coat & Shoulders */}
          <path d="M22 84 C22 56, 78 56, 78 84 Z" fill={cfg.coat} />
          {/* Shirt / Scrub V-Neck */}
          <polygon points="42,56 58,56 50,72" fill="#FFFFFF" />

          {/* Healthcare Identification Badge */}
          <rect x="33" y="66" width="10" height="12" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.5" />
          <rect x="35" y="68" width="6" height="4" fill={cfg.accent} />
          <line x1="35" y1="74" x2="41" y2="74" stroke="#94A3B8" strokeWidth="1" />

          {/* Desk / Console Base */}
          <rect x="8" y="82" width="84" height="14" rx="3" fill="#1E293B" />
          <line x1="12" y1="88" x2="88" y2="88" stroke="#334155" strokeWidth="1.5" />

          {/* Desk tool monitor or screen */}
          {agentId === 'healthcare-analytics' && (
            <rect x="64" y="74" width="20" height="12" rx="1.5" fill="#0EA5E9" opacity="0.85" />
          )}
          {agentId === 'complaint-triage' && (
            <circle cx="20" cy="88" r="3" fill={isWorking ? '#EF4444' : '#64748B'} className={isWorking ? 'animate-ping' : ''} />
          )}
          {agentId === 'patient-feedback' && (
            <rect x="16" y="76" width="16" height="8" rx="2" fill="#14B8A6" opacity="0.8" />
          )}
        </svg>

        {/* Status Indicator Chip on Avatar bottom */}
        <div className="absolute -bottom-1.5 inset-x-2 flex justify-center">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium shadow-xs transition-colors border ${
              isWorking
                ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                : isCompleted
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : isSelected
                ? 'bg-blue-100 text-blue-900 border-blue-300'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isWorking ? 'Analyzing...' : isCompleted ? 'Ready' : isSelected ? 'Active' : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
};
