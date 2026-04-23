'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBoardStore } from '../store/boardStore';
import { Board } from '../types';
import { Search, Plus, X, SlidersHorizontal, Check, Trash2 } from 'lucide-react';

interface HeaderProps {
  currentBoard?: Board;
}

const BOARD_BACKGROUNDS = [
  '#0079bf', '#d29034', '#519839', '#b04632',
  '#89609e', '#cd5a91', '#4bbf6b', '#00aecc', '#838c91',
];

// Header component: manages the top toolbar with search, filters, and board creation.
export default function Header({ currentBoard }: HeaderProps) {
  const {
    updateBoard, deleteBoard,
    searchQuery, setSearchQuery,
    filterLabels, filterMembers, filterDueDate,
    setFilters, clearFilters,
    availableLabels,
    addBoard,
  } = useBoardStore();

  // Local UI state for the header bar and create-board dropdown.
  const [showCreate, setShowCreate]       = useState(false);
  const [showFilter, setShowFilter]       = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardBg, setNewBoardBg]       = useState('#0079bf');
  const [mounted, setMounted]             = useState(false);
  const [dropPos, setDropPos]             = useState({ top: 0, right: 0 });

  const createBtnRef  = useRef<HTMLButtonElement>(null);
  const createDropRef = useRef<HTMLDivElement>(null);
  const filterRef     = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Detect whether any filter is currently active to change the filter button state.
  const hasActiveFilters =
    !!searchQuery.trim() ||
    filterLabels.length > 0 ||
    filterMembers.length > 0 ||
    filterDueDate !== 'all';

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        !createBtnRef.current?.contains(t) &&
        !createDropRef.current?.contains(t)
      ) {
        setShowCreate(false);
      }
      if (filterRef.current && !filterRef.current.contains(t)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, []);

  // Toggle the create-board dropdown and compute its screen position.
  const handleToggleCreate = () => {
    if (!showCreate && createBtnRef.current) {
      const r = createBtnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setShowCreate(v => !v);
  };

  // Create a new board with the entered title and reset the creation form.
  const handleCreateBoard = () => {
    if (!newBoardTitle.trim()) return;
    addBoard(newBoardTitle.trim());
    setNewBoardTitle('');
    setNewBoardBg('#0079bf');
    setShowCreate(false);
  };

  // Flatten all board card members into a unique list for the filter UI.
  const allMembers = Array.from(
    new Set((currentBoard?.lists ?? []).flatMap(l => l.cards.flatMap(c => c.members)))
  );
  // Remove duplicate labels so the filter UI only shows each label once.
  const uniqueLabels = availableLabels.filter(
    (l, i, arr) => arr.findIndex(x => x.id === l.id) === i
  );

  // Portal dropdown — renders directly on <body>, escapes ALL stacking contexts
  const createDropdown = mounted && showCreate ? createPortal(
    <div
      ref={createDropRef}
      style={{
        position: 'fixed',
        top: dropPos.top,
        right: dropPos.right,
        width: '280px',
        backgroundColor: '#282e33',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        zIndex: 999999,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-sm font-semibold text-white">Create board</p>
        <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div
          className="w-full h-20 rounded-lg"
          style={{ background: `linear-gradient(135deg, ${newBoardBg}dd, ${newBoardBg}88)` }}
        />
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1.5">Background</p>
          <div className="flex gap-1.5 flex-wrap">
            {BOARD_BACKGROUNDS.map(color => (
              <button
                key={color}
                onClick={() => setNewBoardBg(color)}
                className={`w-8 h-8 rounded-md transition-transform hover:scale-110 ${newBoardBg === color ? 'ring-2 ring-[#579dff] ring-offset-1 ring-offset-[#282e33] scale-110' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 font-medium mb-1 block">
            Board title <span className="text-[#f87168]">*</span>
          </label>
          <input
            autoFocus
            type="text"
            value={newBoardTitle}
            onChange={e => setNewBoardTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateBoard()}
            placeholder="Enter board title…"
            className="w-full bg-[#22272b] border border-white/20 focus:border-[#579dff] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={handleCreateBoard}
          disabled={!newBoardTitle.trim()}
          className="w-full bg-[#579dff] hover:bg-[#85b8ff] disabled:opacity-40 text-[#1d2125] rounded-lg py-2 text-sm font-semibold transition-colors"
        >
          Create
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="flex-shrink-0" style={{ position: 'relative', zIndex: 100 }}>

      {/* ── Top nav ── */}
      <header
        className="flex items-center px-4 h-12 gap-3"
        style={{ backgroundColor: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-1 select-none flex-shrink-0">
          <div className="w-7 h-7 bg-white/90 rounded flex items-center justify-center font-black text-[#0079bf] text-base">T</div>
          <span className="font-bold text-white text-base hidden sm:block">rello</span>
        </div>

        {/* Centered search */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-xl">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full h-9 bg-white/15 hover:bg-white/25 focus:bg-white/90 text-white focus:text-gray-900 placeholder-white/50 focus:placeholder-gray-400 rounded-lg pl-8 pr-8 text-sm focus:outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Create button — dropdown via portal */}
        <button
          ref={createBtnRef}
          onClick={handleToggleCreate}
          className="flex items-center gap-1.5 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] px-4 h-8 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
        >
          <Plus size={15} />
          Create
        </button>
        {createDropdown}
      </header>

      {/* ── Board sub-header ── */}
      {currentBoard && (
        <div
          className="flex items-center gap-3 px-4 h-10"
          style={{ backgroundColor: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)' }}
        >
          <span className="font-bold text-white text-sm select-none">{currentBoard.title}</span>
          <div className="w-px h-4 bg-white/25" />

          {/* Background swatches */}
          <div className="flex items-center gap-1">
            {BOARD_BACKGROUNDS.map(color => (
              <button
                key={color}
                onClick={() => updateBoard(currentBoard.id, { background: color })}
                title="Change background"
                className={`w-4 h-4 rounded-sm transition-transform hover:scale-110 ${
                  currentBoard.background === color
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110'
                    : 'opacity-75 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex-1" />

          {/* Filter */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                hasActiveFilters ? 'bg-[#579dff] text-[#1d2125]' : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <SlidersHorizontal size={13} />
              Filter
              {hasActiveFilters && (
                <span className="ml-0.5 bg-[#1d2125] text-[#579dff] text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">!</span>
              )}
            </button>

            {showFilter && (
              <div
                className="absolute top-full right-0 mt-1.5 w-80 rounded-xl shadow-2xl p-4"
                style={{ backgroundColor: '#282e33', border: '1px solid rgba(255,255,255,0.1)', zIndex: 99999 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Filter</h3>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-[#579dff] hover:text-[#85b8ff] transition-colors">Clear all</button>
                  )}
                </div>

                {/* Due date */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Due date</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { value: 'all',          label: 'All cards' },
                        { value: 'overdue',      label: '⚠ Overdue' },
                        { value: 'dueSoon',      label: '🕐 Due next 24h' },
                        { value: 'dueNextWeek',  label: '📅 Due next week' },
                        { value: 'dueNextMonth', label: '📆 Due next month' },
                        { value: 'noDue',        label: '— No due date' },
                      ] as const
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFilters({ dueDate: value })}
                        className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                          filterDueDate === value ? 'bg-[#579dff] text-[#1d2125]' : 'bg-[#a6c5e229] text-gray-300 hover:bg-[#a6c5e250]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Labels */}
                {uniqueLabels.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Labels</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueLabels.map(label => {
                        const active = filterLabels.includes(label.id);
                        return (
                          <button
                            key={label.id}
                            onClick={() => setFilters({ labels: active ? filterLabels.filter(id => id !== label.id) : [...filterLabels, label.id] })}
                            className={`relative w-8 h-8 rounded-md transition-all ${active ? 'ring-2 ring-[#579dff] scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: label.color }}
                            title={label.name}
                          >
                            {active && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Members */}
                {allMembers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Members</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allMembers.map(member => {
                        const active = filterMembers.includes(member);
                        return (
                          <button
                            key={member}
                            onClick={() => setFilters({ members: active ? filterMembers.filter(m => m !== member) : [...filterMembers, member] })}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                              active ? 'bg-[#579dff] text-[#1d2125] font-semibold' : 'bg-[#a6c5e229] text-gray-300 hover:bg-[#a6c5e250]'
                            }`}
                          >
                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                              {member[0]?.toUpperCase()}
                            </div>
                            {member}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete board */}
          <button
            onClick={() => {
              if (confirm(`Delete board "${currentBoard.title}"? This cannot be undone.`)) {
                deleteBoard(currentBoard.id);
              }
            }}
            className="flex items-center gap-1 text-xs text-white/60 hover:text-white hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
