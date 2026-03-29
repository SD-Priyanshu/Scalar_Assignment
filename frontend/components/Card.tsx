'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../types';
import { useState } from 'react';
import CardModal from './CardModal';

interface CardProps {
  card: CardType;
  listId: string;
  index: number;
}

export default function Card({ card, listId, index }: CardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', listId, index },
  });

  const style = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  const completedItems = card.checklist.filter((i) => i.done).length;
  const totalItems = card.checklist.length;
  const allDone = totalItems > 0 && completedItems === totalItems;

  const now = new Date();
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  const isOverdue = dueDate && dueDate < now;
  const isDueSoon = dueDate && !isOverdue && (dueDate.getTime() - now.getTime()) < 24 * 60 * 60 * 1000;

  const hasBadges = totalItems > 0 || card.dueDate || (card.description) || (card.comments?.length > 0) || card.members.length > 0;

  return (
    <>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setIsModalOpen(true)}
        className={`group relative rounded-xl cursor-pointer select-none ${isDragging ? 'opacity-0' : ''}`}
        style={{
          ...style,
          backgroundColor: '#22272b',
          boxShadow: '0 1px 0 rgba(9,30,66,0.25)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Cover strip */}
        {card.cover && (
          <div
            className="w-full h-8 rounded-t-xl"
            style={{ backgroundColor: card.cover }}
          />
        )}

        <div className={`px-3 py-2.5 ${card.cover ? 'pt-2' : ''}`}>
          {/* Label strips — Trello style: short colored pills */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {Array.from(new Set(card.labels.map((cl) => cl.label.id))).map((labelId) => {
                const cl = card.labels.find((cl) => cl.label.id === labelId);
                return cl ? (
                  <span
                    key={cl.id}
                    className="h-2 min-w-[40px] max-w-[80px] rounded-full"
                    style={{ backgroundColor: cl.label.color }}
                    title={cl.label.name}
                  />
                ) : null;
              })}
            </div>
          )}

          {/* Title */}
          <p className="text-sm text-[#b6c2cf] leading-snug break-words">{card.title}</p>

          {/* Badges */}
          {hasBadges && (
            <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Due date */}
                {dueDate && (
                  <span
                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded font-medium ${
                      isOverdue
                        ? 'bg-[#c9372c] text-white'
                        : isDueSoon
                        ? 'bg-[#f8e6a0] text-[#533f04]'
                        : allDone
                        ? 'bg-[#216e4e] text-white'
                        : 'bg-transparent text-[#9fadbc]'
                    }`}
                  >
                    🕐 {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}

                {/* Checklist */}
                {totalItems > 0 && (
                  <span
                    className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded font-medium ${
                      allDone ? 'bg-[#216e4e] text-white' : 'bg-transparent text-[#9fadbc]'
                    }`}
                  >
                    ☑ {completedItems}/{totalItems}
                  </span>
                )}

                {/* Description */}
                {card.description && (
                  <span className="text-xs text-[#9fadbc]" title="Has description">≡</span>
                )}

                {/* Comments */}
                {card.comments?.length > 0 && (
                  <span className="text-xs text-[#9fadbc]">💬 {card.comments.length}</span>
                )}
              </div>

              {/* Member avatars */}
              {card.members.length > 0 && (
                <div className="flex -space-x-1">
                  {card.members.slice(0, 3).map((m, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center border-2 border-[#22272b]"
                      title={m}
                    >
                      {m[0]?.toUpperCase()}
                    </div>
                  ))}
                  {card.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-gray-600 text-gray-200 text-xs font-bold flex items-center justify-center border-2 border-[#22272b]">
                      +{card.members.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit pencil on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
          className="absolute top-2 right-2 p-1 rounded bg-[#22272b] hover:bg-[#2c333a] text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit card"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {isModalOpen && (
        <CardModal
          card={card}
          listId={listId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
