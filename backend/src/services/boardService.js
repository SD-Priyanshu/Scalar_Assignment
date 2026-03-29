// Board Service - Business logic for board operations

const prisma = require('../utils/db');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validateString, validateId } = require('../utils/validation');

/**
 * Create a new board
 * @param {string} title - Board title
 * @returns {Promise<Object>} Created board object
 */
const createBoard = async (title) => {
  const validatedTitle = validateString(title, 'Board title', {
    minLength: 1,
    maxLength: 255,
  });

  const board = await prisma.board.create({
    data: {
      title: validatedTitle,
      background: '#0079bf',
    },
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

  return board;
};

/**
 * Get all boards
 * @returns {Promise<Array>} Array of board objects
 */
const getAllBoards = async () => {
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
    orderBy: { createdAt: 'desc' },
  });

  return boards;
};

/**
 * Get a board by ID with all its lists and cards
 * @param {string} boardId - Board ID
 * @returns {Promise<Object>} Board object with lists and cards
 */
const getBoardById = async (boardId) => {
  const validatedId = validateId(boardId, 'Board ID');

  const board = await prisma.board.findUnique({
    where: { id: validatedId },
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

  if (!board) {
    throw new NotFoundError(`Board with ID "${boardId}" not found`);
  }

  return board;
};

/**
 * Update a board
 * @param {string} boardId - Board ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated board object
 */
const updateBoard = async (boardId, updates) => {
  const validatedId = validateId(boardId, 'Board ID');

  // Validate updates
  const validatedUpdates = {};
  if (updates.title !== undefined) {
    validatedUpdates.title = validateString(updates.title, 'Board title', {
      minLength: 1,
      maxLength: 255,
    });
  }
  if (updates.background !== undefined) {
    validatedUpdates.background = validateString(updates.background, 'Background', {
      required: false,
    });
  }

  const board = await prisma.board.update({
    where: { id: validatedId },
    data: validatedUpdates,
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

  return board;
};

/**
 * Delete a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Object>} Success message
 */
const deleteBoard = async (boardId) => {
  const validatedId = validateId(boardId, 'Board ID');

  const board = await prisma.board.findUnique({
    where: { id: validatedId },
  });

  if (!board) {
    throw new NotFoundError(`Board with ID "${validatedId}" not found`);
  }

  await prisma.board.delete({
    where: { id: validatedId },
  });

  return { success: true, message: 'Board deleted successfully' };
};

module.exports = {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
};
