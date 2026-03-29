// Checklist Item Service - Business logic for checklist operations

const prisma = require('../utils/db');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { validateString, validateId } = require('../utils/validation');

/**
 * Create a checklist item for a card
 * @param {string} cardId - Card ID
 * @param {string} text - Checklist item text
 * @returns {Promise<Object>} Created checklist item
 */
const createChecklistItem = async (cardId, text) => {
  const validatedCardId = validateId(cardId, 'Card ID');
  const validatedText = validateString(text, 'Checklist item text', {
    minLength: 1,
    maxLength: 255,
  });

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  const item = await prisma.checklistItem.create({
    data: {
      cardId: validatedCardId,
      text: validatedText,
      done: false,
    },
  });

  return item;
};

/**
 * Get all checklist items for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Array>} Array of checklist items
 */
const getChecklistItemsByCardId = async (cardId) => {
  const validatedCardId = validateId(cardId, 'Card ID');

  // Verify card exists
  const card = await prisma.card.findUnique({
    where: { id: validatedCardId },
  });

  if (!card) {
    throw new NotFoundError(`Card with ID "${validatedCardId}" not found`);
  }

  const items = await prisma.checklistItem.findMany({
    where: { cardId: validatedCardId },
    orderBy: { createdAt: 'asc' },
  });

  return items;
};

/**
 * Get a checklist item by ID
 * @param {string} itemId - Checklist item ID
 * @returns {Promise<Object>} Checklist item object
 */
const getChecklistItemById = async (itemId) => {
  const validatedId = validateId(itemId, 'Checklist Item ID');

  const item = await prisma.checklistItem.findUnique({
    where: { id: validatedId },
  });

  if (!item) {
    throw new NotFoundError(`Checklist item with ID "${validatedId}" not found`);
  }

  return item;
};

/**
 * Update a checklist item (text and/or done status)
 * @param {string} itemId - Checklist item ID
 * @param {Object} updates - Fields to update {text?, done?}
 * @returns {Promise<Object>} Updated checklist item
 */
const updateChecklistItem = async (itemId, updates) => {
  const validatedId = validateId(itemId, 'Checklist Item ID');

  const validatedUpdates = {};
  if (updates.text !== undefined) {
    validatedUpdates.text = validateString(updates.text, 'Checklist item text', {
      minLength: 1,
      maxLength: 255,
    });
  }
  if (updates.done !== undefined) {
    if (typeof updates.done !== 'boolean') {
      throw new ValidationError('Done must be a boolean value');
    }
    validatedUpdates.done = updates.done;
  }

  // Verify item exists
  const existingItem = await prisma.checklistItem.findUnique({
    where: { id: validatedId },
  });

  if (!existingItem) {
    throw new NotFoundError(`Checklist item with ID "${validatedId}" not found`);
  }

  const item = await prisma.checklistItem.update({
    where: { id: validatedId },
    data: validatedUpdates,
  });

  return item;
};

/**
 * Delete a checklist item
 * @param {string} itemId - Checklist item ID
 * @returns {Promise<Object>} Success message
 */
const deleteChecklistItem = async (itemId) => {
  const validatedId = validateId(itemId, 'Checklist Item ID');

  // Verify item exists
  const item = await prisma.checklistItem.findUnique({
    where: { id: validatedId },
  });

  if (!item) {
    throw new NotFoundError(`Checklist item with ID "${validatedId}" not found`);
  }

  // Delete the item
  await prisma.checklistItem.delete({
    where: { id: validatedId },
  });

  return { success: true, message: 'Checklist item deleted successfully' };
};

/**
 * Get checklist progress for a card
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Progress object {total, completed, percentage}
 */
const getChecklistProgress = async (cardId) => {
  const validatedCardId = validateId(cardId, 'Card ID');

  const items = await prisma.checklistItem.findMany({
    where: { cardId: validatedCardId },
  });

  const completed = items.filter((item) => item.done).length;
  const total = items.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    percentage,
  };
};

module.exports = {
  createChecklistItem,
  getChecklistItemsByCardId,
  getChecklistItemById,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklistProgress,
};
