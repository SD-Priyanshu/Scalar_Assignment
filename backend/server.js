const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Validation helpers
const validateString = (value, fieldName, minLength = 1) => {
  if (!value || typeof value !== 'string' || value.trim().length < minLength) {
    throw new Error(`${fieldName} is required and must be at least ${minLength} character(s)`);
  }
  return value.trim();
};

const validateId = (value, fieldName = 'ID') => {
  if (!value || typeof value !== 'string') {
    throw new Error(`${fieldName} is required and must be a valid string`);
  }
  return value;
};

// Error handler middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Prisma validation errors
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  // Prisma unique constraint errors
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'This resource already exists' });
  }
  
  // Validation errors
  if (err.message.includes('is required') || err.message.includes('must be')) {
    return res.status(400).json({ error: err.message });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Routes
app.get('/api/boards', asyncHandler(async (req, res) => {
  const boards = await prisma.board.findMany({
    include: {
      lists: {
        include: {
          cards: {
            include: {
              labels: {
                include: {
                  label: true,
                },
              },
              checklist: true,
              comments: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  res.json(boards);
}));

app.post('/api/boards', asyncHandler(async (req, res) => {
  const { title } = req.body;
  const validatedTitle = validateString(title, 'Board title', 1);
  
  const board = await prisma.board.create({
    data: { title: validatedTitle },
    include: {
      lists: {
        include: {
          cards: {
            include: {
              labels: {
                include: {
                  label: true,
                },
              },
              checklist: true,
              comments: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  res.status(201).json(board);
}));

app.get('/api/boards/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id, 'Board ID');
  
  const board = await prisma.board.findUniqueOrThrow({
    where: { id },
    include: {
      lists: {
        include: {
          cards: {
            include: {
              labels: {
                include: {
                  label: true,
                },
              },
              checklist: true,
              comments: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  res.json(board);
}));

app.delete('/api/boards/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id, 'Board ID');
  
  await prisma.board.delete({ where: { id } });
  res.json({ success: true });
}));

// Lists
app.get('/api/lists', asyncHandler(async (req, res) => {
  const { boardId } = req.query;
  if (boardId) {
    validateId(boardId, 'Board ID');
  }
  
  const lists = await prisma.list.findMany({
    where: boardId ? { boardId } : {},
    include: {
      cards: {
        include: {
          labels: {
            include: {
              label: true,
            },
          },
          checklist: true,
          comments: true,
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });
  res.json(lists);
}));

app.post('/api/lists', asyncHandler(async (req, res) => {
  const { boardId, title } = req.body;
  const validatedBoardId = validateId(boardId, 'Board ID');
  const validatedTitle = validateString(title, 'List title', 1);
  
  // Verify board exists
  await prisma.board.findUniqueOrThrow({ where: { id: validatedBoardId } });
  
  const maxOrder = await prisma.list.findFirst({
    where: { boardId: validatedBoardId },
    orderBy: { order: 'desc' },
  });
  const order = maxOrder ? maxOrder.order + 1 : 0;
  
  const list = await prisma.list.create({
    data: { boardId: validatedBoardId, title: validatedTitle, order },
    include: {
      cards: {
        include: {
          labels: {
            include: {
              label: true,
            },
          },
          checklist: true,
          comments: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  });
  res.status(201).json(list);
}));

app.patch('/api/lists/:id/move', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newOrder } = req.body;
  
  validateId(id, 'List ID');
  if (!Number.isInteger(newOrder) || newOrder < 0) {
    throw new Error('Order must be a non-negative integer');
  }
  
  await prisma.list.update({
    where: { id },
    data: { order: newOrder },
  });
  res.json({ success: true });
}));

app.delete('/api/lists/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id, 'List ID');
  
  await prisma.list.delete({ where: { id } });
  res.json({ success: true });
}));

// Cards
app.post('/api/cards', asyncHandler(async (req, res) => {
  const { listId, title } = req.body;
  const validatedListId = validateId(listId, 'List ID');
  const validatedTitle = validateString(title, 'Card title', 1);
  
  // Verify list exists
  await prisma.list.findUniqueOrThrow({ where: { id: validatedListId } });
  
  const maxOrder = await prisma.card.findFirst({
    where: { listId: validatedListId },
    orderBy: { order: 'desc' },
  });
  const order = maxOrder ? maxOrder.order + 1 : 0;
  
  const card = await prisma.card.create({
    data: { 
      listId: validatedListId, 
      title: validatedTitle, 
      order, 
      members: [], 
      attachments: [] 
    },
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
    },
  });
  res.status(201).json(card);
}));

app.put('/api/cards/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  validateId(id, 'Card ID');
  
  // Validate title if provided
  if (updates.title) {
    updates.title = validateString(updates.title, 'Card title', 1);
  }
  
  // Validate order if provided
  if (typeof updates.order !== 'undefined') {
    if (!Number.isInteger(updates.order) || updates.order < 0) {
      throw new Error('Order must be a non-negative integer');
    }
  }
  
  const card = await prisma.card.update({
    where: { id },
    data: updates,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
    },
  });
  res.json(card);
}));

app.patch('/api/cards/:id/move', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { toListId, newOrder } = req.body;
  
  validateId(id, 'Card ID');
  validateId(toListId, 'List ID');
  if (!Number.isInteger(newOrder) || newOrder < 0) {
    throw new Error('Order must be a non-negative integer');
  }
  
  // Verify list exists
  await prisma.list.findUniqueOrThrow({ where: { id: toListId } });
  
  await prisma.card.update({
    where: { id },
    data: { listId: toListId, order: newOrder },
  });
  res.json({ success: true });
}));

app.delete('/api/cards/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id, 'Card ID');
  
  await prisma.card.delete({ where: { id } });
  res.json({ success: true });
}));

// Checklist
app.post('/api/cards/:cardId/checklist', asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { text } = req.body;
  
  validateId(cardId, 'Card ID');
  const validatedText = validateString(text, 'Checklist item text', 1);
  
  // Verify card exists
  await prisma.card.findUniqueOrThrow({ where: { id: cardId } });
  
  const item = await prisma.checklistItem.create({
    data: { cardId, text: validatedText },
  });
  res.status(201).json(item);
}));

app.patch('/api/checklist/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { done } = req.body;
  
  validateId(id, 'Checklist item ID');
  if (typeof done !== 'boolean') {
    throw new Error('Done must be a boolean value');
  }
  
  const item = await prisma.checklistItem.update({
    where: { id },
    data: { done },
  });
  res.json(item);
}));

app.delete('/api/checklist/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id, 'Checklist item ID');
  
  await prisma.checklistItem.delete({ where: { id } });
  res.json({ success: true });
}));

// Comments
app.post('/api/cards/:cardId/comments', asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { text } = req.body;
  
  validateId(cardId, 'Card ID');
  const validatedText = validateString(text, 'Comment text', 1);
  
  // Verify card exists
  await prisma.card.findUniqueOrThrow({ where: { id: cardId } });
  
  const comment = await prisma.comment.create({
    data: { cardId, text: validatedText },
  });
  res.status(201).json(comment);
}));

app.delete('/api/comments/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateId(id, 'Comment ID');
  
  await prisma.comment.delete({ where: { id } });
  res.json({ success: true });
}));

// Labels
app.post('/api/cards/:cardId/labels', asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  const { labelId } = req.body;
  
  validateId(cardId, 'Card ID');
  validateId(labelId, 'Label ID');
  
  // Verify card and label exist
  await prisma.card.findUniqueOrThrow({ where: { id: cardId } });
  await prisma.label.findUniqueOrThrow({ where: { id: labelId } });
  
  const cardLabel = await prisma.cardLabel.create({
    data: { cardId, labelId },
  });
  res.status(201).json(cardLabel);
}));

app.delete('/api/cards/:cardId/labels/:labelId', asyncHandler(async (req, res) => {
  const { cardId, labelId } = req.params;
  
  validateId(cardId, 'Card ID');
  validateId(labelId, 'Label ID');
  
  await prisma.cardLabel.delete({
    where: { cardId_labelId: { cardId, labelId } },
  });
  res.json({ success: true });
}));

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ API endpoints ready`);
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
  });
});