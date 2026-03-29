'use client';
import { useState, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import List from './List';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Board as BoardType, Card as CardType, List as ListType } from '../types';
import { Plus, X } from 'lucide-react';
import Card from './Card';

interface BoardProps {
  board: BoardType;
}

function matchesFilters(
  card: CardType,
  searchQuery: string,
  filterLabels: string[],
  filterMembers: string[],
  filterDueDate: 'all' | 'overdue' | 'dueSoon' | 'dueNextWeek' | 'dueNextMonth' | 'noDue'
): boolean {
  // Search by title
  if (searchQuery.trim()) {
    if (!card.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
  }

  // Label filter — card must have AT LEAST ONE of the selected labels
  if (filterLabels.length > 0) {
    const cardLabelIds = card.labels.map((cl) => cl.label.id);
    const hasMatch = filterLabels.some((id) => cardLabelIds.includes(id));
    if (!hasMatch) return false;
  }

  // Member filter — card must have AT LEAST ONE of the selected members
  if (filterMembers.length > 0) {
    const hasMatch = filterMembers.some((m) => card.members.includes(m));
    if (!hasMatch) return false;
  }

  // Due date filter
  if (filterDueDate !== 'all') {
    const now = new Date();
    const due = card.dueDate ? new Date(card.dueDate) : null;
    const soonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const weekThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthThreshold = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    if (filterDueDate === 'noDue') {
      if (card.dueDate) return false;
    } else if (filterDueDate === 'overdue') {
      if (!due) return false;
      if (due >= now) return false;
    } else if (filterDueDate === 'dueSoon') {
      if (!due) return false;
      if (due < now || due > soonThreshold) return false;
    } else if (filterDueDate === 'dueNextWeek') {
      if (!due) return false;
      if (due <= soonThreshold || due > weekThreshold) return false;
    } else if (filterDueDate === 'dueNextMonth') {
      if (!due) return false;
      if (due <= weekThreshold || due > monthThreshold) return false;
    }
  }

  return true;
}

export default function Board({ board }: BoardProps) {
  const {
    moveList, moveCard, addList, updateCard, unarchiveList, unarchiveCard,
    searchQuery, filterLabels, filterMembers, filterDueDate,
  } = useBoardStore();

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeList, setActiveList] = useState<ListType | null>(null);
  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  // Track which list a dragging card came from (for correct DnD)
  const activeCardListId = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const hasFilters =
    !!searchQuery.trim() ||
    filterLabels.length > 0 ||
    filterMembers.length > 0 ||
    filterDueDate !== 'all';

  const archivedLists = board.lists.filter((list) => list.archived);

  const filteredLists = board.lists
    .filter((list) => !list.archived)
    .map((list) => ({
      ...list,
      cards: hasFilters
        ? list.cards
            .filter((c) => !c.archived)
            .filter((c) => matchesFilters(c, searchQuery, filterLabels, filterMembers, filterDueDate))
        : list.cards.filter((c) => !c.archived),
    }));

  const archivedCards = board.lists
    .flatMap((list) => list.cards)
    .filter((c) => c.archived);


  // ── Drag handlers ────────────────────────────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === 'card') {
      const listId = active.data.current?.listId as string;
      activeCardListId.current = listId;
      const list = board.lists.find((l) => l.id === listId);
      const card = list?.cards.find((c) => c.id === active.id);
      setActiveCard(card || null);
    }

    if (type === 'list') {
      const list = board.lists.find((l) => l.id === active.id);
      setActiveList(list || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    if (activeType !== 'card') return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    const overType = over.data.current?.type;

    // Find which list the dragging card is currently in
    let fromListId = active.data.current?.listId as string;

    // Determine target list
    let toListId: string;
    let toIndex: number;

    if (overType === 'card') {
      toListId = over.data.current?.listId as string;
      toIndex = over.data.current?.index as number;
    } else if (overType === 'list') {
      // Dropped over a list container — put at end
      toListId = overId;
      const toList = board.lists.find((l) => l.id === toListId);
      toIndex = toList ? toList.cards.length : 0;
    } else {
      return;
    }

    if (!fromListId || !toListId) return;
    if (fromListId === toListId && activeCardId === overId) return;

    moveCard(board.id, activeCardId, fromListId, toListId, toIndex);

    // Update the active card's listId reference for subsequent dragOver events
    active.data.current!.listId = toListId;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCard(null);
    setActiveList(null);
    activeCardListId.current = null;

    if (!over) return;

    if (active.data.current?.type === 'list') {
      const fromIndex = board.lists.findIndex((l) => l.id === active.id);
      const toIndex = board.lists.findIndex((l) => l.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        moveList(board.id, active.id as string, toIndex);
      }
    }
  };

  const handleAddList = () => {
    if (!newListTitle.trim()) return;
    addList(board.id, newListTitle.trim());
    setNewListTitle('');
    setShowAddList(false);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col overflow-hidden">
        {hasFilters && (
          <div className="mx-4 mt-2">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-medium rounded-lg px-3 py-1.5">
              🔍 Filters active — some cards may be hidden
            </div>
          </div>
        )}

        {archivedLists.length > 0 && (
          <div className="mx-4 mt-2 text-xs text-gray-200">
            <div className="mb-1 font-semibold text-white">Archived lists:</div>
            <div className="flex flex-wrap gap-2">
              {archivedLists.map((list) => (
                <div key={list.id} className="flex items-center gap-2">
                  <span className="bg-[#1f2730] px-2 py-1 rounded-md border border-white/10 text-xs">{list.title}</span>
                  <button
                    onClick={() => unarchiveList(list.id)}
                    className="text-xs px-2 py-1 rounded-md bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125]"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {archivedCards.length > 0 && (
          <div className="mx-4 mt-4 text-xs text-gray-200 border-t border-white/10 pt-3">
            <div className="mb-1 font-semibold text-white">Archived cards</div>
            <div className="grid gap-2">
              {archivedCards.map((card) => (
                <div key={card.id} className="flex justify-between items-center bg-[#1f2730] px-3 py-2 rounded-lg">
                  <span className="text-sm text-white truncate">{card.title}</span>
                  <button
                    onClick={() => unarchiveCard(card.id)}
                    className="text-[10px] px-2 py-1 rounded text-[#1d2125] bg-[#579dff] hover:bg-[#85b8ff]"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto p-4 pb-6 board-scroll items-start flex-1">
          <SortableContext
            items={board.lists.map((l) => l.id)}
            strategy={horizontalListSortingStrategy}
          >
            {filteredLists.map((list) => (
              <List key={list.id} list={list} boardId={board.id} />
            ))}
          </SortableContext>

          {/* Add list */}
          {showAddList ? (
            <div
              className="rounded-xl p-2 min-w-[272px] max-w-[272px] flex-shrink-0"
              style={{ backgroundColor: 'rgba(22,27,34,0.92)' }}
            >
              <input
                autoFocus
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddList();
                  if (e.key === 'Escape') setShowAddList(false);
                }}
                placeholder="Enter list name…"
                className="w-full px-3 py-2 rounded-xl bg-[#22272b] text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#579dff] mb-2"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddList}
                  disabled={!newListTitle.trim()}
                  className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                >
                  Add list
                </button>
                <button
                  onClick={() => { setShowAddList(false); setNewListTitle(''); }}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddList(true)}
              className="min-w-[272px] max-w-[272px] flex-shrink-0 flex items-center gap-2 text-white/80 hover:text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors h-fit"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <Plus size={18} />
              Add another list
            </button>
          )}
        </div>
      </div>

      {/* Drag overlays */}
      <DragOverlay>
        {activeCard ? (
          <div className="rotate-2 opacity-95 shadow-2xl">
            <Card card={activeCard} listId={activeCard.listId} index={0} />
          </div>
        ) : activeList ? (
          <div className="rotate-1 opacity-90 shadow-2xl">
            <List list={activeList} boardId={board.id} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
