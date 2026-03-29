// Card Service - Business logic for card operations

const prisma = require('../utils/db');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validateString, validateId, validateInteger } = require('../utils/validation');

/**
 * Create a new card in a list
 * @param {string} listId - List ID
 * @param {string} title - Card title
 * @param {Object} options - Optional fields {description, dueDate}
 * @returns {Promise<Object>} Created card object
 */
const createCard = async (listId, title, options = {}) => {
  const validatedListId = validateId(listId, 'List ID');
  const validatedTitle = validateString(title, 'Card title', {
    minLength: 1,
    maxLength: 255,
  });

  // Verify list exists
  const list = await prisma.list.findUnique({
    where: { id: validatedListId },
  });

  if (!list) {
    throw new NotFoundError(`List with ID "${validatedListId}" not found`);
  }

  // Get the next order
  const maxOrder = await prisma.card.findFirst({
    where: { listId: validatedListId },
    orderBy: { order: 'desc' },
  });
  const order = maxOrder ? maxOrder.order + 1 : 0;

  const cardData = {
    listId: validatedListId,
    title: validatedTitle,
    order,
    members: [],
    attachments: [],
  };

  // Optional fields
  if (options.description) {
    cardData.description = validateString(options.description, 'Description', {
      required: false,
      maxLength: 2000,
    });
  }

  if (options.dueDate) {
    const dueDate = new Date(options.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw new ValidationError('Due date must be a valid date');
    }
    cardData.dueDate = dueDate;
  }

  if (options.cover) {
    cardData.cover = validateString(options.cover, 'Cover URL', {
      required: false,
      maxLength: 2000,
    });
  }

  const card = await prisma.card.create({
    data: cardData,
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return card;
};

/**
 * Get all cards for a list
 * @param {string} listId - List ID
 * @returns {Promise<Array>} Array of card objects
 */
const getCardsByListId = async (listId) => {
  const validatedListId = validateId(listId, 'List ID');

  // Verify list exists
  const list = await prisma.list.findUnique({
    where: { id: validatedListId },
  });

  if (!list) {
    throw new NotFoundError(`List with ID "${validatedListId}" not found`);
  }

  const cards = await prisma.card.findMany({
    where: { listId: validatedListId },
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
  });

  return cards;
};

/**
 * Get a card by ID
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Card object
 */
const getCardById = async (cardId) => {
  const validatedId = validateId(cardId, 'Card ID');

  const card = await prisma.card.findUnique({
    where: { id: validatedId },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedId}" not found`);
  }

  return card;
};

/**
 * Update a card (title, description, dueDate, etc)
 * @param {string} cardId - Card ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated card object
 */
const updateCard = async (cardId, updates) => {
  const validatedId = validateId(cardId, 'Card ID');

  // Validate updates
  const validatedUpdates = {};
  if (updates.title !== undefined) {
    validatedUpdates.title = validateString(updates.title, 'Card title', {
      minLength: 1,
      maxLength: 255,
    });
  }
  if (updates.description !== undefined) {
    validatedUpdates.description = validateString(updates.description, 'Description', {
      required: false,
      maxLength: 2000,
    });
  }
  if (updates.dueDate !== undefined) {
    if (updates.dueDate === null) {
      validatedUpdates.dueDate = null;
    } else {
      const dueDate = new Date(updates.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new ValidationError('Due date must be a valid date');
      }
      validatedUpdates.dueDate = dueDate;
    }
  }
  if (updates.cover !== undefined) {
    validatedUpdates.cover = validateString(updates.cover, 'Cover URL', {
      required: false,
      maxLength: 2000,
    });
  }
  if (updates.members !== undefined) {
    if (!Array.isArray(updates.members)) {
      throw new ValidationError('Members must be an array');
    }
    validatedUpdates.members = updates.members;
  }
  if (updates.order !== undefined) {
    validatedUpdates.order = validateInteger(updates.order, 'Order', { min: 0 });
  }

  // Verify card exists
  const existingCard = await prisma.card.findUnique({
    where: { id: validatedId },
  });

  if (!existingCard) {
    throw new NotFoundError(`Card with ID "${validatedId}" not found`);
  }

  const card = await prisma.card.update({
    where: { id: validatedId },
    data: validatedUpdates,
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return card;
};

/**
 * Move card to another list (with new order)
 * @param {string} cardId - Card ID
 * @param {string} toListId - Target list ID
 * @param {number} newOrder - New position in target list
 * @returns {Promise<Object>} Updated card object
 */
const moveCardToList = async (cardId, toListId, newOrder) => {
  const validatedCardId = validateId(cardId, 'Card ID');
  const validatedListId = validateId(toListId, 'Target List ID');
  const validatedOrder = validateInteger(newOrder, 'Order', { min: 0 });

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  // Verify list exists
  const targetList = await prisma.list.findUnique({
    where: { id: validatedListId },
  });

  if (!targetList) {
    throw new NotFoundError(`List with ID "${validatedListId}" not found`);
  }

  const updatedCard = await prisma.card.update({
    where: { id: validatedCardId },
    data: {
      listId: validatedListId,
      order: validatedOrder,
    },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return updatedCard;
};

/**
 * Reorder cards within a list or across lists
 * @param {Array} cardOrders - Array of {id, listId, order} objects
 * @returns {Promise<Array>} Updated cards
 */
const reorderCards = async (cardOrders) => {
  if (!Array.isArray(cardOrders) || cardOrders.length === 0) {
    throw new ValidationError('Card orders must be a non-empty array');
  }

  // Validate each card order
  const validatedOrders = cardOrders.map((item, index) => {
    validateId(item.id, `Card ID at index ${index}`);
    validateId(item.listId, `List ID at index ${index}`);
    validateInteger(item.order, `Order at index ${index}`, { min: 0 });
    return item;
  });

  // Update all card orders and list assignments
  const updatePromises = validatedOrders.map((item) =>
    prisma.card.update({
      where: { id: item.id },
      data: {
        listId: item.listId,
        order: item.order,
      },
      include: {
        labels: {
          include: {
            label: true,
          },
        },
        checklist: true,
        comments: true,
      },
    })
  );

  const updatedCards = await Promise.all(updatePromises);
  return updatedCards;
};

/**
 * Delete a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Success message
 */
const deleteCard = async (cardId) => {
  const validatedId = validateId(cardId, 'Card ID');

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedId}" not found`);
  }

  // Delete the card (related data will cascade delete)
  await prisma.card.delete({
    where: { id: validatedId },
  });

  return { success: true, message: 'Card deleted successfully' };
};

/**
 * Archive a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Updated card object
 */
const archiveCard = async (cardId) => {
  const validatedId = validateId(cardId, 'Card ID');

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedId}" not found`);
  }

  const updatedCard = await prisma.card.update({
    where: { id: validatedId },
    data: { archived: true },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return updatedCard;
};

/**
 * Unarchive a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Updated card object
 */
const unarchiveCard = async (cardId) => {
  const validatedId = validateId(cardId, 'Card ID');

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedId}" not found`);
  }

  const updatedCard = await prisma.card.update({
    where: { id: validatedId },
    data: { archived: false },
    include: {
      labels: {
        include: {
          label: true,
        },
      },
      checklist: true,
      comments: true,
    },
  });

  return updatedCard;
};

/**
 * Add member to card
 * @param {string} cardId - Card ID
 * @param {string} memberName - Member name
 * @returns {Promise<Object>} Updated card object
 */
const addMember = async (cardId, memberName) => {
  const validatedCardId = validateId(cardId, 'Card ID');
  const validatedMember = validateString(memberName, 'Member name', {
    minLength: 1,
    maxLength: 255,
  });

  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  const members = Array.isArray(card.members) ? card.members : [];
  if (!members.includes(validatedMember)) {
    members.push(validatedMember);
  }

  return updateCard(validatedCardId, { members });
};

/**
 * Remove member from card
 * @param {string} cardId - Card ID
 * @param {string} memberName - Member name
 * @returns {Promise<Object>} Updated card object
 */
const removeMember = async (cardId, memberName) => {
  const validatedCardId = validateId(cardId, 'Card ID');
  const validatedMember = validateString(memberName, 'Member name', {
    minLength: 1,
    maxLength: 255,
  });

  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  const members = Array.isArray(card.members) ? card.members : [];
  const updatedMembers = members.filter((m) => m !== validatedMember);

  return updateCard(validatedCardId, { members: updatedMembers });
};

module.exports = {
  createCard,
  getCardsByListId,
  getCardById,
  updateCard,
  moveCardToList,
  reorderCards,
  deleteCard,
  archiveCard,
  unarchiveCard,
  addMember,
  removeMember,
};
