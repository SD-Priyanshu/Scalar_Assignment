// List Service - Business logic for list operations

const prisma = require('../utils/db');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validateString, validateId, validateInteger } = require('../utils/validation');

/**
 * Create a new list in a board
 * @param {string} boardId - Board ID
 * @param {string} title - List title
 * @returns {Promise<Object>} Created list object
 */
const createList = async (boardId, title) => {
  const validatedBoardId = validateId(boardId, 'Board ID');
  const validatedTitle = validateString(title, 'List title', {
    minLength: 1,
    maxLength: 255,
  });

  // Verify board exists
  const board = await prisma.board.findUnique({
    where: { id: validatedBoardId },
  });

  if (!board) {
    throw new NotFoundError(`Board with ID "${validatedBoardId}" not found`);
  }

  // Get the next order
  const maxOrder = await prisma.list.findFirst({
    where: { boardId: validatedBoardId },
    orderBy: { order: 'desc' },
  });
  const order = maxOrder ? maxOrder.order + 1 : 0;

  const list = await prisma.list.create({
    data: {
      boardId: validatedBoardId,
      title: validatedTitle,
      order,
    },
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

  return list;
};

/**
 * Get all lists for a board
 * @param {string} boardId - Board ID
 * @returns {Promise<Array>} Array of list objects
 */
const getListsByBoardId = async (boardId) => {
  const validatedBoardId = validateId(boardId, 'Board ID');

  // Verify board exists
  const board = await prisma.board.findUnique({
    where: { id: validatedBoardId },
  });

  if (!board) {
    throw new NotFoundError(`Board with ID "${validatedBoardId}" not found`);
  }

  const lists = await prisma.list.findMany({
    where: { boardId: validatedBoardId },
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

  return lists;
};

/**
 * Get a list by ID
 * @param {string} listId - List ID
 * @returns {Promise<Object>} List object
 */
const getListById = async (listId) => {
  const validatedId = validateId(listId, 'List ID');

  const list = await prisma.list.findUnique({
    where: { id: validatedId },
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

  if (!list) {
    throw new NotFoundError(`List with ID "${validatedId}" not found`);
  }

  return list;
};

/**
 * Update a list (title and/or order)
 * @param {string} listId - List ID
 * @param {Object} updates - Fields to update {title?, order?}
 * @returns {Promise<Object>} Updated list object
 */
const updateList = async (listId, updates) => {
  const validatedId = validateId(listId, 'List ID');

  // Validate updates
  const validatedUpdates = {};
  if (updates.title !== undefined) {
    validatedUpdates.title = validateString(updates.title, 'List title', {
      minLength: 1,
      maxLength: 255,
    });
  }
  if (updates.order !== undefined) {
    validatedUpdates.order = validateInteger(updates.order, 'Order', { min: 0 });
  }

  // Verify list exists
  const existingList = await prisma.list.findUnique({
    where: { id: validatedId },
  });

  if (!existingList) {
    throw new NotFoundError(`List with ID "${validatedId}" not found`);
  }

  const list = await prisma.list.update({
    where: { id: validatedId },
    data: validatedUpdates,
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

  return list;
};

/**
 * Archive a list
 * @param {string} listId - List ID
 * @returns {Promise<Object>} Updated list object
 */
const archiveList = async (listId) => {
  const validatedId = validateId(listId, 'List ID');

  // Verify list exists
  const existingList = await prisma.list.findUnique({
    where: { id: validatedId },
  });

  if (!existingList) {
    throw new NotFoundError(`List with ID "${validatedId}" not found`);
  }

  const list = await prisma.list.update({
    where: { id: validatedId },
    data: { archived: true },
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

  return list;
};

/**
 * Reorder lists (drag and drop)
 * Updates orders for multiple lists in one operation
 * @param {string} boardId - Board ID
 * @param {Array} listOrders - Array of {id, order} objects
 * @returns {Promise<Array>} Updated lists
 */
const reorderLists = async (boardId, listOrders) => {
  const validatedBoardId = validateId(boardId, 'Board ID');

  if (!Array.isArray(listOrders) || listOrders.length === 0) {
    throw new ValidationError('List orders must be a non-empty array');
  }

  // Verify board exists
  const board = await prisma.board.findUnique({
    where: { id: validatedBoardId },
  });

  if (!board) {
    throw new NotFoundError(`Board with ID "${validatedBoardId}" not found`);
  }

  // Validate each list order
  const validatedOrders = listOrders.map((item, index) => {
    validateId(item.id, `List ID at index ${index}`);
    validateInteger(item.order, `Order at index ${index}`, { min: 0 });
    return item;
  });

  // Update all list orders
  const updatePromises = validatedOrders.map((item) =>
    prisma.list.update({
      where: { id: item.id },
      data: { order: item.order },
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
    })
  );

  const updatedLists = await Promise.all(updatePromises);

  // Sort by order before returning
  return updatedLists.sort((a, b) => a.order - b.order);
};

/**
 * Delete a list
 * @param {string} listId - List ID
 * @returns {Promise<Object>} Success message
 */
const deleteList = async (listId) => {
  const validatedId = validateId(listId, 'List ID');

  // Verify list exists
  const list = await prisma.list.findUnique({
    where: { id: validatedId },
  });

  if (!list) {
    throw new NotFoundError(`List with ID "${validatedId}" not found`);
  }

  // Delete the list (cards will be deleted via cascade)
  await prisma.list.delete({
    where: { id: validatedId },
  });

  return { success: true, message: 'List deleted successfully' };
};

module.exports = {
  createList,
  getListsByBoardId,
  getListById,
  updateList,
  reorderLists,
  deleteList,
};
