# Frontend Integration Guide - Card Management

Complete guide for integrating card, label, and checklist management endpoints with the Next.js frontend.

## 🔗 API Integration Points

### Base URL Configuration
```typescript
// utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = {
  boards: `${API_BASE_URL}/api/boards`,
  lists: `${API_BASE_URL}/api/lists`,
  cards: `${API_BASE_URL}/api/cards`,
  labels: `${API_BASE_URL}/api/labels`,
  checklist: `${API_BASE_URL}/api/checklist`,
};
```

## 📦 Store Integration (Zustand)

### Update boardStore.ts

```typescript
// store/boardStore.ts
import create from 'zustand';
import { apiClient } from '../utils/api';

interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  order: number;
  labels: Array<{label: Label}>;
  checklist: ChecklistItem[];
  members: string[];
  dueDate?: string;
  cover?: string;
  comments: any[];
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  cardId: string;
}

export const useBoardStore = create((set, get) => ({
  // ... existing state ...
  
  // Card Management
  createCard: async (listId: string, title: string, options?: any) => {
    const response = await fetch(`${apiClient.lists}/${listId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, ...options }),
    });
    const data = await response.json();
    if (data.success) {
      set(state => ({
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                cards: [...list.cards, data.data],
              };
            }
            return list;
          }),
        })),
      }));
    }
    return data.data;
  },

  updateCard: async (cardId: string, updates: any) => {
    const response = await fetch(`${apiClient.cards}/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (data.success) {
      set(state => ({
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => ({
            ...list,
            cards: list.cards.map(card =>
              card.id === cardId ? data.data : card
            ),
          })),
        })),
      }));
    }
    return data.data;
  },

  deleteCard: async (cardId: string) => {
    const response = await fetch(`${apiClient.cards}/${cardId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.success) {
      set(state => ({
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => ({
            ...list,
            cards: list.cards.filter(card => card.id !== cardId),
          })),
        })),
      }));
    }
    return data;
  },

  moveCard: async (cardId: string, toListId: string, newOrder: number) => {
    const response = await fetch(`${apiClient.cards}/${cardId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toListId, newOrder }),
    });
    const data = await response.json();
    if (data.success) {
      set(state => ({
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => ({
            ...list,
            cards: list.cards.filter(card => card.id !== cardId),
          })),
        })),
      }));
      // Add to new list
      set(state => ({
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => {
            if (list.id === toListId) {
              return {
                ...list,
                cards: [...list.cards, data.data].sort((a, b) => a.order - b.order),
              };
            }
            return list;
          }),
        })),
      }));
    }
    return data.data;
  },

  reorderCards: async (listId: string, cards: Array<{id: string; order: number}>) => {
    const cardOrders = cards.map(card => ({
      id: card.id,
      listId,
      order: card.order,
    }));
    const response = await fetch(`${apiClient.lists}/${listId}/cards/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cards: cardOrders }),
    });
    const data = await response.json();
    if (data.success) {
      set(state => ({
        boards: state.boards.map(board => ({
          ...board,
          lists: board.lists.map(list => {
            if (list.id === listId) {
              return {
                ...list,
                cards: data.data.sort((a: any, b: any) => a.order - b.order),
              };
            }
            return list;
          }),
        })),
      }));
    }
    return data.data;
  },

  // Label Management
  createLabel: async (name: string, color: string) => {
    const response = await fetch(apiClient.labels, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    return (await response.json()).data;
  },

  getAllLabels: async () => {
    const response = await fetch(apiClient.labels);
    return (await response.json()).data;
  },

  addLabelToCard: async (cardId: string, labelId: string) => {
    const response = await fetch(`${apiClient.cards}/${cardId}/labels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labelId }),
    });
    return (await response.json()).data;
  },

  removeLabelFromCard: async (cardId: string, labelId: string) => {
    const response = await fetch(
      `${apiClient.cards}/${cardId}/labels/${labelId}`,
      { method: 'DELETE' }
    );
    return (await response.json()).data;
  },

  // Checklist Management
  addChecklistItem: async (cardId: string, text: string) => {
    const response = await fetch(`${apiClient.cards}/${cardId}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return (await response.json()).data;
  },

  updateChecklistItem: async (itemId: string, updates: any) => {
    const response = await fetch(`${apiClient.checklist}/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return (await response.json()).data;
  },

  deleteChecklistItem: async (itemId: string) => {
    const response = await fetch(`${apiClient.checklist}/${itemId}`, {
      method: 'DELETE',
    });
    return (await response.json()).data;
  },

  getChecklistProgress: async (cardId: string) => {
    const response = await fetch(
      `${apiClient.cards}/${cardId}/checklist/progress`
    );
    return (await response.json()).data;
  },

  addMember: async (cardId: string, memberName: string) => {
    const response = await fetch(`${apiClient.cards}/${cardId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberName }),
    });
    return (await response.json()).data;
  },

  removeMember: async (cardId: string, memberName: string) => {
    const response = await fetch(
      `${apiClient.cards}/${cardId}/members/${encodeURIComponent(memberName)}`,
      { method: 'DELETE' }
    );
    return (await response.json()).data;
  },
}));
```

## 🎨 Component Updates

### CardModal.tsx - Add Card Details
```typescript
// components/CardModal.tsx
import { useBoardStore } from '../store/boardStore';

export default function CardModal({ cardId, onClose }: Props) {
  const { boards, updateCard, addChecklistItem, updateChecklistItem } = useBoardStore();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch card details
  useEffect(() => {
    const fetchCard = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/cards/${cardId}`);
        const data = await response.json();
        setCard(data.data);
      } catch (error) {
        console.error('Failed to fetch card:', error);
      }
    };
    if (cardId) {
      fetchCard();
    }
  }, [cardId]);

  const handleUpdateTitle = async (newTitle: string) => {
    setLoading(true);
    const updated = await updateCard(cardId, { title: newTitle });
    setCard(updated);
    setLoading(false);
  };

  const handleAddChecklist = async (text: string) => {
    const item = await addChecklistItem(cardId, text);
    setCard({
      ...card,
      checklist: [...(card?.checklist || []), item],
    });
  };

  const handleToggleChecklistItem = async (itemId: string, done: boolean) => {
    const updated = await updateChecklistItem(itemId, { done: !done });
    setCard({
      ...card,
      checklist: card!.checklist.map(item =>
        item.id === itemId ? updated : item
      ),
    });
  };

  return (
    <div className="modal">
      {card && (
        <>
          <input
            value={card.title}
            onChange={(e) => handleUpdateTitle(e.target.value)}
            className="text-2xl font-bold"
          />
          
          {/* Checklist Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Checklist</h3>
            {card.checklist.map(item => (
              <label key={item.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => handleToggleChecklistItem(item.id, item.done)}
                />
                <span className={item.done ? 'line-through text-gray-500' : ''}>
                  {item.text}
                </span>
              </label>
            ))}
            <input
              placeholder="Add checklist item"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handleAddChecklist(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          {/* Labels Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Labels</h3>
            <div className="flex flex-wrap gap-2">
              {card.labels.map(({ label }) => (
                <span
                  key={label.id}
                  className="px-2 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          </div>

          {/* Members Section */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Assigned To</h3>
            <div className="flex flex-wrap gap-2">
              {card.members.map(member => (
                <span key={member} className="bg-blue-100 px-2 py-1 rounded">
                  {member}
                </span>
              ))}
            </div>
          </div>

          {/* Due Date */}
          {card.dueDate && (
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                Due: {new Date(card.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Card.tsx - Drag and Drop Integration
```typescript
// components/Card.tsx
import { useSortable } from '@dnd-kit/sortable';
import { useBoardStore } from '../store/boardStore';

export default function Card({ card, listId }: Props) {
  const { moveCard, reorderCards } = useBoardStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (!over) return;

    // Check if moved to different list
    const targetList = over.data.current?.listId;
    if (targetList && targetList !== listId) {
      await moveCard(card.id, targetList, 0);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded border border-gray-300 cursor-grab active:cursor-grabbing"
    >
      <p className="font-semibold">{card.title}</p>
      
      {card.labels.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {card.labels.map(({ label }) => (
            <span
              key={label.id}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: label.color }}
              title={label.name}
            />
          ))}
        </div>
      )}

      {card.checklist.length > 0 && (
        <div className="text-xs text-gray-600 mt-2">
          {card.checklist.filter(i => i.done).length}/{card.checklist.length}
        </div>
      )}

      {card.dueDate && (
        <div className="text-xs text-gray-600 mt-1">
          {new Date(card.dueDate).toLocaleDateString()}
        </div>
      )}

      {card.members.length > 0 && (
        <div className="text-xs mt-2 flex gap-1">
          {card.members.map(member => (
            <span key={member} className="bg-blue-100 px-1 rounded">
              {member.split(' ')[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 🔄 Drag and Drop with Multiple Lists

```typescript
// Helper function to handle drag-and-drop between lists
export const handleDragEndMultipleList = async (
  event: any,
  store: ReturnType<typeof useBoardStore>
) => {
  const { active, over } = event;

  if (!over) return;

  const sourceListId = active.data.current?.listId;
  const targetListId = over.data.current?.listId;

  if (sourceListId && targetListId) {
    // Get current cards order
    const sourceList = store.boards[0].lists.find(l => l.id === sourceListId);
    const targetList = store.boards[0].lists.find(l => l.id === targetListId);

    if (sourceList && targetList) {
      // If same list, reorder
      if (sourceListId === targetListId) {
        const cards = sourceList.cards.map((card, idx) => ({
          id: card.id,
          order: idx,
        }));
        await store.reorderCards(sourceListId, cards);
      } else {
        // If different list, move
        const targetIndex = targetList.cards.findIndex(c => c.id === active.id);
        await store.moveCard(active.id, targetListId, targetIndex);
      }
    }
  }
};
```

## 📊 Type Definitions

```typescript
// types/index.ts
export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  order: number;
  labels: Array<{
    label: Label;
  }>;
  checklist: ChecklistItem[];
  members: string[];
  attachments: any[];
  dueDate?: string;
  cover?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  cardId: string;
}

export interface Comment {
  id: string;
  text: string;
  cardId: string;
  createdAt: string;
}
```

## 🧪 Testing Integration

```typescript
// __tests__/cardStore.test.ts
import { useBoardStore } from '../store/boardStore';

describe('Card Store', () => {
  it('should create a card', async () => {
    const store = useBoardStore();
    const card = await store.createCard('list-id', 'Test Card');
    expect(card.title).toBe('Test Card');
  });

  it('should update a card', async () => {
    const store = useBoardStore();
    const updated = await store.updateCard('card-id', {
      title: 'Updated Title'
    });
    expect(updated.title).toBe('Updated Title');
  });

  it('should add checklist item', async () => {
    const store = useBoardStore();
    const item = await store.addChecklistItem('card-id', 'Task');
    expect(item.text).toBe('Task');
    expect(item.done).toBe(false);
  });
});
```

## 🚀 Environment Configuration

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Common Patterns

### Update Card with Optimistic UI
```typescript
const card = get().boards[0].lists[0].cards[0];
// Update UI immediately
set(/* updated state */);
// Sync with server
try {
  await updateCard(card.id, updates);
} catch (error) {
  // Revert on error
  set(/* original state */);
}
```

### Load Card on Modal Open
```typescript
const handleOpenCard = async (cardId: string) => {
  const response = await fetch(`/api/cards/${cardId}`);
  const { data } = await response.json();
  setSelectedCard(data);
};
```

### Add Multiple Members
```typescript
for (const member of membersToAdd) {
  await store.addMember(cardId, member);
}
```

## ✅ Checklist for Frontend Integration

- [ ] Update boardStore.ts with all card functions
- [ ] Update CardModal.tsx with card details display
- [ ] Update Card.tsx with label display
- [ ] Implement drag-and-drop with move functionality
- [ ] Add checklist UI in card modal
- [ ] Add label selector in card modal
- [ ] Add member assignment UI
- [ ] Test all CRUD operations
- [ ] Test drag-and-drop between lists
- [ ] Test error handling

## 📚 Related Resources

- [Card Management API](./CARDS_API.md)
- [Implementation Details](./CARDS_IMPLEMENTATION.md)
- [Test Script](./test-cards.sh)
- [Main README](./README.md)
