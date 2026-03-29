// Card Search & Filter Service
const prisma = require('../utils/db');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validateId, validateString } = require('../utils/validation');

/**
 * Search and filter cards by title, labels, members, and due dates.
 * NOTE: MySQL does not support Prisma's `mode: 'insensitive'` — case
 * insensitivity is handled by MySQL's default collation (utf8mb4_unicode_ci).
 */
const searchAndFilterCards = async (boardId, filters = {}) => {
  const { q, labelIds, memberNames, dueDateStart, dueDateEnd } = filters;

  const whereClause = {};

  // Scope to a specific board
  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = {
      boardId: validatedBoardId,
    };
  }

  // Title search — MySQL collation handles case insensitivity, no `mode` needed
  if (q) {
    const validatedQuery = validateString(q, 'Search query', {
      required: false,
      maxLength: 255,
    });
    if (validatedQuery) {
      whereClause.title = {
        contains: validatedQuery,
      };
    }
  }

  // Due date range filter
  if (dueDateStart || dueDateEnd) {
    whereClause.dueDate = {};
    if (dueDateStart) {
      const startDate = new Date(dueDateStart);
      if (isNaN(startDate.getTime())) {
        throw new ValidationError('Invalid start date format');
      }
      whereClause.dueDate.gte = startDate;
    }
    if (dueDateEnd) {
      const endDate = new Date(dueDateEnd);
      if (isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid end date format');
      }
      endDate.setHours(23, 59, 59, 999);
      whereClause.dueDate.lte = endDate;
    }
  }

  const cards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
      list: {
        select: { id: true, title: true, boardId: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  let filteredCards = cards;

  // Filter by labels (in-memory — Prisma JSON fields can't do this in MySQL)
  if (Array.isArray(labelIds) && labelIds.length > 0) {
    const validatedLabelIds = labelIds.map((id, idx) =>
      validateId(id, `Label ID at index ${idx}`)
    );
    filteredCards = filteredCards.filter((card) => {
      const cardLabelIds = card.labels.map((cl) => cl.label.id);
      return validatedLabelIds.every((labelId) => cardLabelIds.includes(labelId));
    });
  }

  // Filter by members (stored as JSON in MySQL — must be done in memory)
  if (Array.isArray(memberNames) && memberNames.length > 0) {
    const validatedMembers = memberNames.map((name, idx) =>
      validateString(name, `Member name at index ${idx}`, { minLength: 1, maxLength: 255 })
    );
    filteredCards = filteredCards.filter((card) => {
      const cardMembers = Array.isArray(card.members) ? card.members : [];
      return validatedMembers.every((memberName) => cardMembers.includes(memberName));
    });
  }

  return filteredCards;
};

/**
 * Search cards by title only.
 * MySQL collation (utf8mb4_unicode_ci) provides case-insensitive matching.
 */
const searchCardsByTitle = async (query, boardId = null, listId = null) => {
  const validatedQuery = validateString(query, 'Search query', {
    minLength: 1,
    maxLength: 255,
  });

  const whereClause = {
    title: { contains: validatedQuery },  // no `mode` — MySQL handles it
  };

  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = { boardId: validatedBoardId };
  }

  if (listId) {
    const validatedListId = validateId(listId, 'List ID');
    whereClause.list = whereClause.list
      ? { ...whereClause.list, id: validatedListId }
      : { id: validatedListId };
  }

  const cards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
      list: {
        select: { id: true, title: true, boardId: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  return cards;
};

/**
 * Filter cards by label.
 */
const filterCardsByLabel = async (labelId, boardId = null) => {
  const validatedLabelId = validateId(labelId, 'Label ID');

  const label = await prisma.label.findUnique({ where: { id: validatedLabelId } });
  if (!label) {
    throw new NotFoundError(`Label with ID "${validatedLabelId}" not found`);
  }

  const whereClause = {
    labels: { some: { labelId: validatedLabelId } },
  };

  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = { boardId: validatedBoardId };
  }

  const cards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
      list: {
        select: { id: true, title: true, boardId: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  return cards;
};

/**
 * Filter cards by member assignment.
 * Members are stored as JSON so filtering must be done in memory.
 */
const filterCardsByMember = async (memberName, boardId = null) => {
  const validatedMemberName = validateString(memberName, 'Member name', {
    minLength: 1,
    maxLength: 255,
  });

  const whereClause = {};
  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = { boardId: validatedBoardId };
  }

  const allCards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
      list: {
        select: { id: true, title: true, boardId: true },
      },
    },
  });

  const filteredCards = allCards
    .filter((card) => {
      const members = Array.isArray(card.members) ? card.members : [];
      return members.includes(validatedMemberName);
    })
    .sort((a, b) => a.order - b.order);

  return filteredCards;
};

/**
 * Filter cards by due date range.
 */
const filterCardsByDueDate = async (startDate, endDate, boardId = null) => {
  if (!startDate && !endDate) {
    throw new ValidationError('At least one of startDate or endDate is required');
  }

  const whereClause = { dueDate: {} };

  if (startDate) {
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) throw new ValidationError('Invalid start date format');
    whereClause.dueDate.gte = parsedStart;
  }
  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (isNaN(parsedEnd.getTime())) throw new ValidationError('Invalid end date format');
    parsedEnd.setHours(23, 59, 59, 999);
    whereClause.dueDate.lte = parsedEnd;
  }

  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = { boardId: validatedBoardId };
  }

  const cards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
      list: {
        select: { id: true, title: true, boardId: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  return cards;
};

/**
 * Filter cards with no due date.
 */
const filterCardsWithoutDueDate = async (boardId = null) => {
  const whereClause = { dueDate: null };

  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = { boardId: validatedBoardId };
  }

  const cards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
      list: {
        select: { id: true, title: true, boardId: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  return cards;
};

/**
 * Filter cards by checklist completion status.
 */
const filterCardsByChecklistCompletion = async (boardId = null, includeCompleted = false) => {
  const whereClause = {};

  if (boardId) {
    const validatedBoardId = validateId(boardId, 'Board ID');
    whereClause.list = { boardId: validatedBoardId };
  }

  // Only fetch cards that actually have checklist items
  whereClause.checklist = { some: {} };

  const allCards = await prisma.card.findMany({
    where: whereClause,
    include: {
      labels: { include: { label: true } },
      checklist: true,
      comments: true,
    },
  });

  const filteredCards = allCards.filter((card) => {
    if (includeCompleted) {
      return card.checklist.some((item) => item.done);
    } else {
      return card.checklist.some((item) => !item.done);
    }
  });

  return filteredCards;
};

/**
 * Get search statistics.
 */
const getSearchStatistics = async () => {
  const totalCards = await prisma.card.count();

  const cardsWithLabels = await prisma.card.count({
    where: { labels: { some: {} } },
  });

  const cardsWithDueDate = await prisma.card.count({
    where: { dueDate: { not: null } },
  });

  const allLabels = await prisma.label.findMany({
    select: {
      id: true,
      name: true,
      color: true,
      _count: { select: { cards: true } },
    },
  });

  return {
    totalCards,
    cardsWithLabels,
    cardsWithDueDate,
    totalUniqueLabels: allLabels.length,
    labelDistribution: allLabels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      cardCount: label._count.cards,
    })),
  };
};

module.exports = {
  searchAndFilterCards,
  searchCardsByTitle,
  filterCardsByLabel,
  filterCardsByMember,
  filterCardsByDueDate,
  filterCardsWithoutDueDate,
  filterCardsByChecklistCompletion,
  getSearchStatistics,
};