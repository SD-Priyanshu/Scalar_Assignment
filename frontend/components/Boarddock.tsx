'use client';
import { useState, useRef, useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import { LayoutDashboard, Calendar, Trello, ArrowLeftRight, X, ChevronUp } from 'lucide-react';

export default function BoardDock() {
  const { boards, currentBoardId, setCurrentBoard } = useBoardStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Close switcher on outside click
  useEffect(() => {
    if (!showSwitcher) return;
    const handler = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [showSwitcher]);

  const currentBoard = boards.find((b) => b.id === currentBoardId);

  return (
    /* Fixed bottom centre — same position as Trello's bottom dock */
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      style={{ zIndex: 900 }}
    >
      {/* Board switcher panel — slides up from the dock */}
      {showSwitcher && (
        <div
          ref={switcherRef}
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(30,35,40,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            minWidth: '220px',
            maxWidth: '280px',
          }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Switch boards</p>
            <button onClick={() => setShowSwitcher(false)} className="text-gray-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="py-1 max-h-64 overflow-y-auto">
            {boards.length === 0 && (
              <p className="text-xs text-gray-500 px-4 py-3">No boards yet</p>
            )}
            {boards.map((b) => {
              const isActive = b.id === currentBoardId;
              return (
                <button
                  key={b.id}
                  onClick={() => { setCurrentBoard(b.id); setShowSwitcher(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-[#579dff]/20 text-[#579dff]'
                      : 'text-gray-300 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  {/* Board colour indicator */}
                  <div
                    className="w-5 h-5 rounded-md flex-shrink-0"
                    style={{ backgroundColor: b.background || '#0079bf' }}
                  />
                  <span className="truncate font-medium">{b.title}</span>
                  {isActive && (
                    <span className="ml-auto text-[10px] bg-[#579dff] text-[#1d2125] px-1.5 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The dock pill itself */}
      <div
        className="flex items-center rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(24,28,32,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Inbox tab */}
        <DockTab icon={<LayoutDashboard size={16} />} label="Inbox" />

        {/* Planner tab */}
        <DockTab icon={<Calendar size={16} />} label="Planner" />

        {/* Board tab — active state */}
        <DockTab
          icon={<Trello size={16} />}
          label="Board"
          active
          activeLabel={currentBoard?.title}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-0.5" />

        {/* Switch boards */}
        <button
          onClick={() => setShowSwitcher((v) => !v)}
          className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
            showSwitcher
              ? 'text-[#579dff]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <ArrowLeftRight size={16} />
          <span>Switch boards</span>
          {showSwitcher && <ChevronUp size={12} className="ml-0.5" />}
        </button>
      </div>
    </div>
  );
}

interface DockTabProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  activeLabel?: string;
}

function DockTab({ icon, label, active, activeLabel }: DockTabProps) {
  return (
    <div
      className={`relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium select-none ${
        active ? 'text-[#579dff]' : 'text-gray-400'
      }`}
    >
      {icon}
      <span>{active && activeLabel ? activeLabel : label}</span>
      {/* Active underline indicator */}
      {active && (
        <span
          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
          style={{ backgroundColor: '#579dff' }}
        />
      )}
    </div>
  );
}
