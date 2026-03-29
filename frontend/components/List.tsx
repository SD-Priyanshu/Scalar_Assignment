'use client';
import { useState, useRef, useEffect } from 'react';
import { useBoardStore } from '../store/boardStore';
import Card from './Card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { List as ListType } from '../types';
import { MoreHorizontal, Plus, X, Archive } from 'lucide-react';

interface ListProps {
  list: ListType;
  boardId: string;
}

export default function List({ list, boardId }: ListProps) {
  const { addCard, deleteList, updateList, archiveList } = useBoardStore();
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [showMenu]);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list' },
  });

  const dragStyle = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  const handleAddCard = () => {
    if (!newCardTitle.trim()) return;
    addCard(boardId, list.id, newCardTitle.trim());
    setNewCardTitle('');
    setShowAddCard(false);
  };

  const handleTitleSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== list.title) updateList(list.id, trimmed);
    else setTitleValue(list.title);
    setEditingTitle(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...dragStyle,
        backgroundColor: 'rgba(22,27,34,0.92)',
        backdropFilter: 'blur(6px)',
      }}
      className={`flex flex-col rounded-xl min-w-[272px] max-w-[272px] flex-shrink-0 max-h-[calc(100vh-130px)] shadow-xl ${isDragging ? 'opacity-0' : ''}`}
    >
      {/* Header */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-3 pt-2.5 pb-1 cursor-grab active:cursor-grabbing"
      >
        {editingTitle ? (
          <input
            autoFocus
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave();
              if (e.key === 'Escape') { setTitleValue(list.title); setEditingTitle(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 font-bold text-sm text-white bg-white/20 border border-blue-400 rounded px-2 py-0.5 focus:outline-none"
          />
        ) : (
          <h3
            onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(true); }}
            className="font-bold text-sm text-white flex-1 px-0.5 py-0.5 select-none truncate"
          >
            {list.title}
          </h3>
        )}

        <div className="relative ml-1 flex-shrink-0" ref={menuRef}>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
            className="p-1.5 rounded-lg hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 rounded-xl shadow-2xl w-56 py-1 z-[100] overflow-hidden"
              style={{ backgroundColor: '#282e33', border: '1px solid rgba(255,255,255,0.12)' }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p className="px-4 py-2 text-xs text-gray-400 font-semibold text-center border-b border-white/10">
                List actions
              </p>
              <button
                onClick={() => { setEditingTitle(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-gray-200 text-sm transition-colors"
              >
                Rename list…
              </button>
              <button
                onClick={() => { setShowAddCard(true); setShowMenu(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-gray-200 text-sm transition-colors"
              >
                Add card
              </button>
              <hr className="border-white/10 my-1" />
              <button
                onClick={() => {
                  archiveList(list.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-gray-200 text-sm flex items-center gap-2.5 transition-colors"
              >
                <Archive size={14} className="text-gray-400" />
                Archive this list
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${list.title}" and all its cards?`)) deleteList(list.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-red-500/20 text-red-400 text-sm transition-colors"
              >
                Delete this list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-2 list-cards min-h-[2px]">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card, index) => (
            <Card key={card.id} card={card} listId={list.id} index={index} />
          ))}
        </SortableContext>
        {list.cards.length === 0 && (
          <div className="h-2" /> // drop target for empty lists
        )}
      </div>

      {/* Add card */}
      <div className="px-2 pb-2 pt-0.5">
        {showAddCard ? (
          <div>
            <textarea
              autoFocus
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                if (e.key === 'Escape') { setShowAddCard(false); setNewCardTitle(''); }
              }}
              placeholder="Enter a title for this card…"
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm text-gray-800 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 shadow mb-2"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddCard}
                disabled={!newCardTitle.trim()}
                className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                Add card
              </button>
              <button
                onClick={() => { setShowAddCard(false); setNewCardTitle(''); }}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full text-left text-gray-400 hover:text-white hover:bg-white/10 px-2 py-2 rounded-lg flex items-center gap-1.5 text-sm transition-colors"
          >
            <Plus size={16} />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
