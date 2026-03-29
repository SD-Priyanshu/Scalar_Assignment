'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card as CardType } from '../types';
import { useBoardStore } from '../store/boardStore';
import {
  X, AlignLeft, CheckSquare, Tag, Calendar, User,
  Plus, Trash2, Check, Paperclip, MessageSquare,
  ExternalLink, Link2, MoreHorizontal, Archive,
} from 'lucide-react';

interface CardModalProps {
  card: CardType;
  listId: string;
  isOpen: boolean;
  onClose: () => void;
}

const LABEL_COLORS = [
  { name: 'Green',  color: '#4bce97' },
  { name: 'Yellow', color: '#f5cd47' },
  { name: 'Orange', color: '#fea362' },
  { name: 'Red',    color: '#f87168' },
  { name: 'Purple', color: '#9f8fef' },
  { name: 'Blue',   color: '#579dff' },
  { name: 'Sky',    color: '#60c6d2' },
  { name: 'Lime',   color: '#94c748' },
  { name: 'Pink',   color: '#e774bb' },
  { name: 'Dark',   color: '#8590a2' },
];

const CARD_COVERS = [
  '#4bce97', '#f5cd47', '#fea362', '#f87168',
  '#9f8fef', '#579dff', '#60c6d2', '#94c748',
  '#e774bb', '#8590a2',
];

type SidePanel = 'labels' | 'members' | 'dates' | 'checklist' | 'cover' | 'attachment' | null;

// Hook: close a floating panel when clicking outside its ref
function useOutsideClick(ref: React.RefObject<HTMLDivElement | null>, active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    // Slight delay so the button-click that opens the panel doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handler, true), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', handler, true);
    };
  }, [active, ref, onClose]);
}

export default function CardModal({ card, listId, isOpen, onClose }: CardModalProps) {
  const {
    updateCard, deleteCard,
    addChecklistItem, updateChecklistItem, deleteChecklistItem,
    addLabelToCard, removeLabelFromCard,
    addMemberToCard, removeMemberFromCard,
    createLabel, availableLabels,
    addComment, addAttachment, removeAttachment,
    archiveCard, unarchiveCard,
  } = useBoardStore();

  const [editingTitle, setEditingTitle]       = useState(false);
  const [title, setTitle]                     = useState(card.title);
  const [editingDesc, setEditingDesc]         = useState(false);
  const [description, setDescription]         = useState(card.description || '');
  const [newCheckItem, setNewCheckItem]       = useState('');
  const [showAddCheck, setShowAddCheck]       = useState(false);
  const [newMember, setNewMember]             = useState('');
  const [dueDate, setDueDate]                 = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [newLabelName, setNewLabelName]       = useState('');
  const [newLabelColor, setNewLabelColor]     = useState('#4bce97');
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [activePanel, setActivePanel]         = useState<SidePanel>(null);
  const [showCardMenu, setShowCardMenu]       = useState(false);
  const [mounted, setMounted]                 = useState(false);
  const [commentText, setCommentText]         = useState('');
  const [commentFocused, setCommentFocused]   = useState(false);
  const [attachUrl, setAttachUrl]             = useState('');
  const [attachDisplay, setAttachDisplay]     = useState('');

  // Each panel has its own ref for reliable outside-click detection
  const labelPanelRef      = useRef<HTMLDivElement>(null);
  const memberPanelRef     = useRef<HTMLDivElement>(null);
  const datePanelRef       = useRef<HTMLDivElement>(null);
  const checklistPanelRef  = useRef<HTMLDivElement>(null);
  const coverPanelRef      = useRef<HTMLDivElement>(null);
  const attachPanelRef     = useRef<HTMLDivElement>(null);
  const cardMenuRef        = useRef<HTMLDivElement>(null);
  const overlayRef         = useRef<HTMLDivElement>(null);

  const closePanel = () => setActivePanel(null);

  useOutsideClick(labelPanelRef,     activePanel === 'labels',     closePanel);
  useOutsideClick(memberPanelRef,    activePanel === 'members',    closePanel);
  useOutsideClick(datePanelRef,      activePanel === 'dates',      closePanel);
  useOutsideClick(checklistPanelRef, activePanel === 'checklist',  closePanel);
  useOutsideClick(coverPanelRef,     activePanel === 'cover',      closePanel);
  useOutsideClick(attachPanelRef,    activePanel === 'attachment', closePanel);
  useOutsideClick(cardMenuRef,       showCardMenu,                 () => setShowCardMenu(false));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description || '');
    setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
    setActivePanel(null);
    setCommentText('');
  }, [card.id]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isOpen || !mounted) return null;

  // ── Helpers ───────────────────────────────────────────────

  const togglePanel = (p: SidePanel) =>
    setActivePanel((prev) => (prev === p ? null : p));

  const handleTitleSave = () => {
    const t = title.trim();
    if (t && t !== card.title) updateCard(card.id, { title: t });
    else setTitle(card.title);
    setEditingTitle(false);
  };

  const handleDescSave = () => {
    updateCard(card.id, { description });
    setEditingDesc(false);
  };

  const handleAddCheckItem = () => {
    if (!newCheckItem.trim()) return;
    addChecklistItem(card.id, newCheckItem.trim());
    setNewCheckItem('');
  };

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    addMemberToCard(card.id, newMember.trim());
    setNewMember('');
  };

  const handleDueDateSave = () => {
    updateCard(card.id, { dueDate: dueDate ? new Date(dueDate).toISOString() : undefined });
    setActivePanel(null);
  };

  const handleCreateLabel = async () => {
    // Label name is now optional
    const label = await createLabel(newLabelName.trim() || `Label ${Date.now()}`, newLabelColor);
    if (label) {
      addLabelToCard(card.id, label.id);
      setNewLabelName('');
      setShowCreateLabel(false);
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(card.id, commentText.trim());
    setCommentText('');
    setCommentFocused(false);
  };

  const handleAddAttachment = () => {
    if (!attachUrl.trim()) return;
    addAttachment(card.id, attachUrl.trim(), attachDisplay.trim() || attachUrl.trim());
    setAttachUrl('');
    setAttachDisplay('');
    setActivePanel(null);
  };

  // Deduplicate
  const uniqueLabels = availableLabels.filter(
    (l, i, arr) => arr.findIndex((x) => x.id === l.id) === i
  );
  const cardLabels = card.labels.filter(
    (cl, i, arr) => arr.findIndex((x) => x.label?.id === cl.label?.id) === i
  );
  const cardLabelIds = cardLabels.map((cl) => cl.label.id);

  const completedItems = card.checklist.filter((i) => i.done).length;
  const totalItems     = card.checklist.length;
  const progressPct   = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const now        = new Date();
  const dueDateObj = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue  = dueDateObj && dueDateObj < now;

  const attachments: any[] = Array.isArray(card.attachments) ? card.attachments : [];
  const comments: any[]    = Array.isArray(card.comments) ? card.comments : [];

  // ── Styles ───────────────────────────────────────────────
  const btnBase = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors select-none';
  const btnOff  = 'bg-[#a6c5e229] text-[#b6c2cf] hover:bg-[#a6c5e250]';
  const btnOn   = 'bg-[#579dff] text-[#1d2125]';
  const floatPanel: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    backgroundColor: '#1d2125',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    zIndex: 10,
    minWidth: '260px',
    padding: '12px',
  };

  // ── Modal ────────────────────────────────────────────────
  const modal = (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '40px', paddingBottom: '24px',
        paddingLeft: '16px', paddingRight: '16px',
        overflowY: 'auto',
        backgroundColor: 'rgba(0,0,0,0.75)',
      }}
    >
      <div
        className="modal-animate w-full max-w-2xl relative rounded-2xl"
        style={{ backgroundColor: '#282e33', color: '#b6c2cf', marginBottom: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cover */}
        {card.cover && (
          <div className="h-32 rounded-t-2xl w-full" style={{ backgroundColor: card.cover }} />
        )}

        {/* Close and menu */}
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
          <button
            onClick={() => setShowCardMenu((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <MoreHorizontal size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {showCardMenu && (
          <div
            ref={cardMenuRef}
            className="absolute top-12 right-3 rounded-xl shadow-2xl w-48 py-1 z-20 overflow-hidden"
            style={{ backgroundColor: '#282e33', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <button
              onClick={() => {
                archiveCard(card.id);
                setShowCardMenu(false);
                onClose();
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-gray-200 text-sm transition-colors"
            >
              Archive card
            </button>
          </div>
        )}

        <div className="p-6 space-y-5">

          {/* ── Title ── */}
          <div className="pr-10">
            {editingTitle ? (
              <textarea
                autoFocus value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTitleSave(); } }}
                rows={2}
                className="w-full text-xl font-bold text-white bg-[#22272b] border border-[#579dff] rounded-xl px-3 py-2 resize-none focus:outline-none"
              />
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                className="text-xl font-bold text-white cursor-pointer hover:bg-white/5 rounded-xl px-3 py-2 -mx-3 transition-colors"
              >
                {card.title}
              </h2>
            )}
            <p className="text-xs text-gray-500 mt-1 px-1">
              in list <span className="text-gray-400 underline decoration-dotted">{listId}</span>
            </p>
          </div>

          {/* ── Action buttons + floating panels ── */}
          <div className="flex flex-wrap gap-2" style={{ position: 'relative' }}>

            {/* Labels button + panel */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => togglePanel('labels')}
                className={`${btnBase} ${activePanel === 'labels' ? btnOn : btnOff}`}
              >
                <Tag size={13} />Labels
              </button>
              {activePanel === 'labels' && (
                <div ref={labelPanelRef} style={{ ...floatPanel, minWidth: '260px' }}>
                  <p className="text-xs font-semibold text-gray-400 mb-3">Labels</p>
                  <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto mb-3 bg-[#22272b] rounded-lg p-2">
                    {uniqueLabels.length === 0 && (
                      <p className="text-xs text-gray-500 w-full py-2 text-center">No labels yet.</p>
                    )}
                    {uniqueLabels.map((label) => {
                      const has = cardLabelIds.includes(label.id);
                      return (
                        <div
                          key={label.id}
                          className="relative group"
                          title={label.name}
                        >
                          {/* Color circle for label */}
                          <button
                            onClick={() => {
                              if (has) removeLabelFromCard(card.id, label.id);
                              else addLabelToCard(card.id, label.id);
                            }}
                            className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                              has ? 'ring-2 ring-[#579dff] scale-110' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: label.color }}
                          />
                          {/* Checkmark for selected */}
                          {has && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={14} className="text-white font-bold" />
                            </div>
                          )}
                          {/* Delete button on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (has) removeLabelFromCard(card.id, label.id);
                            }}
                            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#f87168] w-5 h-5 rounded-full flex items-center justify-center"
                            title="Remove from card"
                          >
                            <X size={10} className="text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {!showCreateLabel ? (
                    <button
                      onClick={() => setShowCreateLabel(true)}
                      className="w-full bg-[#a6c5e229] hover:bg-[#a6c5e250] text-gray-300 px-2 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={12} /> Create a new label
                    </button>
                  ) : (
                    <div className="border-t border-white/10 pt-2 mt-1 space-y-2">
                      <input
                        autoFocus type="text" value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        placeholder="Label name (optional)…"
                        className="w-full bg-[#22272b] border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#579dff]"
                      />
                      <div className="flex flex-wrap gap-1">
                        {LABEL_COLORS.map(({ color }) => (
                          <button
                            key={color}
                            onClick={() => setNewLabelColor(color)}
                            className={`w-7 h-7 rounded-md transition-transform hover:scale-110 ${newLabelColor === color ? 'ring-2 ring-offset-1 ring-[#579dff] ring-offset-[#1d2125] scale-110' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateLabel}
                          className="flex-1 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => { setShowCreateLabel(false); setNewLabelName(''); }}
                          className="text-gray-400 hover:text-white text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dates button + panel */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => togglePanel('dates')} className={`${btnBase} ${activePanel === 'dates' ? btnOn : btnOff}`}>
                <Calendar size={13} />Dates
              </button>
              {activePanel === 'dates' && (
                <div ref={datePanelRef} style={floatPanel}>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Due date</p>
                  <input
                    type="date" value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#22272b] border border-white/20 rounded-lg px-2 py-1.5 text-sm text-white mb-2 focus:outline-none focus:border-[#579dff]"
                  />
                  <div className="flex gap-1.5">
                    <button onClick={handleDueDateSave} className="flex-1 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors">
                      Save
                    </button>
                    {card.dueDate && (
                      <button
                        onClick={() => { updateCard(card.id, { dueDate: undefined }); setDueDate(''); setActivePanel(null); }}
                        className="bg-[#f87168]/20 hover:bg-[#f87168]/30 text-[#f87168] rounded-lg px-2 py-1.5 text-xs transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Checklist button + panel */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => togglePanel('checklist')} className={`${btnBase} ${activePanel === 'checklist' ? btnOn : btnOff}`}>
                <CheckSquare size={13} />Checklist
              </button>
              {activePanel === 'checklist' && (
                <div ref={checklistPanelRef} style={floatPanel}>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Add checklist item</p>
                  <div className="flex gap-1">
                    <input
                      autoFocus type="text" value={newCheckItem}
                      onChange={(e) => setNewCheckItem(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { handleAddCheckItem(); setActivePanel(null); } }}
                      placeholder="Item text…"
                      className="flex-1 bg-[#22272b] border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#579dff]"
                    />
                    <button
                      onClick={() => { handleAddCheckItem(); setActivePanel(null); }}
                      disabled={!newCheckItem.trim()}
                      className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] rounded-lg px-2 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Members button + panel */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => togglePanel('members')} className={`${btnBase} ${activePanel === 'members' ? btnOn : btnOff}`}>
                <User size={13} />Members
              </button>
              {activePanel === 'members' && (
                <div ref={memberPanelRef} style={floatPanel}>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Members</p>
                  <div className="flex gap-1 mb-3">
                    <input
                      autoFocus type="text" value={newMember}
                      onChange={(e) => setNewMember(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember(); }}
                      placeholder="Name…"
                      className="flex-1 bg-[#22272b] border border-white/20 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#579dff]"
                    />
                    <button
                      onClick={handleAddMember}
                      disabled={!newMember.trim()}
                      className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] rounded-lg px-2 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {card.members.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 group rounded-lg hover:bg-white/5 px-1">
                      <div className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{m[0]?.toUpperCase()}</div>
                      <span className="flex-1 text-sm text-gray-200">{m}</span>
                      <button onClick={() => removeMemberFromCard(card.id, m)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-[#f87168] transition-all">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachment button + panel */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => togglePanel('attachment')} className={`${btnBase} ${activePanel === 'attachment' ? btnOn : btnOff}`}>
                <Paperclip size={13} />Attachment
              </button>
              {activePanel === 'attachment' && (
                <div ref={attachPanelRef} style={{ ...floatPanel, minWidth: '280px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-white">Attach</p>
                    <button onClick={() => setActivePanel(null)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                  </div>
                  <div className="border border-dashed border-white/20 rounded-lg p-3 mb-3 text-center cursor-pointer hover:border-[#579dff]/50 transition-colors">
                    <p className="text-xs text-gray-400 mb-1 font-medium">Attach a file from your computer</p>
                    <p className="text-xs text-gray-600">You can also drag and drop files to upload them.</p>
                    <button className="mt-2 bg-[#a6c5e229] hover:bg-[#a6c5e250] text-gray-300 text-xs px-3 py-1.5 rounded-lg w-full transition-colors">
                      Choose a file
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Search or paste a link <span className="text-[#f87168]">*</span></label>
                      <input
                        autoFocus type="url" value={attachUrl}
                        onChange={(e) => setAttachUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddAttachment(); }}
                        placeholder="Find recent links or paste a new link"
                        className="w-full bg-[#22272b] border border-[#579dff] rounded-lg px-2 py-2 text-xs text-white focus:outline-none placeholder-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Display text (optional)</label>
                      <input
                        type="text" value={attachDisplay}
                        onChange={(e) => setAttachDisplay(e.target.value)}
                        placeholder="Text to display"
                        className="w-full bg-[#22272b] border border-white/20 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-[#579dff] placeholder-gray-600"
                      />
                      <p className="text-xs text-gray-600 mt-1">Give this link a title or description</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleAddAttachment}
                      disabled={!attachUrl.trim()}
                      className="flex-1 bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] rounded-lg px-2 py-1.5 text-xs font-semibold disabled:opacity-40 transition-colors"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => { setActivePanel(null); setAttachUrl(''); setAttachDisplay(''); }}
                      className="text-gray-400 hover:text-white text-xs px-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cover button + panel */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => togglePanel('cover')} className={`${btnBase} ${activePanel === 'cover' ? btnOn : btnOff}`}>
                🎨 Cover
              </button>
              {activePanel === 'cover' && (
                <div ref={coverPanelRef} style={floatPanel}>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Card colour</p>
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {CARD_COVERS.map((color) => (
                      <button
                        key={color}
                        onClick={() => { updateCard(card.id, { cover: color }); setActivePanel(null); }}
                        className={`h-8 rounded-md transition-transform hover:scale-110 ${card.cover === color ? 'ring-2 ring-offset-1 ring-[#579dff] ring-offset-[#1d2125]' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {card.cover && (
                    <button
                      onClick={() => { updateCard(card.id, { cover: undefined }); setActivePanel(null); }}
                      className="w-full text-xs text-[#f87168] hover:bg-[#f87168]/10 py-1.5 rounded-lg transition-colors"
                    >
                      Remove cover
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Labels display ── */}
          {cardLabels.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Labels</p>
              <div className="flex flex-wrap gap-2">
                {cardLabels.map((cl) => (
                  <div
                    key={cl.label.id}
                    onClick={() => removeLabelFromCard(card.id, cl.label.id)}
                    className="w-6 h-6 rounded-md cursor-pointer hover:opacity-75 transition-opacity hover:ring-2 hover:ring-[#579dff]"
                    style={{ backgroundColor: cl.label.color }}
                    title={`${cl.label.name} - Click to remove`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Due date display ── */}
          {dueDateObj && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Due Date</p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
                style={{ backgroundColor: isOverdue ? '#c9372c' : '#a6c5e229', color: isOverdue ? '#fff' : '#b6c2cf' }}
                onClick={() => togglePanel('dates')}
              >
                🕐 {dueDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {isOverdue && <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-md">Overdue</span>}
              </div>
            </div>
          )}

          {/* ── Members display ── */}
          {card.members.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Members</p>
              <div className="flex flex-wrap gap-2">
                {card.members.map((m, i) => (
                  <div
                    key={i}
                    onClick={() => removeMemberFromCard(card.id, m)}
                    title={`Remove ${m}`}
                    className="flex items-center gap-1.5 bg-[#a6c5e229] hover:bg-[#f87168]/20 rounded-full pl-1 pr-3 py-0.5 cursor-pointer transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                      {m[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-[#f87168] transition-colors">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Description ── */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={15} className="text-gray-400" />
              <p className="text-sm font-semibold text-[#b6c2cf]">Description</p>
              {description && !editingDesc && (
                <button onClick={() => setEditingDesc(true)} className="text-xs bg-[#a6c5e229] hover:bg-[#a6c5e250] text-gray-400 px-2 py-0.5 rounded-md transition-colors">Edit</button>
              )}
            </div>
            {editingDesc ? (
              <div>
                <textarea
                  autoFocus value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description…"
                  rows={4}
                  className="w-full bg-[#22272b] border border-[#579dff] rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none mb-2"
                />
                <div className="flex gap-2">
                  <button onClick={handleDescSave} className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">Save</button>
                  <button onClick={() => { setEditingDesc(false); setDescription(card.description || ''); }} className="text-gray-400 hover:text-white text-sm transition-colors">Discard</button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setEditingDesc(true)}
                className="cursor-pointer min-h-[52px] rounded-xl px-3 py-2.5 text-sm transition-colors"
                style={{ backgroundColor: '#22272b', color: description ? '#b6c2cf' : '#626f86' }}
              >
                {description || 'Add a more detailed description…'}
              </div>
            )}
          </div>

          {/* ── Checklist ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare size={15} className="text-gray-400" />
                <p className="text-sm font-semibold text-[#b6c2cf]">Checklist</p>
              </div>
              {totalItems > 0 && <span className="text-xs text-gray-500">{progressPct}%</span>}
            </div>
            {totalItems > 0 && (
              <div className="w-full bg-[#22272b] rounded-full h-1.5 mb-3">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? '#4bce97' : '#579dff' }}
                />
              </div>
            )}
            {card.checklist.length > 0 && (
              <div className="space-y-1 mb-3">
                {card.checklist.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 group rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => updateChecklistItem(item.id, !item.done)}
                      className="w-4 h-4 mt-0.5 rounded cursor-pointer flex-shrink-0 accent-[#579dff]"
                    />
                    <span className={`flex-1 text-sm leading-relaxed ${item.done ? 'line-through text-gray-500' : 'text-[#b6c2cf]'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteChecklistItem(item.id); }}
                      className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-gray-500 hover:text-[#f87168] hover:bg-[#f87168]/10 transition-all"
                      title="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showAddCheck ? (
              <div className="pl-6">
                <input
                  autoFocus type="text" value={newCheckItem}
                  onChange={(e) => setNewCheckItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCheckItem(); if (e.key === 'Escape') { setShowAddCheck(false); setNewCheckItem(''); } }}
                  placeholder="Add an item…"
                  className="w-full bg-[#22272b] border border-[#579dff] rounded-xl px-3 py-2 text-sm text-white focus:outline-none mb-2"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddCheckItem} disabled={!newCheckItem.trim()} className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors">Add</button>
                  <button onClick={() => { setShowAddCheck(false); setNewCheckItem(''); }} className="text-gray-400 hover:text-white text-xs transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCheck(true)}
                className="bg-[#a6c5e229] hover:bg-[#a6c5e250] text-[#b6c2cf] hover:text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus size={12} /> Add an item
              </button>
            )}
          </div>

          {/* ── Attachments ── */}
          {attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Paperclip size={15} className="text-gray-400" />
                <p className="text-sm font-semibold text-[#b6c2cf]">Attachments</p>
              </div>
              <div className="space-y-2">
                {attachments.map((att: any) => (
                  <div key={att.id ?? att.url} className="flex items-center gap-3 bg-[#22272b] rounded-xl px-3 py-2.5 group">
                    <div className="w-10 h-10 bg-[#579dff]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Link2 size={16} className="text-[#579dff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={att.url} target="_blank" rel="noreferrer" className="text-sm text-[#579dff] hover:underline font-medium truncate block">
                        {att.displayText || att.url}
                      </a>
                      <p className="text-xs text-gray-500 truncate">{att.url}</p>
                    </div>
                    <a href={att.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white p-1 flex-shrink-0 transition-colors"><ExternalLink size={13} /></a>
                    <button
                      onClick={() => removeAttachment(card.id, att.id ?? att.url)}
                      className="text-gray-600 hover:text-[#f87168] p-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Comments & Activity ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={15} className="text-gray-400" />
              <p className="text-sm font-semibold text-[#b6c2cf]">Comments and activity</p>
            </div>

            {/* Write comment */}
            <div className="flex gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">U</div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onFocus={() => setCommentFocused(true)}
                  placeholder="Write a comment…"
                  rows={commentFocused ? 3 : 1}
                  className="w-full bg-[#22272b] border border-white/20 focus:border-[#579dff] rounded-xl px-3 py-2 text-sm text-white resize-none focus:outline-none transition-all placeholder-gray-600"
                  style={{ minHeight: commentFocused ? '72px' : '36px' }}
                />
                {commentFocused && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleAddComment} disabled={!commentText.trim()} className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors">Save</button>
                    <button onClick={() => { setCommentFocused(false); setCommentText(''); }} className="text-gray-400 hover:text-white text-xs transition-colors">Cancel</button>
                  </div>
                )}
              </div>
            </div>

            {/* Existing comments */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">U</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-white">User</span>
                        <span className="text-xs text-gray-500">
                          {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-[#22272b] rounded-xl px-3 py-2 text-sm text-[#b6c2cf]">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Delete card ── */}
          <div className="pt-3 border-t border-white/10 flex gap-2">
            <button
              onClick={() => { 
                if (card.archived) {
                  unarchiveCard(card.id);
                } else {
                  archiveCard(card.id);
                }
                onClose(); 
              }}
              className="flex items-center gap-2 text-[#579dff] hover:bg-[#579dff]/10 px-3 py-1.5 rounded-lg text-sm transition-colors flex-1 justify-center"
            >
              <Archive size={14} />
              {card.archived ? 'Unarchive Card' : 'Archive Card'}
            </button>
            <button
              onClick={() => { if (confirm('Delete this card? This cannot be undone.')) { deleteCard(card.id); onClose(); } }}
              className="flex items-center gap-2 text-[#f87168] hover:bg-[#f87168]/10 px-3 py-1.5 rounded-lg text-sm transition-colors flex-1 justify-center"
            >
              <Trash2 size={14} />
              Delete Card
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
