import { create } from 'zustand';
import { Board, Card, Label } from '../types';

interface BoardState {
  boards: Board[];
  currentBoardId: string | null;
  availableLabels: Label[];
  searchQuery: string;
  filterLabels: string[];
  filterMembers: string[];
  filterDueDate: 'all' | 'overdue' | 'dueSoon' | 'dueNextWeek' | 'dueNextMonth' | 'noDue';
  loading: boolean;
  error: string | null;

  fetchBoards: () => Promise<void>;
  fetchLabels: () => Promise<void>;
  setCurrentBoard: (id: string) => void;
  addBoard: (title: string) => Promise<void>;
  updateBoard: (boardId: string, updates: { title?: string; background?: string }) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  archiveBoard: (boardId: string) => Promise<void>;
  unarchiveBoard: (boardId: string) => Promise<void>;

  addList: (boardId: string, title: string) => Promise<void>;
  updateList: (listId: string, title: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  moveList: (boardId: string, listId: string, newIndex: number) => Promise<void>;
  archiveList: (listId: string) => Promise<void>;
  unarchiveList: (listId: string) => Promise<void>;
  deleteLabel: (labelId: string) => Promise<void>;

  addCard: (boardId: string, listId: string, title: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  archiveCard: (cardId: string) => Promise<void>;
  unarchiveCard: (cardId: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (boardId: string, cardId: string, fromListId: string, toListId: string, newOrder: number) => Promise<void>;

  addLabelToCard: (cardId: string, labelId: string) => Promise<void>;
  removeLabelFromCard: (cardId: string, labelId: string) => Promise<void>;
  createLabel: (name: string, color: string) => Promise<Label | null>;

  addChecklistItem: (cardId: string, text: string) => Promise<void>;
  updateChecklistItem: (itemId: string, done: boolean) => Promise<void>;
  deleteChecklistItem: (itemId: string) => Promise<void>;

  addMemberToCard: (cardId: string, memberName: string) => Promise<void>;
  removeMemberFromCard: (cardId: string, memberName: string) => Promise<void>;

  addComment: (cardId: string, text: string) => Promise<void>;
  addAttachment: (cardId: string, url: string, displayText?: string) => void;
  removeAttachment: (cardId: string, url: string) => void;

  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<{
    labels: string[];
    members: string[];
    dueDate: 'all' | 'overdue' | 'dueSoon' | 'dueNextWeek' | 'dueNextMonth' | 'noDue';
  }>) => void;
  clearFilters: () => void;
}

const API_BASE = 'http://localhost:3001/api';

async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json?.data !== undefined ? json.data : json;
}

function dedupeById<T extends { id: string }>(arr: T[]): T[] {
  return arr.filter((item, idx, self) => self.findIndex((x) => x.id === item.id) === idx);
}

// Deduplicate card labels (prevent same label appearing twice on a card)
function dedupeCardLabels(labels: any[]): any[] {
  if (!Array.isArray(labels)) return [];
  const seen = new Set<string>();
  return labels.filter((cl) => {
    const key = cl?.label?.id ?? cl?.labelId ?? cl?.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  currentBoardId: null,
  availableLabels: [],
  searchQuery: '',
  filterLabels: [],
  filterMembers: [],
  filterDueDate: 'all',
  loading: false,
  error: null,

  // ── Boards ──────────────────────────────────────────────────

  fetchBoards: async () => {
    set({ loading: true, error: null });
    try {
      const boards = await apiFetch(`${API_BASE}/boards`);
      const arr: Board[] = Array.isArray(boards) ? boards : [];
      // Sanitize all card labels on load
      const sanitized = arr.map((b) => ({
        ...b,
        archived: b.archived ?? false,
        lists: (b.lists ?? []).map((l) => ({
          ...l,
          cards: (l.cards ?? []).map((c) => ({
            ...c,
            labels: dedupeCardLabels(c.labels ?? []),
            checklist: c.checklist ?? [],
            members: c.members ?? [],
            attachments: c.attachments ?? [],
            comments: c.comments ?? [],
            archived: c.archived ?? false,
          })),

        })),
      }));
      set((s) => ({
        boards: sanitized,
        loading: false,
        currentBoardId: s.currentBoardId ?? (sanitized.length > 0 ? sanitized[0].id : null),
      }));
    } catch (err: any) {
      console.error('fetchBoards:', err);
      set({ loading: false, error: err.message, boards: [] });
    }
  },

  fetchLabels: async () => {
    try {
      const labels = await apiFetch(`${API_BASE}/labels`);
      const arr = Array.isArray(labels) ? labels : [];
      set({ availableLabels: dedupeById(arr) });
    } catch (err) {
      console.error('fetchLabels:', err);
    }
  },

  setCurrentBoard: (id) => set({ currentBoardId: id }),

  addBoard: async (title) => {
    try {
      const board = await apiFetch(`${API_BASE}/boards`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      set((s) => ({
        boards: [...s.boards, { ...board, lists: board.lists ?? [] }],
        currentBoardId: board.id,
      }));
    } catch (err) { console.error('addBoard:', err); }
  },

  updateBoard: async (boardId, updates) => {
    try {
      const board = await apiFetch(`${API_BASE}/boards/${boardId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      set((s) => ({ boards: s.boards.map((b) => (b.id === boardId ? { ...b, ...board } : b)) }));
    } catch (err) { console.error('updateBoard:', err); }
  },

  deleteBoard: async (boardId) => {
    try {
      await apiFetch(`${API_BASE}/boards/${boardId}`, { method: 'DELETE' });
      set((s) => {
        const nb = s.boards.filter((b) => b.id !== boardId);
        return { boards: nb, currentBoardId: nb.length > 0 ? nb[0].id : null };
      });
    } catch (err) { console.error('deleteBoard:', err); }
  },

  archiveBoard: async (boardId) => {
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id === boardId ? { ...b, archived: true } : b
      ),
      currentBoardId: s.currentBoardId === boardId
        ? (s.boards.find((b) => b.id !== boardId && !b.archived)?.id ?? null)
        : s.currentBoardId,
    }));
  },

  unarchiveBoard: async (boardId) => {
    set((s) => ({
      boards: s.boards.map((b) =>
        b.id === boardId ? { ...b, archived: false } : b
      ),
    }));
  },

  archiveList: async (listId) => {
    try {
      await apiFetch(`${API_BASE}/lists/${listId}/archive`, { method: 'PATCH' });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) =>
            l.id === listId ? { ...l, archived: true } : l
          ),
        })),
      }));
    } catch (err) {
      console.error('archiveList:', err);
    }
  },

  unarchiveList: async (listId) => {
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) =>
          l.id === listId ? { ...l, archived: false } : l
        ),
      })),
    }));
  },

  archiveCard: async (cardId) => {
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === cardId ? { ...c, archived: true } : c
          ),
        })),
      })),
    }));
    try {
      await apiFetch(`${API_BASE}/cards/${cardId}/archive`, { method: 'PATCH' });
    } catch (err) {
      console.error('archiveCard:', err);
      get().fetchBoards();
    }
  },

  unarchiveCard: async (cardId) => {
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === cardId ? { ...c, archived: false } : c
          ),
        })),
      })),
    }));
    try {
      await apiFetch(`${API_BASE}/cards/${cardId}/unarchive`, { method: 'PATCH' });
    } catch (err) {
      console.error('unarchiveCard:', err);
      get().fetchBoards();
    }
  },

  deleteLabel: async (labelId) => {
    try {
      await apiFetch(`${API_BASE}/labels/${labelId}`, { method: 'DELETE' });
      set((s) => ({
        availableLabels: s.availableLabels.filter((l) => l.id !== labelId),
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) => ({
              ...c,
              labels: c.labels.filter((cl) => cl.label.id !== labelId),
            })),
          })),
        })),
      }));
    } catch (err) {
      console.error('deleteLabel:', err);
    }
  },

  // ── Lists ────────────────────────────────────────────────────

  addList: async (boardId, title) => {
    try {
      const list = await apiFetch(`${API_BASE}/boards/${boardId}/lists`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      set((s) => ({
        boards: s.boards.map((b) =>
          b.id === boardId
            ? { ...b, lists: [...b.lists, { ...list, cards: list.cards ?? [] }] }
            : b
        ),
      }));
    } catch (err) { console.error('addList:', err); }
  },

  updateList: async (listId, title) => {
    try {
      await apiFetch(`${API_BASE}/lists/${listId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => (l.id === listId ? { ...l, title } : l)),
        })),
      }));
    } catch (err) { console.error('updateList:', err); }
  },

  deleteList: async (listId) => {
    try {
      await apiFetch(`${API_BASE}/lists/${listId}`, { method: 'DELETE' });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.filter((l) => l.id !== listId),
        })),
      }));
    } catch (err) { console.error('deleteList:', err); }
  },

  moveList: async (boardId, listId, newIndex) => {
    set((s) => {
      const board = s.boards.find((b) => b.id === boardId);
      if (!board) return s;
      const lists = [...board.lists];
      const ci = lists.findIndex((l) => l.id === listId);
      if (ci === -1) return s;
      const [moved] = lists.splice(ci, 1);
      lists.splice(newIndex, 0, moved);
      return {
        boards: s.boards.map((b) =>
          b.id === boardId
            ? { ...b, lists: lists.map((l, i) => ({ ...l, order: i })) }
            : b
        ),
      };
    });
    try {
      const board = get().boards.find((b) => b.id === boardId);
      if (!board) return;
      await apiFetch(`${API_BASE}/boards/${boardId}/lists/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({
          lists: board.lists.map((l, i) => ({ id: l.id, order: i })),
        }),
      });
    } catch (err) {
      console.error('moveList:', err);
      get().fetchBoards();
    }
  },

  // ── Cards ────────────────────────────────────────────────────

  addCard: async (boardId, listId, title) => {
    try {
      const card = await apiFetch(`${API_BASE}/lists/${listId}/cards`, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      const safeCard = {
        ...card,
        labels: dedupeCardLabels(card.labels ?? []),
        checklist: card.checklist ?? [],
        members: card.members ?? [],
        attachments: card.attachments ?? [],
        comments: card.comments ?? [],
        archived: card.archived ?? false,
      };
      set((s) => ({
        boards: s.boards.map((b) =>
          b.id === boardId
            ? { ...b, lists: b.lists.map((l) =>
                l.id === listId ? { ...l, cards: [...l.cards, safeCard] } : l
              )}
            : b
        ),
      }));
    } catch (err) { console.error('addCard:', err); }
  },

  updateCard: async (cardId, updates) => {
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
        })),
      })),
    }));
    try {
      await apiFetch(`${API_BASE}/cards/${cardId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('updateCard:', err);
      get().fetchBoards();
    }
  },

  deleteCard: async (cardId) => {
    try {
      await apiFetch(`${API_BASE}/cards/${cardId}`, { method: 'DELETE' });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.filter((c) => c.id !== cardId),
          })),
        })),
      }));
    } catch (err) { console.error('deleteCard:', err); }
  },

  moveCard: async (boardId, cardId, fromListId, toListId, newOrder) => {
    set((s) => {
      const board = s.boards.find((b) => b.id === boardId);
      if (!board) return s;
      const card = board.lists.flatMap((l) => l.cards).find((c) => c.id === cardId);
      if (!card) return s;
      const newBoards = s.boards.map((b) => {
        if (b.id !== boardId) return b;
        const newLists = b.lists.map((l) => {
          if (l.id === fromListId && l.id !== toListId)
            return { ...l, cards: l.cards.filter((c) => c.id !== cardId) };
          if (l.id === toListId) {
            const filtered = l.cards.filter((c) => c.id !== cardId);
            filtered.splice(newOrder, 0, { ...card, listId: toListId, order: newOrder });
            return { ...l, cards: filtered.map((c, i) => ({ ...c, order: i })) };
          }
          return l;
        });
        return { ...b, lists: newLists };
      });
      return { boards: newBoards };
    });
    try {
      await apiFetch(`${API_BASE}/cards/${cardId}/move`, {
        method: 'POST',
        body: JSON.stringify({ toListId, newOrder }),
      });
    } catch (err) {
      console.error('moveCard:', err);
      get().fetchBoards();
    }
  },

  // ── Labels ───────────────────────────────────────────────────

  addLabelToCard: async (cardId, labelId) => {
    // Guard: don't add if card already has this label
    const state = get();
    const card = state.boards
      .flatMap((b) => b.lists.flatMap((l) => l.cards))
      .find((c) => c.id === cardId);
    if (card && card.labels.some((cl) => cl.label?.id === labelId)) {
      return; // Already has this label, skip
    }
    try {
      const updatedCard = await apiFetch(`${API_BASE}/cards/${cardId}/labels`, {
        method: 'POST',
        body: JSON.stringify({ labelId }),
      });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === cardId
                ? { ...c, labels: dedupeCardLabels(updatedCard.labels ?? []) }
                : c
            ),
          })),
        })),
      }));
    } catch (err) { console.error('addLabelToCard:', err); }
  },

  removeLabelFromCard: async (cardId, labelId) => {
    try {
      const updatedCard = await apiFetch(`${API_BASE}/cards/${cardId}/labels/${labelId}`, {
        method: 'DELETE',
      });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === cardId
                ? { ...c, labels: dedupeCardLabels(updatedCard.labels ?? []) }
                : c
            ),
          })),
        })),
      }));
    } catch (err) { console.error('removeLabelFromCard:', err); }
  },

  createLabel: async (name, color) => {
    try {
      const label = await apiFetch(`${API_BASE}/labels`, {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      });
      set((s) => ({
        availableLabels: dedupeById([...s.availableLabels, label]),
      }));
      return label;
    } catch (err) {
      console.error('createLabel:', err);
      return null;
    }
  },

  // ── Checklist ────────────────────────────────────────────────

  addChecklistItem: async (cardId, text) => {
    try {
      const item = await apiFetch(`${API_BASE}/cards/${cardId}/checklist`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === cardId ? { ...c, checklist: [...c.checklist, item] } : c
            ),
          })),
        })),
      }));
    } catch (err) { console.error('addChecklistItem:', err); }
  },

  updateChecklistItem: async (itemId, done) => {
    // Optimistic
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) => ({
            ...c,
            checklist: c.checklist.map((item) =>
              item.id === itemId ? { ...item, done } : item
            ),
          })),
        })),
      })),
    }));
    try {
      await apiFetch(`${API_BASE}/checklist/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ done }),
      });
    } catch (err) { console.error('updateChecklistItem:', err); }
  },

  deleteChecklistItem: async (itemId) => {
    // Optimistic remove
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) => ({
            ...c,
            checklist: c.checklist.filter((item) => item.id !== itemId),
          })),
        })),
      })),
    }));
    try {
      await apiFetch(`${API_BASE}/checklist/${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('deleteChecklistItem:', err);
      get().fetchBoards(); // Restore on failure
    }
  },

  // ── Members ──────────────────────────────────────────────────

  addMemberToCard: async (cardId, memberName) => {
    try {
      const updatedCard = await apiFetch(`${API_BASE}/cards/${cardId}/members`, {
        method: 'POST',
        body: JSON.stringify({ memberName }),
      });
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === cardId ? { ...c, members: updatedCard.members ?? [] } : c
            ),
          })),
        })),
      }));
    } catch (err) { console.error('addMemberToCard:', err); }
  },

  removeMemberFromCard: async (cardId, memberName) => {
    try {
      const updatedCard = await apiFetch(
        `${API_BASE}/cards/${cardId}/members/${encodeURIComponent(memberName)}`,
        { method: 'DELETE' }
      );
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === cardId ? { ...c, members: updatedCard.members ?? [] } : c
            ),
          })),
        })),
      }));
    } catch (err) { console.error('removeMemberFromCard:', err); }
  },

  // ── Comments ─────────────────────────────────────────────────

  addComment: async (cardId, text) => {
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      text,
      cardId,
      createdAt: new Date().toISOString(),
    };
    // Optimistic add
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === cardId
              ? { ...c, comments: [...(c.comments ?? []), tempComment] }
              : c
          ),
        })),
      })),
    }));
    try {
      // Backend comment endpoint (may not exist — graceful fallback)
      const comment = await apiFetch(`${API_BASE}/cards/${cardId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      // Replace temp with real
      set((s) => ({
        boards: s.boards.map((b) => ({
          ...b,
          lists: b.lists.map((l) => ({
            ...l,
            cards: l.cards.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    comments: (c.comments ?? []).map((cm) =>
                      cm.id === tempId ? comment : cm
                    ),
                  }
                : c
            ),
          })),
        })),
      }));
    } catch {
      // Keep the optimistic comment even if backend fails (local only)
    }
  },

  // ── Attachments (local only — no dedicated backend endpoint) ─

  addAttachment: (cardId, url, displayText) => {
    const attachment = {
      id: `att-${Date.now()}`,
      url,
      displayText: displayText || url,
      addedAt: new Date().toISOString(),
    };
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === cardId
              ? { ...c, attachments: [...(c.attachments ?? []), attachment] }
              : c
          ),
        })),
      })),
    }));
    // Persist via updateCard (stores as JSON in backend)
    const card = get().boards
      .flatMap((b) => b.lists.flatMap((l) => l.cards))
      .find((c) => c.id === cardId);
    if (card) {
      const newAttachments = [...(card.attachments ?? []), attachment];
      apiFetch(`${API_BASE}/cards/${cardId}`, {
        method: 'PATCH',
        body: JSON.stringify({ attachments: newAttachments }),
      }).catch(() => {});
    }
  },

  removeAttachment: (cardId, attachmentId) => {
    set((s) => ({
      boards: s.boards.map((b) => ({
        ...b,
        lists: b.lists.map((l) => ({
          ...l,
          cards: l.cards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  attachments: (c.attachments ?? []).filter(
                    (a: any) => a.id !== attachmentId
                  ),
                }
              : c
          ),
        })),
      })),
    }));
    const card = get().boards
      .flatMap((b) => b.lists.flatMap((l) => l.cards))
      .find((c) => c.id === cardId);
    if (card) {
      const newAttachments = (card.attachments ?? []).filter((a: any) => a.id !== attachmentId);
      apiFetch(`${API_BASE}/cards/${cardId}`, {
        method: 'PATCH',
        body: JSON.stringify({ attachments: newAttachments }),
      }).catch(() => {});
    }
  },

  // ── Search & Filter ──────────────────────────────────────────

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (filters) =>
    set((s) => ({
      filterLabels:  filters.labels   ?? s.filterLabels,
      filterMembers: filters.members  ?? s.filterMembers,
      filterDueDate: filters.dueDate  ?? s.filterDueDate,
    })),

  clearFilters: () =>
    set({ searchQuery: '', filterLabels: [], filterMembers: [], filterDueDate: 'all' }),
}));
