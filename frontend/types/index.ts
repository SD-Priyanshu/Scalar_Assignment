export interface Board {
  id: string;
  title: string;
  background?: string;
  lists: List[];
  archived?: boolean;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  cards: Card[];
  order: number;
  archived?: boolean;
}

export interface Attachment {
  id: string;
  url: string;
  displayText: string;
  addedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  labels: { id: string; label: Label }[];
  dueDate?: string;
  checklist: ChecklistItem[];
  members: string[];
  attachments: (string | Attachment)[];
  cover?: string;
  backgroundImage?: string;
  comments: Comment[];
  order: number;
  archived?: boolean;
  completed?: boolean;
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